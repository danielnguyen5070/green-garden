"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { localizeText } from "@/lib/storefront";
import { getCatalogHref } from "@/lib/storefront/catalog";
import type { StorefrontCategory } from "@/types/storefront";
import { cn } from "@/lib/utils";

/**
 * Category chips are links to `/plants` and `/categories/{slug}` so every
 * category page is discoverable without JavaScript.
 */
function PlantFilters({
  categories,
  selected,
  className,
}: {
  categories: StorefrontCategory[];
  /** Active category `slug`, or null for the full catalog. */
  selected: string | null;
  className?: string;
}) {
  const t = useTranslations("home.products.categories");
  const locale = useLocale();

  const options = [
    { slug: null, label: t("all") },
    ...categories.map((category) => ({
      slug: category.slug,
      label: localizeText(category.name, category.name_vi, locale),
    })),
  ];

  return (
    <nav
      data-slot="plant-filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label={t("label")}
    >
      {options.map((option) => {
        const isActive = selected === option.slug;

        return (
          <Button
            key={option.slug ?? "all"}
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "h-9 rounded-full px-3.5 font-sans text-sm",
              !isActive && "bg-card text-foreground hover:bg-muted"
            )}
            aria-current={isActive ? "page" : undefined}
            render={<Link href={getCatalogHref(option.slug, 1)} />}
            nativeButton={false}
          >
            {option.label}
          </Button>
        );
      })}
    </nav>
  );
}

export { PlantFilters };
