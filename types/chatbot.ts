/**
 * Chatbot message shapes. UI stays stable; the hook streams from
 * `POST /api/v1/chat/stream` while welcome copy stays local.
 */

export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

/** Slim history turn sent to the backend (no client-only fields). */
export type ChatApiMessage = {
  role: ChatRole;
  content: string;
};

export type ChatSuggestion = {
  id: string;
  label: string;
  /** Text sent when the suggestion is chosen (may match label). */
  value: string;
  variant?: "primary" | "outline";
};

export type ChatSendResult = {
  message: ChatMessage;
  suggestions?: ChatSuggestion[];
};

export type ChatStreamRequest = {
  message: string;
  conversation: ChatApiMessage[];
};

/**
 * SSE payloads from `/chat/stream`.
 * Backend emits `chunk`; `token` is accepted as an alias.
 */
export type ChatStreamEvent =
  | { type: "token"; content: string }
  | { type: "chunk"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type ChatStreamHandlers = {
  onToken: (content: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

/**
 * Optional welcome engine. Message sends always go through the streaming API.
 */
export type ChatEngine = {
  createWelcome: (locale: string) => ChatSendResult;
};
