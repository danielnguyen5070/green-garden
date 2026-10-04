"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PencilIcon } from "lucide-react";
import { ReviewFormDialog } from "@/components/reviews/review-form-dialog";
import { ReviewMasonryList } from "@/components/reviews/review-masonry-list";
import { ReviewSummary } from "@/components/reviews/review-summary";
import { Button } from "@/components/ui/button";
import {
  STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
  getStorefrontPlantReviews,
} from "@/lib/api/storefront";
import { ApiError } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
  StorefrontReview,
  StorefrontReviewSummary,
} from "@/types/storefront-review";

function PlantReviews({
  plantSlug,
  plantName,
  initialReviews,
  initialTotal,
  summary,
  className,
}: {
  plantSlug: string;
  plantName: string;
  initialReviews: StorefrontReview[];
  initialTotal: number;
  summary: StorefrontReviewSummary;
  className?: string;
}) {
  const t = useTranslations("plantDetail.reviews");
  const tReviews = useTranslations("reviews");
  const tErrors = useTranslations("reviews.errors");

  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const visibleReviews = useMemo(
    () =>
      selectedRating == null
        ? reviews
        : reviews.filter((review) => review.rating === selectedRating),
    [reviews, selectedRating]
  );

  const hasMore = reviews.length < total;

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await getStorefrontPlantReviews(plantSlug, {
        page: nextPage,
        page_size: STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
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

  const loadMoreButton = hasMore ? (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl"
      disabled={loadingMore}
      onClick={() => {
        void handleLoadMore();
      }}
    >
      {loadingMore ? tReviews("loadingMore") : tReviews("loadMore")}
    </Button>
  ) : null;

  return (
    <section
      id="reviews"
      data-slot="plant-reviews"
      aria-labelledby="plant-reviews-heading"
      className={cn("scroll-mt-24 space-y-6", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="plant-reviews-heading"
          className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
        >
          {t("title")}
        </h2>
        <Button
          type="button"
          className="h-9 shrink-0 self-start rounded-xl px-6 has-data-[icon=inline-start]:pl-6 sm:self-center"
          onClick={() => setFormOpen(true)}
        >
          <PencilIcon data-icon="inline-start" className="size-3.5" />
          {tReviews("writeReview")}
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-subtle">
          <p className="font-sans text-body text-muted-foreground">
            {t("empty")}
          </p>
        </div>
      ) : (
        <>
          <ReviewSummary
            summary={summary}
            selectedRating={selectedRating}
            onSelectRating={setSelectedRating}
          />

          {visibleReviews.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-subtle">
              <p className="font-sans text-body text-muted-foreground">
                {tReviews("filteredEmpty", { rating: selectedRating ?? 0 })}
              </p>
              <div className="mt-4">
                {loadMoreButton ?? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedRating(null)}
                  >
                    {tReviews("viewAllReviews")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ReviewMasonryList reviews={visibleReviews} />
          )}

          {loadMoreButton && visibleReviews.length > 0 ? (
            <div className="flex justify-center pt-1">{loadMoreButton}</div>
          ) : null}
        </>
      )}

      <ReviewFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plantSlug={plantSlug}
        title={t("formTitle", { name: plantName })}
        description={t("formDescription", { name: plantName })}
      />
    </section>
  );
}

export { PlantReviews };
