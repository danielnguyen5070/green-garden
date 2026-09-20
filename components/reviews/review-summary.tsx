"use client";

import { useTranslations } from "next-intl";
import { ReviewStars } from "@/components/reviews/review-stars";
import type { StorefrontReviewSummary } from "@/types/storefront-review";
import { cn } from "@/lib/utils";

function ReviewSummary({
  summary,
  selectedRating,
  onSelectRating,
  className,
}: {
  summary: StorefrontReviewSummary;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  className?: string;
}) {
  const t = useTranslations("reviews");

  const chips: { rating: number | null; count: number; label: string }[] = [
    {
      rating: null,
      count: summary.total_reviews,
      label: t("filterAll", { count: summary.total_reviews }),
    },
    ...([5, 4, 3, 2, 1] as const).map((rating) => ({
      rating,
      count: summary.rating_distribution[rating],
      label: t("filterStars", {
        rating,
        count: summary.rating_distribution[rating],
      }),
    })),
  ];

  return (
    <div
      data-slot="review-summary"
      className={cn(
        "rounded-md border border-border bg-card p-5 shadow-subtle md:p-6",
        className
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-heading text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {summary.total_reviews === 0
              ? "—"
              : summary.average_rating.toFixed(1)}
          </p>
          <div className="min-w-0">
            <ReviewStars
              rating={summary.average_rating}
              size="md"
              label={t("averageRatingLabel", {
                rating: summary.average_rating.toFixed(1),
              })}
            />
            <p className="mt-1.5 font-sans text-small text-muted-foreground">
              {t("basedOn", { count: summary.total_reviews })}
            </p>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2.5 lg:justify-end"
          role="group"
          aria-label={t("distributionLabel")}
        >
          {chips.map((chip) => {
            const isActive = selectedRating === chip.rating;
            const isDisabled = chip.rating != null && chip.count === 0;

            return (
              <button
                key={chip.rating ?? "all"}
                type="button"
                disabled={isDisabled}
                aria-pressed={isActive}
                aria-label={
                  chip.rating == null
                    ? t("filterAll", { count: chip.count })
                    : t("filterByRating", {
                        rating: chip.rating,
                        count: chip.count,
                      })
                }
                onClick={() => {
                  onSelectRating(chip.rating);
                }}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded border px-3.5 font-sans text-sm whitespace-nowrap transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isDisabled && "cursor-not-allowed opacity-45",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted/70"
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { ReviewSummary };
