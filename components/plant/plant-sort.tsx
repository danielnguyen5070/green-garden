"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StorefrontPlantSortOption } from "@/types/storefront";
import { cn } from "@/lib/utils";

/** Mirrors what `GET /storefront/plants` can actually sort by. */
const SORT_OPTIONS: StorefrontPlantSortOption[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
];

function PlantSort({
  value,
  onChange,
  className,
}: {
  value: StorefrontPlantSortOption;
  onChange: (value: StorefrontPlantSortOption) => void;
  className?: string;
}) {
  const t = useTranslations("home.products");

  return (
    <div
      data-slot="plant-sort"
      className={cn("flex items-center gap-2", className)}
    >
      <span className="font-sans text-small text-muted-foreground">
        {t("sortLabel")}
      </span>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next != null) onChange(next as StorefrontPlantSortOption);
        }}
      >
        <SelectTrigger
          aria-label={t("sortLabel")}
          className="h-9 min-w-[11.5rem] rounded-full border-border bg-card px-3.5 font-sans text-sm"
        >
          <SelectValue>{t(`sort.${value}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="min-w-[11.5rem]">
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option} className="font-sans">
              {t(`sort.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { PlantSort };
