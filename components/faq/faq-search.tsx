"use client";

import { useId } from "react";
import { SearchIcon } from "lucide-react";
import { useFaqBrowser } from "@/components/faq/faq-browser";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function FaqSearch({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  const { searchQuery, setSearchQuery } = useFaqBrowser();
  const searchId = useId();

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={searchId} className="sr-only">
        {placeholder}
      </label>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={searchId}
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-border bg-card pr-4 pl-10 font-sans text-sm shadow-subtle"
        autoComplete="off"
      />
    </div>
  );
}

export { FaqSearch };
