"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ReviewFormDialog } from "@/components/reviews/review-form-dialog";
import { ReviewMasonryList } from "@/components/reviews/review-masonry-list";
import { ReviewSummary } from "@/components/reviews/review-summary";
import { Button } from "@/components/ui/button";
import {
  STOREFRONT_REVIEWS_PAGE_SIZE,
  getStorefrontReviews,
} from "@/lib/api/storefront";
import { ApiError } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import type {
  StorefrontReview,
  StorefrontReviewSummary,
} from "@/types/storefront-review";

function ReviewsSection({
  initialReviews,
  initialTotal,
  summary,
}: {
  initialReviews: StorefrontReview[];
  initialTotal: number;
  summary: StorefrontReviewSummary;
}) {
  const t = useTranslations("reviews");
  const tErrors = useTranslations("reviews.errors");

  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const visibleReviews = useMemo(() => {
    if (selectedRating == null) return reviews;
    return reviews.filter((review) => review.rating === selectedRating);
  }, [reviews, selectedRating]);

  const hasMore = reviews.length < total;
  const isFiltered = selectedRating != null;

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await getStorefrontReviews({
        page: nextPage,
        page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
      });
      setReviews((current) => {
        const seen = new Set(current.map((item) => item.id));
        const appended = response.items.filter((item) => !seen.has(item.id));
        return [...current, ...appended];
      });
      setTotal(response.total);
      setPage(nextPage);
    } catch (error) {
      const key =
        error instanceof ApiError &&
        (error.status === 502 || error.status === 503 || error.status === 504)
          ? "unavailable"
          : "generic";
      toast.error(tErrors(key));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1
            id="reviews-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {t("title")}
          </h1>
          <p className="mt-3 font-sans text-body text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="h-11 shrink-0 rounded-xl px-5"
          onClick={() => setFormOpen(true)}
        >
          {t("writeReview")}
        </Button>
      </div>

      <ReviewSummary
        summary={summary}
        selectedRating={selectedRating}
        onSelectRating={setSelectedRating}
      />

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-subtle">
          <p className="font-sans text-body text-muted-foreground">
            {t("empty")}
          </p>
          <Button
            type="button"
            className="mt-5 rounded-xl"
            onClick={() => setFormOpen(true)}
          >
            {t("writeReview")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {isFiltered ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="font-sans text-small text-muted-foreground"
                aria-live="polite"
              >
                {t("filteredByRating", {
                  count: visibleReviews.length,
                  rating: selectedRating,
                })}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start rounded-full"
                onClick={() => setSelectedRating(null)}
              >
                {t("viewAllReviews")}
              </Button>
            </div>
          ) : null}

          {visibleReviews.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-subtle">
              <p className="font-sans text-body text-muted-foreground">
                {t("filteredEmpty", { rating: selectedRating ?? 0 })}
              </p>
              {hasMore ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 rounded-full"
                  disabled={loadingMore}
                  onClick={() => {
                    void handleLoadMore();
                  }}
                >
                  {loadingMore ? t("loadingMore") : t("loadMore")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => setSelectedRating(null)}
                >
                  {t("viewAllReviews")}
                </Button>
              )}
            </div>
          ) : (
            <ReviewMasonryList reviews={visibleReviews} />
          )}

          {hasMore && visibleReviews.length > 0 ? (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 rounded-full border-border bg-card px-6 shadow-subtle"
                disabled={loadingMore}
                onClick={() => {
                  void handleLoadMore();
                }}
              >
                {loadingMore ? t("loadingMore") : t("loadMore")}
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <ReviewFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

export { ReviewsSection };
