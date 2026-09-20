"use client";

import { useLocale, useTranslations } from "next-intl";
import { ReviewStars } from "@/components/reviews/review-stars";
import {
  formatRelativeReviewDate,
  splitReviewContent,
} from "@/lib/reviews";
import type { StorefrontReview } from "@/types/storefront-review";
import { cn } from "@/lib/utils";

function ReviewCard({
  review,
  className,
}: {
  review: StorefrontReview;
  className?: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const { title, body } = splitReviewContent(review.content);

  return (
    <article
      data-slot="review-card"
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6",
        className
      )}
    >
      <ReviewStars
        rating={review.rating}
        label={t("ratingLabel", { rating: review.rating })}
      />

      {title ? (
        <h3 className="mt-3 font-heading text-base font-bold tracking-tight text-foreground md:text-lg">
          {title}
        </h3>
      ) : null}

      <p
        className={cn(
          "whitespace-pre-wrap font-sans text-body text-muted-foreground",
          title ? "mt-2" : "mt-3"
        )}
      >
        {body}
      </p>

      <footer className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="font-sans text-sm font-semibold text-foreground">
          {review.name}
        </p>
        <time
          dateTime={review.created_at}
          className="font-sans text-small text-muted-foreground"
        >
          {formatRelativeReviewDate(review.created_at, locale)}
        </time>
      </footer>
    </article>
  );
}

export { ReviewCard };
