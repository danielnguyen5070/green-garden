"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FaqCategories } from "@/components/faq/faq-categories";
import { FaqHero } from "@/components/faq/faq-hero";
import { FaqList } from "@/components/faq/faq-list";
import { Container } from "@/components/layout/container";
import {
  FAQ_CATEGORY_IDS,
  FAQ_ITEMS,
  filterFaqItems,
  type FaqCategoryFilter,
  type FaqCategoryId,
  type FaqItemConfig,
} from "@/config/faq";
import { cn } from "@/lib/utils";

function getHashCategory(): FaqCategoryId | null {
  const hash = window.location.hash.slice(1);
  return (FAQ_CATEGORY_IDS as readonly string[]).includes(hash)
    ? (hash as FaqCategoryId)
    : null;
}

function matchesQuery(
  item: FaqItemConfig,
  query: string,
  getText: (id: string, field: "question" | "answer") => string
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const question = getText(item.id, "question").toLowerCase();
  const answer = getText(item.id, "answer").toLowerCase();

  return question.includes(normalized) || answer.includes(normalized);
}

function FaqContent({ className }: { className?: string }) {
  const tItems = useTranslations("faq.items");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<FaqCategoryFilter>("all");

  // Deep links like `/faq#delivery`; read after mount so `/faq` stays static.
  useEffect(() => {
    const syncFromHash = () => {
      const hashCategory = getHashCategory();
      if (hashCategory) setCategory(hashCategory);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const visibleItems = useMemo(() => {
    const byCategory = filterFaqItems(FAQ_ITEMS, category);

    return byCategory.filter((item) =>
      matchesQuery(item, searchQuery, (id, field) => tItems(`${id}.${field}`))
    );
  }, [category, searchQuery, tItems]);

  return (
    <div data-slot="faq-content" className={cn(className)}>
      <FaqHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <Container className="pb-4 md:pb-6">
        <FaqCategories
          activeCategory={category}
          onCategoryChange={setCategory}
        />
      </Container>

      <Container className="pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-[52rem]">
          <FaqList
            items={visibleItems}
            hasSearchQuery={searchQuery.trim().length > 0}
            onClearSearch={() => setSearchQuery("")}
          />
        </div>
      </Container>
    </div>
  );
}

export { FaqContent };
