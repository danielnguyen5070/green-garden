"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/errors";
import { streamChat, toChatApiMessages } from "@/lib/api/chat";
import { mockChatEngine } from "@/lib/chatbot/mock-engine";
import type { ChatEngine, ChatMessage, ChatSuggestion } from "@/types/chatbot";

type UseChatbotOptions = {
  locale: string;
  engine?: ChatEngine;
};

type UseChatbotReturn = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  suggestions: ChatSuggestion[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  resetConversation: () => void;
};

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createUserMessage(content: string): ChatMessage {
  return {
    id: createId("user"),
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

function createAssistantMessage(content: string): ChatMessage {
  return {
    id: createId("assistant"),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

/**
 * UI-facing chat state. Welcome copy comes from `engine`; replies stream from
 * `POST /api/v1/chat/stream` with conversation held only in the browser.
 */
function useChatbot({
  locale,
  engine = mockChatEngine,
}: UseChatbotOptions): UseChatbotReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const localeRef = useRef(locale);
  const bootstrappedRef = useRef(false);
  const isStreamingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const bootstrap = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    isStreamingRef.current = false;

    const welcome = engine.createWelcome(localeRef.current);
    setMessages([welcome.message]);
    setSuggestions(welcome.suggestions ?? []);
    setIsTyping(false);
    bootstrappedRef.current = true;
  }, [engine]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!bootstrappedRef.current) {
      bootstrap();
    }
  }, [bootstrap]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => {
      const next = !current;
      if (next && !bootstrappedRef.current) {
        bootstrap();
      }
      return next;
    });
  }, [bootstrap]);

  const resetConversation = useCallback(() => {
    bootstrap();
  }, [bootstrap]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreamingRef.current) return;

    const userMessage = createUserMessage(trimmed);
    let priorMessages: ChatMessage[] = [];

    setMessages((current) => {
      priorMessages = current;
      return [...current, userMessage];
    });
    setSuggestions([]);
    setIsTyping(true);
    isStreamingRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    const assistantId = createId("assistant");
    let assistantStarted = false;
    let assembled = "";
    let terminalHandled = false;

    const ensureAssistantMessage = () => {
      if (assistantStarted) return;
      assistantStarted = true;
      setMessages((current) => [
        ...current,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    const appendToken = (token: string) => {
      ensureAssistantMessage();
      assembled += token;
      const nextContent = assembled;
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, content: nextContent }
            : message
        )
      );
    };

    const finishStream = () => {
      if (terminalHandled) return;
      terminalHandled = true;
      isStreamingRef.current = false;
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsTyping(false);
    };

    try {
      await streamChat(
        {
          message: trimmed,
          conversation: toChatApiMessages(priorMessages),
        },
        {
          signal: controller.signal,
          handlers: {
            onToken: appendToken,
            onDone: () => {
              if (!assembled.trim()) {
                ensureAssistantMessage();
                setMessages((current) =>
                  current.map((message) =>
                    message.id === assistantId
                      ? {
                          ...message,
                          content:
                            "Sorry, I could not generate a reply. Please try again.",
                        }
                      : message
                  )
                );
              }
              finishStream();
            },
            onError: (message) => {
              ensureAssistantMessage();
              assembled = message;
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantId
                    ? { ...item, content: message }
                    : item
                )
              );
              finishStream();
            },
          },
        }
      );
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) {
        finishStream();
        return;
      }

      const message = getErrorMessage(
        error,
        "Something went wrong. Please try again."
      );
      if (assistantStarted) {
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantId ? { ...item, content: message } : item
          )
        );
      } else {
        setMessages((current) => [...current, createAssistantMessage(message)]);
      }
      finishStream();
    }
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    messages,
    suggestions,
    isTyping,
    sendMessage,
    resetConversation,
  };
}

export { useChatbot };
