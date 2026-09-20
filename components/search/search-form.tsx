"use client";

import { type FormEvent, useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function SearchForm({
  query,
  className,
}: {
  /** Current URL `q` value — source of truth after navigation. */
  query: string;
  className?: string;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = value.trim();
    if (!keyword) return;

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-xl", className)}
    >
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor={inputId} className="sr-only">
        {t("searchLabel")}
      </label>
      <input
        id={inputId}
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("searchPlaceholder")}
        autoComplete="off"
        className={cn(
          "h-11 w-full rounded-full border border-border bg-card py-2 pr-4 pl-10 font-sans text-sm text-foreground shadow-subtle outline-none placeholder:text-muted-foreground",
          "transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      />
    </form>
  );
}

export { SearchForm };
