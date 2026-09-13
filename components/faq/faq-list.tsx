"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { FaqItemConfig } from "@/config/faq";
import { cn } from "@/lib/utils";

function FaqList({
  items,
  hasSearchQuery,
  onClearSearch,
  className,
}: {
  items: FaqItemConfig[];
  hasSearchQuery: boolean;
  onClearSearch: () => void;
  className?: string;
}) {
  const t = useTranslations("faq");

  if (items.length === 0) {
    return (
      <div
        data-slot="faq-list-empty"
        className={cn("py-12 text-center md:py-16", className)}
      >
        <p className="font-sans text-body text-muted-foreground">{t("empty")}</p>
        {hasSearchQuery ? (
          <Button
            type="button"
            variant="outline"
            className="mt-5 h-10 rounded-xl px-4 font-sans text-sm"
            onClick={onClearSearch}
          >
            {t("clearSearch")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Accordion
      data-slot="faq-list"
      multiple
      className={cn("w-full", className)}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-border not-last:border-b"
        >
          <AccordionTrigger className="rounded-none py-5 font-sans text-base font-medium text-foreground hover:no-underline md:py-6 md:text-[1.05rem]">
            {t(`items.${item.id}.question`)}
          </AccordionTrigger>
          <AccordionContent className="pb-5 font-sans text-body text-muted-foreground md:pb-6">
            <p>{t(`items.${item.id}.answer`)}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export { FaqList };
