"use client";

import { MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ChatFab({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="icon-lg"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-14 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]",
        "transition-transform duration-200 hover:scale-105 hover:bg-brand-deep",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "md:size-16",
        className
      )}
    >
      <MessageCircleIcon className="size-6 stroke-[1.75] md:size-7" />
    </Button>
  );
}

export { ChatFab };
