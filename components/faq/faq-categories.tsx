"use client";

import { useTranslations } from "next-intl";
import { FAQ_CATEGORIES, type FaqCategoryFilter } from "@/config/faq";
import { cn } from "@/lib/utils";

function FaqCategories({
  activeCategory,
  onCategoryChange,
  className,
}: {
  activeCategory: FaqCategoryFilter;
  onCategoryChange: (category: FaqCategoryFilter) => void;
  className?: string;
}) {
  const t = useTranslations("faq.categories");

  return (
    <nav
      data-slot="faq-categories"
      aria-label={t("navLabel")}
      className={cn("w-full", className)}
    >
      <ul className="flex flex-wrap justify-center gap-2 md:gap-2.5">
        {FAQ_CATEGORIES.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onCategoryChange(category.id)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full px-3.5 py-2 font-sans text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-subtle"
                    : "bg-muted text-foreground/80 hover:bg-secondary hover:text-foreground"
                )}
              >
                {t(category.labelKey)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { FaqCategories };
