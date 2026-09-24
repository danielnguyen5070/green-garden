import { getApiUrl } from "@/lib/api/config";
import { ApiError, parseApiErrorPayload } from "@/lib/api/errors";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSseEvent(raw: string): ChatStreamEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.type !== "string") {
      return null;
    }

    if (parsed.type === "token" || parsed.type === "chunk") {
      const content = typeof parsed.content === "string" ? parsed.content : "";
      return { type: parsed.type, content };
    }

    if (parsed.type === "done") {
      return { type: "done" };
    }

    if (parsed.type === "error") {
      const message =
        typeof parsed.message === "string" && parsed.message.trim()
          ? parsed.message
          : typeof parsed.content === "string" && parsed.content.trim()
            ? parsed.content
            : "Chat request failed";
      return { type: "error", message };
    }

    return null;
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

async function parseErrorResponse(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const payload: unknown = await response.json();
      return parseApiErrorPayload(response.status, payload);
    } catch {
      // Fall through to status default.
    }
  }

  return parseApiErrorPayload(response.status, null);
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
    throw await parseErrorResponse(response);
  }

  if (!response.body) {
    throw new Error("Chat stream is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  const handleEvent = (event: ChatStreamEvent) => {
    if (finished) return;

    if (event.type === "token" || event.type === "chunk") {
      if (event.content) {
        handlers.onToken(event.content);
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
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}
