import type {
  ChatEngine,
  ChatMessage,
  ChatSuggestion,
} from "@/types/chatbot";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function assistantMessage(content: string): ChatMessage {
  return {
    id: createId(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

type LocaleCopy = {
  welcome: string;
  welcomeSuggestions: ChatSuggestion[];
};

const COPY: Record<"en" | "vi", LocaleCopy> = {
  en: {
    welcome:
      "Hi! I'm Ngọc Ngân Bến Tre AI 🌿\nAsk me about seedlings, care tips, delivery, or what's in stock today.",
    welcomeSuggestions: [
      {
        id: "browse",
        label: "Show popular plants",
        value: "What are your most popular plants?",
        variant: "primary",
      },
      {
        id: "care",
        label: "Care tips",
        value: "How do I care for a new seedling?",
        variant: "outline",
      },
      {
        id: "shipping",
        label: "Shipping & COD",
        value: "How does shipping and cash on delivery work?",
        variant: "outline",
      },
    ],
  },
  vi: {
    welcome:
      "Xin chào! Mình là Ngọc Ngân Bến Tre AI 🌿\nBạn hỏi mình về cây giống, cách chăm, giao hàng, hoặc cây đang có nhé.",
    welcomeSuggestions: [
      {
        id: "browse",
        label: "Cây bán chạy",
        value: "Cây nào đang bán chạy?",
        variant: "primary",
      },
      {
        id: "care",
        label: "Mẹo chăm sóc",
        value: "Cách chăm cây giống mới mua?",
        variant: "outline",
      },
      {
        id: "shipping",
        label: "Giao hàng & COD",
        value: "Giao hàng và thanh toán khi nhận hàng thế nào?",
        variant: "outline",
      },
    ],
  },
};

function getCopy(locale: string): LocaleCopy {
  return locale === "vi" ? COPY.vi : COPY.en;
}

/**
 * Local welcome copy and quick-replies. Message replies stream from the API.
 */
export const mockChatEngine: ChatEngine = {
  createWelcome(locale) {
    const copy = getCopy(locale);
    return {
      message: assistantMessage(copy.welcome),
      suggestions: copy.welcomeSuggestions,
    };
  },
};
