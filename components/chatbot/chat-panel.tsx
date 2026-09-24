"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChatHeader } from "@/components/chatbot/chat-header";
import { ChatInput } from "@/components/chatbot/chat-input";
import {
  ChatMessageBubble,
  ChatTypingIndicator,
} from "@/components/chatbot/chat-message-bubble";
import { ChatQuickReplies } from "@/components/chatbot/chat-quick-replies";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatSuggestion } from "@/types/chatbot";

function formatChatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ChatPanel({
  messages,
  suggestions,
  isTyping,
  onSend,
  onSelectSuggestion,
  onRefresh,
  onMinimize,
  onClose,
  className,
}: {
  messages: ChatMessage[];
  suggestions: ChatSuggestion[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onSelectSuggestion: (suggestion: ChatSuggestion) => void;
  onRefresh: () => void;
  onMinimize: () => void;
  onClose: () => void;
  className?: string;
}) {
  const t = useTranslations("chatbot");
  const locale = useLocale();
  const listRef = useRef<HTMLDivElement>(null);

  const dateLabel = useMemo(() => {
    const first = messages[0];
    if (!first) {
      return formatChatDate(new Date().toISOString(), locale);
    }
    return formatChatDate(first.createdAt, locale);
  }, [messages, locale]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isTyping, suggestions]);

  return (
    <section
      data-slot="chat-panel"
      role="dialog"
      aria-modal="false"
      aria-label={t("title")}
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]",
        className
      )}
    >
      <ChatHeader
        title={t("title")}
        onlineLabel={t("online")}
        refreshLabel={t("refresh")}
        minimizeLabel={t("minimize")}
        closeLabel={t("close")}
        onRefresh={onRefresh}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
      >
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <p className="shrink-0 font-sans text-[0.6875rem] text-muted-foreground">
            {dateLabel}
          </p>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
          {isTyping && messages[messages.length - 1]?.role === "user" ? (
            <ChatTypingIndicator label={t("typing")} />
          ) : null}
        </div>

        <ChatQuickReplies
          suggestions={suggestions}
          disabled={isTyping}
          onSelect={onSelectSuggestion}
          className="pt-1"
        />
      </div>

      <ChatInput
        placeholder={t("placeholder")}
        sendLabel={t("send")}
        disabled={isTyping}
        onSend={onSend}
      />
    </section>
  );
}

export { ChatPanel };
