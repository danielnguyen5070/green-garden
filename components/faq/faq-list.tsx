"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useFaqBrowser } from "@/components/faq/faq-browser";
import { filterFaqItems, type FaqEntry } from "@/config/faq";
import { cn } from "@/lib/utils";

function matchesQuery(item: FaqEntry, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    item.question.toLowerCase().includes(normalized) ||
    item.answer.toLowerCase().includes(normalized)
  );
}

function FaqList({
  items,
  emptyLabel,
  clearSearchLabel,
  className,
}: {
  items: readonly FaqEntry[];
  emptyLabel: string;
  clearSearchLabel: string;
  className?: string;
}) {
  const { searchQuery, setSearchQuery, category } = useFaqBrowser();

  const visibleItems = useMemo(
    () =>
      filterFaqItems(items, category).filter((item) =>
        matchesQuery(item, searchQuery)
      ),
    [items, category, searchQuery]
  );

  if (visibleItems.length === 0) {
    return (
      <div
        data-slot="faq-list-empty"
        className={cn("py-12 text-center md:py-16", className)}
      >
        <p className="font-sans text-body text-muted-foreground">
          {emptyLabel}
        </p>
        {searchQuery.trim().length > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="mt-5 h-10 rounded-xl px-4 font-sans text-sm"
            onClick={() => setSearchQuery("")}
          >
            {clearSearchLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  // Closed answers stay in the HTML (hidden="until-found") so crawlers and
  // find-in-page see every answer the FAQPage JSON-LD lists.
  return (
    <Accordion
      data-slot="faq-list"
      multiple
      hiddenUntilFound
      className={cn("w-full", className)}
    >
      {visibleItems.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-border not-last:border-b"
        >
          <AccordionTrigger className="rounded-none py-5 font-sans text-base font-medium text-foreground hover:no-underline md:py-6 md:text-[1.05rem]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 font-sans text-body text-muted-foreground md:pb-6">
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export { FaqList };
