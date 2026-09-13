"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

function FaqHero({
  searchQuery,
  onSearchChange,
  className,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  className?: string;
}) {
  const t = useTranslations("faq.hero");
  const searchId = useId();

  return (
    <section
      data-slot="faq-hero"
      aria-labelledby="faq-hero-heading"
      className={cn("bg-background", className)}
    >
      <Container className="pt-10 pb-8 md:pt-14 md:pb-10 lg:pt-16 lg:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1.5 font-sans text-[0.6875rem] font-semibold tracking-[0.14em] text-accent uppercase">
            {t("eyebrow")}
          </span>

          <h1
            id="faq-hero-heading"
            className="mt-5 font-heading text-h2 font-bold tracking-tight text-foreground md:mt-6 md:text-h1"
          >
            {t("title")}
          </h1>

          <p className="mx-auto mt-4 max-w-xl font-sans text-body text-muted-foreground">
            {t("description")}
          </p>

          <div className="relative mx-auto mt-8 max-w-md">
            <label htmlFor={searchId} className="sr-only">
              {t("searchPlaceholder")}
            </label>
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 rounded-xl border-border bg-card pr-4 pl-10 font-sans text-sm shadow-subtle"
              autoComplete="off"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

export { FaqHero };
