"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ChatInput({
  placeholder,
  sendLabel,
  disabled,
  onSend,
  className,
}: {
  placeholder: string;
  sendLabel: string;
  disabled?: boolean;
  onSend: (text: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      data-slot="chat-input"
      onSubmit={handleSubmit}
      className={cn(
        "shrink-0 border-t border-border px-3 pt-3 pb-3 sm:px-4",
        className
      )}
    >
      <div className="flex items-end gap-2 rounded-full border border-input bg-background px-2 py-1.5 shadow-subtle focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          aria-label={placeholder}
          className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon-sm"
          disabled={disabled || !value.trim()}
          aria-label={sendLabel}
          className="mb-0.5 size-8 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-brand-deep disabled:opacity-40"
        >
          <SendIcon className="size-3.5 stroke-[1.75]" />
        </Button>
      </div>
    </form>
  );
}

export { ChatInput };
