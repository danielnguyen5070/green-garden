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
  const maxCount = Math.max(1, ...Object.values(summary.rating_distribution));

  return (
    <div
      data-slot="review-summary"
      className={cn(
        "grid gap-8 rounded-2xl border border-border bg-card p-5 shadow-subtle md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10 md:p-6",
        className
      )}
    >
      <div className="flex flex-col items-start">
        <p className="font-heading text-4xl font-bold tracking-tight text-foreground tabular-nums">
          {summary.total_reviews === 0
            ? "—"
            : summary.average_rating.toFixed(1)}
        </p>
        <ReviewStars
          rating={summary.average_rating}
          size="lg"
          className="mt-2"
          label={t("averageRatingLabel", {
            rating: summary.average_rating.toFixed(1),
          })}
        />
        <p className="mt-3 font-sans text-small text-muted-foreground">
          {t("basedOn", { count: summary.total_reviews })}
        </p>
      </div>

      <div
        className="flex flex-col justify-center gap-1.5"
        role="group"
        aria-label={t("distributionLabel")}
      >
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = summary.rating_distribution[star];
          const widthPercent =
            summary.total_reviews === 0
              ? 0
              : Math.round((count / maxCount) * 100);
          const isActive = selectedRating === star;
          const isDisabled = count === 0;

          return (
            <button
              key={star}
              type="button"
              disabled={isDisabled}
              aria-pressed={isActive}
              aria-label={t("filterByRating", { rating: star, count })}
              onClick={() => {
                onSelectRating(isActive ? null : star);
              }}
              className={cn(
                "grid grid-cols-[2.5rem_1fr_2rem] items-center gap-3 rounded-lg px-2 py-1.5 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isDisabled && "cursor-not-allowed opacity-50",
                !isDisabled && "hover:bg-muted/70",
                isActive && "bg-muted"
              )}
            >
              <span
                className={cn(
                  "font-sans text-small tabular-nums",
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t("starRow", { rating: star })}
              </span>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300",
                    isActive ? "bg-primary" : "bg-warning"
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-right font-sans text-small tabular-nums",
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ReviewSummary };
