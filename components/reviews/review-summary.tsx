"use client";

import { useTranslations } from "next-intl";
import { LeafIcon, PencilIcon } from "lucide-react";
import { ReviewStars } from "@/components/reviews/review-stars";
import { Button } from "@/components/ui/button";
import type { StorefrontReviewSummary } from "@/types/storefront-review";
import { cn } from "@/lib/utils";

function ReviewSummary({
  summary,
  selectedRating,
  onSelectRating,
  onWriteReview,
  className,
}: {
  summary: StorefrontReviewSummary;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  onWriteReview: () => void;
  className?: string;
}) {
  const t = useTranslations("reviews");
  const maxCount = Math.max(1, ...Object.values(summary.rating_distribution));

  return (
    <div
      data-slot="review-summary"
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6 lg:p-7",
        className
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,16rem)] lg:items-stretch lg:gap-8 xl:gap-10">
        {/* Overall score + primary CTA */}
        <div className="flex flex-col items-start">
          <p className="font-heading text-5xl font-bold tracking-tight text-foreground tabular-nums">
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
          <Button
            type="button"
            className="mt-5 h-10 rounded-xl px-4"
            onClick={onWriteReview}
          >
            <PencilIcon data-icon="inline-start" className="size-3.5" />
            {t("writeReview")}
          </Button>
        </div>

        {/* Interactive distribution */}
        <div
          className="flex flex-col justify-center gap-1 border-border lg:border-x lg:px-6 xl:px-8"
          role="group"
          aria-label={t("distributionLabel")}
        >
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.rating_distribution[star];
            const percent =
              summary.total_reviews === 0
                ? 0
                : Math.round((count / summary.total_reviews) * 100);
            const barWidth =
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
                  "grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-left outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isDisabled && "cursor-not-allowed opacity-45",
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
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-warning transition-[width] duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "min-w-[4.5rem] text-right font-sans text-small tabular-nums",
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {t("distributionCount", { count, percent })}
                </span>
              </button>
            );
          })}
        </div>

        {/* Share CTA panel */}
        <aside className="flex flex-col rounded-2xl bg-secondary/70 p-5">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LeafIcon className="size-4 stroke-[1.75]" aria-hidden="true" />
          </span>
          <h2 className="mt-3 font-heading text-base font-bold tracking-tight text-foreground">
            {t("cta.title")}
          </h2>
          <p className="mt-2 flex-1 font-sans text-small leading-relaxed text-muted-foreground">
            {t("cta.description")}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-5 h-10 rounded-xl border border-border/60 bg-card/90 px-4 text-foreground hover:bg-card"
            onClick={onWriteReview}
          >
            <PencilIcon data-icon="inline-start" className="size-3.5" />
            {t("cta.button")}
          </Button>
        </aside>
      </div>
    </div>
  );
}

export { ReviewSummary };
