"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PlantFilters({
  categories,
  selected,
  onSelect,
  className,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
}) {
  const t = useTranslations("home.products.categories");

  const options = ["all", ...categories];

  return (
    <div
      data-slot="plant-filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label={t("label")}
    >
      {options.map((category) => {
        const isActive = selected === category;
        const label = t.has(category) ? t(category) : category;

        return (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "h-9 rounded-full px-3.5 font-sans text-sm",
              !isActive && "bg-card text-foreground hover:bg-muted"
            )}
            aria-pressed={isActive}
            onClick={() => onSelect(category)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

export { PlantFilters };
