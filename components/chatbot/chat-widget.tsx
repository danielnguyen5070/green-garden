"use client";

import { lazy, Suspense, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChatFab } from "@/components/chatbot/chat-fab";
import { useChatbot } from "@/hooks/use-chatbot";
import { cn } from "@/lib/utils";
import type { ChatEngine, ChatSuggestion } from "@/types/chatbot";

// The panel pulls in the markdown renderer; keep it out of first-load JS.
// `React.lazy` rather than `next/dynamic`: the latter made Turbopack duplicate
// shared modules into the checkout bundle. The panel only renders after a
// click, so it never needs SSR.
const loadChatPanel = () => import("@/components/chatbot/chat-panel");

const ChatPanel = lazy(() =>
  loadChatPanel().then((m) => ({ default: m.ChatPanel }))
);

function prefetchChatPanel() {
  void loadChatPanel();
}

/**
 * Floating storefront chatbot. Replies stream from `/api/v1/chat/stream`;
 * optional `engine` only customizes the local welcome message.
 */
function ChatWidget({
  engine,
  className,
}: {
  engine?: ChatEngine;
  className?: string;
}) {
  const t = useTranslations("chatbot");
  const locale = useLocale();
  const {
    isOpen,
    open,
    close,
    messages,
    suggestions,
    isTyping,
    sendMessage,
    resetConversation,
  } = useChatbot({ locale, engine });

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  function handleSuggestion(suggestion: ChatSuggestion) {
    void sendMessage(suggestion.value);
  }

  return (
    <div
      data-slot="chat-widget"
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-[46] flex flex-col items-end gap-3 md:right-6 md:bottom-6",
        className
      )}
    >
      {isOpen ? (
        <div
          className={cn(
            "pointer-events-auto w-[min(100vw-2rem,24rem)]",
            "h-[min(100dvh-5.5rem,34rem)] sm:h-[min(100dvh-6.5rem,36rem)]",
            "origin-bottom-right animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          <Suspense
            fallback={
              <div className="h-full rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]" />
            }
          >
            <ChatPanel
              messages={messages}
              suggestions={suggestions}
              isTyping={isTyping}
              onSend={(text) => void sendMessage(text)}
              onSelectSuggestion={handleSuggestion}
              onRefresh={resetConversation}
              onMinimize={close}
              onClose={close}
              className="h-full"
            />
          </Suspense>
        </div>
      ) : null}

      {!isOpen ? (
        <div className="pointer-events-auto">
          <ChatFab
            label={t("open")}
            onClick={open}
            onIntent={prefetchChatPanel}
          />
        </div>
      ) : null}
    </div>
  );
}

export { ChatWidget };
