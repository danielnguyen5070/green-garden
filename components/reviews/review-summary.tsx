"use client";

import { useTranslations } from "next-intl";
import { ReviewStars } from "@/components/reviews/review-stars";
import type { StorefrontReviewSummary } from "@/types/storefront-review";
import { cn } from "@/lib/utils";

function ReviewSummary({
  summary,
  className,
}: {
  summary: StorefrontReviewSummary;
  className?: string;
}) {
  const t = useTranslations("reviews");
  const maxCount = Math.max(
    1,
    ...Object.values(summary.rating_distribution)
  );

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

      <div className="flex flex-col justify-center gap-2" aria-label={t("distributionLabel")}>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = summary.rating_distribution[star];
          const widthPercent =
            summary.total_reviews === 0
              ? 0
              : Math.round((count / maxCount) * 100);

          return (
            <div key={star} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-3">
              <span className="font-sans text-small text-muted-foreground tabular-nums">
                {t("starRow", { rating: star })}
              </span>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-warning transition-[width] duration-300"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="text-right font-sans text-small text-muted-foreground tabular-nums">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ReviewSummary };
