"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a CSS hover/focus menu. Client navigation keeps the pointer over the
 * menu and focus on the clicked link, so `data-closed` forces the panel shut
 * until the pointer leaves or focus moves back in.
 */
function HoverMenu({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [closed, setClosed] = useState(false);

  return (
    <div
      data-closed={closed ? "" : undefined}
      className={cn("group", className)}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("a")) return;
        setClosed(true);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }}
      onFocus={() => setClosed(false)}
      onPointerLeave={() => setClosed(false)}
    >
      {children}
    </div>
  );
}

export { HoverMenu };
