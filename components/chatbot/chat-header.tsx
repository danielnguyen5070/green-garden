"use client";

import Image from "next/image";
import { MinusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ChatHeader({
  title,
  onlineLabel,
  refreshLabel,
  minimizeLabel,
  closeLabel,
  onRefresh,
  onMinimize,
  onClose,
  className,
}: {
  title: string;
  onlineLabel: string;
  refreshLabel: string;
  minimizeLabel: string;
  closeLabel: string;
  onRefresh: () => void;
  onMinimize: () => void;
  onClose: () => void;
  className?: string;
}) {
  return (
    <header
      data-slot="chat-header"
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
          <Image
            src="/images/logo-mark2.png"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
            className="size-7"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold tracking-tight text-foreground sm:text-[0.9375rem]">
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[0.75rem] text-muted-foreground">
            <span
              className="size-1.5 shrink-0 rounded-full bg-success"
              aria-hidden="true"
            />
            {onlineLabel}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={refreshLabel}
          onClick={onRefresh}
        >
          <RotateCcwIcon className="size-4 stroke-[1.5]" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground hover:text-foreground max-sm:hidden"
          aria-label={minimizeLabel}
          onClick={onMinimize}
        >
          <MinusIcon className="size-4 stroke-[1.5]" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <XIcon className="size-4 stroke-[1.5]" />
        </Button>
      </div>
    </header>
  );
}

export { ChatHeader };
