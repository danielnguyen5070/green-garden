import { z } from "zod";
import { getApiUrl } from "@/lib/api/config";
import { parseApiError } from "@/lib/api/errors";
import type {
  ChatApiMessage,
  ChatStreamEvent,
  ChatStreamHandlers,
  ChatStreamRequest,
} from "@/types/chatbot";

type StreamChatOptions = {
  signal?: AbortSignal;
  handlers: ChatStreamHandlers;
};

/** DeepSeek tool-call markup, e.g. `<｜DSML｜invoke ...>` or `<｜tool▁calls▁begin｜>`. */
const TOOL_MARKUP_RE = /<\s*\/?\s*[|｜]+\s*(?:DSML|tool)/i;
const PARTIAL_MARKUP_RE = /<\s*\/?\s*([|｜]*)\s*([A-Za-z]{0,4})$/;
const MARKUP_WORDS = ["dsml", "tool"];

/** Remove everything from the first tool-call marker onward. */
export function stripToolMarkup(text: string): string {
  const match = TOOL_MARKUP_RE.exec(text);
  return match ? text.slice(0, match.index) : text;
}

function partialMarkupStart(text: string): number {
  const index = text.lastIndexOf("<");
  if (index === -1) return -1;
  const match = PARTIAL_MARKUP_RE.exec(text.slice(index));
  if (!match || match.index !== 0) return -1;
  const [, bars, word] = match;
  const lowered = word.toLowerCase();
  if (lowered && (!bars || !MARKUP_WORDS.some((w) => w.startsWith(lowered)))) {
    return -1;
  }
  return index;
}

/**
 * Streaming filter that drops tool-call markup split across tokens. Once a
 * marker is seen, the rest of the stream is suppressed.
 */
export function createToolMarkupFilter() {
  let pending = "";
  let suppressed = false;

  return {
    push(token: string): string {
      if (suppressed) return "";
      const text = pending + token;
      pending = "";

      const match = TOOL_MARKUP_RE.exec(text);
      if (match) {
        suppressed = true;
        return text.slice(0, match.index);
      }

      const holdFrom = partialMarkupStart(text);
      if (holdFrom !== -1) {
        pending = text.slice(holdFrom);
        return text.slice(0, holdFrom);
      }
      return text;
    },
    flush(): string {
      const rest = suppressed ? "" : pending;
      pending = "";
      return rest;
    },
  };
}

const sseTokenSchema = z.object({
  type: z.enum(["token", "chunk"]),
  content: z.string().optional(),
});

const sseDoneSchema = z.object({
  type: z.literal("done"),
});

const sseErrorSchema = z.object({
  type: z.literal("error"),
  message: z.string().optional(),
  content: z.string().optional(),
});

const sseEventSchema = z.union([sseTokenSchema, sseDoneSchema, sseErrorSchema]);

function parseSseEvent(raw: string): ChatStreamEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = sseEventSchema.safeParse(parsed);
    if (!result.success) return null;

    const event = result.data;
    switch (event.type) {
      case "token":
      case "chunk":
        return { type: event.type, content: event.content ?? "" };
      case "done":
        return { type: "done" };
      case "error": {
        const message =
          typeof event.message === "string" && event.message.trim()
            ? event.message
            : typeof event.content === "string" && event.content.trim()
              ? event.content
              : "Chat request failed";
        return { type: "error", message };
      }
    }
  } catch {
    return null;
  }
}

/**
 * Extract JSON payloads from SSE `data:` frames. Frames are delimited by a
 * blank line; a partial frame may remain in the buffer across reads.
 */
function consumeSseBuffer(
  buffer: string,
  onEvent: (event: ChatStreamEvent) => void
): string {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    const lines = part.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const raw = trimmed.slice("data:".length).trim();
      if (!raw || raw === "[DONE]") continue;
      const event = parseSseEvent(raw);
      if (event) onEvent(event);
    }
  }

  return rest;
}

/**
 * POST `/api/v1/chat/stream` and deliver SSE events via callbacks.
 * Conversation history stays client-side; the browser never talks to DeepSeek.
 */
export async function streamChat(
  request: ChatStreamRequest,
  options: StreamChatOptions
): Promise<void> {
  const { signal, handlers } = options;

  let response: Response;
  try {
    response = await fetch(getApiUrl("/chat/stream"), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: request.message,
        conversation: request.conversation,
      } satisfies ChatStreamRequest),
      signal,
    });
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
      throw error instanceof Error ? error : new DOMException("Aborted", "AbortError");
    }
    throw new Error("Unable to reach the chat service. Please try again.");
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (!response.body) {
    throw new Error("Chat stream is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  const markupFilter = createToolMarkupFilter();

  const flushMarkupFilter = () => {
    const rest = markupFilter.flush();
    if (rest) handlers.onToken(rest);
  };

  const handleEvent = (event: ChatStreamEvent) => {
    if (finished) return;

    if (event.type === "token" || event.type === "chunk") {
      const safe = event.content ? markupFilter.push(event.content) : "";
      if (safe) {
        handlers.onToken(safe);
      }
      return;
    }

    if (event.type === "error") {
      finished = true;
      handlers.onError(event.message);
      return;
    }

    if (event.type === "done") {
      finished = true;
      flushMarkupFilter();
      handlers.onDone();
    }
  };

  try {
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = consumeSseBuffer(buffer, handleEvent);
    }

    if (!finished && buffer.trim()) {
      buffer = consumeSseBuffer(`${buffer}\n\n`, handleEvent);
    }

    if (!finished) {
      // Stream closed without a terminal event — treat as complete.
      flushMarkupFilter();
      handlers.onDone();
    }
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
      throw error instanceof Error ? error : new DOMException("Aborted", "AbortError");
    }
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/** Map UI messages to the slim `{ role, content }` shape the API expects. */
export function toChatApiMessages(
  messages: Array<{ role: ChatApiMessage["role"]; content: string }>
): ChatApiMessage[] {
  return messages
    .map((message) => ({
      role: message.role,
      content: (message.role === "assistant"
        ? stripToolMarkup(message.content)
        : message.content
      ).trim(),
    }))
    .filter((message) => message.content.length > 0);
}
