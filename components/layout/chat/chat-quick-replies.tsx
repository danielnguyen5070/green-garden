"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/types/chatbot";

function ChatQuickReplies({
  suggestions,
  disabled,
  onSelect,
  className,
}: {
  suggestions: ChatSuggestion[];
  disabled?: boolean;
  onSelect: (suggestion: ChatSuggestion) => void;
  className?: string;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div
      data-slot="chat-quick-replies"
      className={cn("flex flex-wrap justify-end gap-2", className)}
    >
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          type="button"
          variant={suggestion.variant === "primary" ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 rounded-full px-3.5 font-sans text-xs font-medium",
            suggestion.variant === "primary"
              ? "bg-primary text-primary-foreground hover:bg-brand-deep"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
}

export { ChatQuickReplies };
