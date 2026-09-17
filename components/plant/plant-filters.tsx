"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ALL_CATEGORIES } from "@/hooks/use-storefront-plants";
import { localizeText } from "@/lib/storefront";
import type { StorefrontCategory } from "@/types/storefront";
import { cn } from "@/lib/utils";

function PlantFilters({
  categories,
  selected,
  onSelect,
  className,
}: {
  categories: StorefrontCategory[];
  /** Category `slug`, or `all`. Ids never surface on the public site. */
  selected: string;
  onSelect: (slug: string) => void;
  className?: string;
}) {
  const t = useTranslations("home.products.categories");
  const locale = useLocale();

  const options = [
    { slug: ALL_CATEGORIES, label: t("all") },
    ...categories.map((category) => ({
      slug: category.slug,
      label: localizeText(category.name, category.name_vi, locale),
    })),
  ];

  return (
    <div
      data-slot="plant-filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label={t("label")}
    >
      {options.map((option) => {
        const isActive = selected === option.slug;

        return (
          <Button
            key={option.slug}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "h-9 rounded-full px-3.5 font-sans text-sm",
              !isActive && "bg-card text-foreground hover:bg-muted"
            )}
            aria-pressed={isActive}
            onClick={() => onSelect(option.slug)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

export { PlantFilters };
