"use client";

import { ChatMarkdown } from "@/components/chatbot/chat-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chatbot";

function ChatMessageBubble({
  message,
  className,
}: {
  message: ChatMessage;
  className?: string;
}) {
  const isUser = message.role === "user";

  return (
    <div
      data-slot="chat-message"
      data-role={message.role}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%] font-sans text-small leading-relaxed",
          isUser
            ? "whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-primary-foreground"
            : "rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-foreground"
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <ChatMarkdown content={message.content} />
        )}
      </div>
    </div>
  );
}

function ChatTypingIndicator({ label }: { label: string }) {
  return (
    <div
      className="flex justify-start"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  );
}

export { ChatMessageBubble, ChatTypingIndicator };
