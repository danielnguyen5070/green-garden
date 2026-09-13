"use client";

import { useLocale, useTranslations } from "next-intl";
import { StarIcon } from "lucide-react";
import { formatCartMoney } from "@/lib/cart";
import { cn } from "@/lib/utils";
import type { Plant } from "@/types/plant";

function PlantRating({
  rating = 0,
  reviewCount = 0,
  className,
}: {
  rating?: number;
  reviewCount?: number;
  className?: string;
}) {
  const t = useTranslations("plantDetail");
  const filled = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <div
      data-slot="plant-rating"
      className={cn("flex items-center gap-2", className)}
    >
      <div
        className="flex items-center gap-0.5"
        aria-label={t("ratingLabel", { rating: filled })}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            className={cn(
              "size-3.5",
              index < filled
                ? "fill-primary text-primary"
                : "fill-transparent text-border",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="font-sans text-small text-muted-foreground">
        ({reviewCount})
      </span>
    </div>
  );
}

function PlantInfo({
  plant,
  className,
}: {
  plant: Plant;
  className?: string;
}) {
  const locale = useLocale();
  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <div data-slot="plant-info" className={cn(className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2">
            {plant.name}
          </h1>
          {plant.scientificName ? (
            <p className="mt-1.5 font-sans text-sm text-muted-foreground italic">
              {plant.scientificName}
            </p>
          ) : null}
        </div>
        <PlantRating
          rating={plant.rating}
          reviewCount={plant.reviewCount}
          className="shrink-0 pt-1"
        />
      </div>

      <p className="mt-5 font-sans text-xl font-semibold tracking-tight text-foreground">
        {formatCartMoney(plant.price, moneyLocale)}
      </p>

      <p className="mt-4 max-w-xl font-sans text-body leading-relaxed text-muted-foreground">
        {plant.longDescription ?? plant.description}
      </p>
    </div>
  );
}

export { PlantInfo, PlantRating };
