"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ReviewFormDialog } from "@/components/reviews/review-form-dialog";
import { ReviewMasonryList } from "@/components/reviews/review-masonry-list";
import { ReviewSummary } from "@/components/reviews/review-summary";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type SortOption = "newest" | "oldest";

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
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const visibleReviews = useMemo(() => {
    const filtered =
      selectedRating == null
        ? reviews
        : reviews.filter((review) => review.rating === selectedRating);

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortOption === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [reviews, selectedRating, sortOption]);

  const hasMore = reviews.length < total;
  const isFiltered = selectedRating != null;
  const listCount = isFiltered ? visibleReviews.length : total;

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
    <div className="space-y-6 md:space-y-8">
      <h1 id="reviews-heading" className="sr-only">
        {t("title")}
      </h1>

      <ReviewSummary
        summary={summary}
        selectedRating={selectedRating}
        onSelectRating={setSelectedRating}
        onWriteReview={() => setFormOpen(true)}
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
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                {isFiltered
                  ? t("filteredListTitle", {
                      count: listCount,
                      rating: selectedRating,
                    })
                  : t("allReviews", { count: listCount })}
              </h2>
              {isFiltered ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto px-0 font-sans text-small"
                  onClick={() => setSelectedRating(null)}
                >
                  {t("viewAllReviews")}
                </Button>
              ) : null}
            </div>

            <Select
              value={sortOption}
              onValueChange={(value) => {
                if (value === "newest" || value === "oldest") {
                  setSortOption(value);
                }
              }}
            >
              <SelectTrigger
                aria-label={t("sortLabel")}
                className="h-9 w-full rounded-xl border-border bg-card px-3.5 font-sans text-sm shadow-none sm:w-auto sm:min-w-[9.5rem]"
              >
                <SelectValue>{t(`sort.${sortOption}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[9.5rem]">
                <SelectItem value="newest" className="font-sans">
                  {t("sort.newest")}
                </SelectItem>
                <SelectItem value="oldest" className="font-sans">
                  {t("sort.oldest")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visibleReviews.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-subtle">
              <p className="font-sans text-body text-muted-foreground">
                {t("filteredEmpty", { rating: selectedRating ?? 0 })}
              </p>
              {hasMore ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 rounded-xl"
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
                  className="mt-4 rounded-xl"
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
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 rounded-xl border-border bg-card px-6 shadow-subtle"
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
