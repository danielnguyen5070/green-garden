"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminDate } from "@/lib/admin-format";
import { getErrorMessage } from "@/lib/api/errors";
import { listReviews, updateReviewStatus } from "@/lib/api/reviews";
import { toast } from "@/lib/toast";
import type { Review, ReviewStatus } from "@/types/review";
import { REVIEW_STATUSES } from "@/types/review";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

const copy = adminCopy.reviews;

type StatusFilter = "all" | ReviewStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: copy.all },
  ...REVIEW_STATUSES.map((status) => ({
    value: status,
    label: adminCopy.status[status],
  })),
];

function ReviewStars({ rating }: { rating: number }) {
  const safeRating = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={copy.ratingLabel(safeRating)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < safeRating;
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(
              "size-4",
              filled
                ? "fill-warning text-warning"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        );
      })}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const isFiltered = search !== "" || statusFilter !== "all";

  useEffect(() => {
    if (searchInput.trim() === search) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReviews() {
      try {
        const response = await listReviews(
          {
            page,
            page_size: PAGE_SIZE,
            search: search || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;

        if (response.items.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
          return;
        }

        setReviews(response.items);
        setTotal(response.total);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchReviews();
    return () => controller.abort();
  }, [page, search, statusFilter, reloadToken]);

  function refresh(nextPage = page) {
    setLoading(true);
    setPage(nextPage);
    setReloadToken((token) => token + 1);
  }

  function applyStatusFilter(next: StatusFilter) {
    if (next === statusFilter) return;
    setLoading(true);
    setStatusFilter(next);
    setPage(1);
  }

  async function handleStatusChange(
    review: Review,
    status: Extract<ReviewStatus, "approved" | "rejected">
  ) {
    setStatusPendingId(review.id);

    try {
      const updated = await updateReviewStatus(review.id, { status });
      setReviews((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success(
        status === "approved" ? copy.approvedSuccess : copy.rejectedSuccess
      );

      // Drop the row when the active filter no longer includes it.
      if (statusFilter !== "all" && statusFilter !== status) {
        refresh(page);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusPendingId(null);
    }
  }

  const showInitialLoading = loading && reviews.length === 0;

  return (
    <>
      <AdminPageHeader description={copy.description} />

      <AdminSection contentClassName="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={adminCopy.common.search}
              className="pl-8"
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={copy.filtersLabel}
          >
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.value;

              return (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "h-8",
                    !isActive && "bg-background text-foreground hover:bg-muted"
                  )}
                  aria-pressed={isActive}
                  disabled={loading && isActive}
                  onClick={() => applyStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {showInitialLoading ? (
          <p className="text-sm text-muted-foreground">
            {adminCopy.common.loading}
          </p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isFiltered ? copy.noResults : copy.empty}
          </p>
        ) : (
          <div
            aria-busy={loading}
            className={cn(
              "space-y-3",
              loading && "opacity-60 transition-opacity"
            )}
          >
            {reviews.map((review) => {
              const pending = statusPendingId === review.id;
              const canModerate = review.status === "pending";

              return (
                <article
                  key={review.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-none"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <ReviewStars rating={review.rating} />
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium text-foreground">
                          {review.name}
                        </h2>
                        <AdminStatusBadge
                          status={review.status}
                          label={adminCopy.status[review.status]}
                        />
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {review.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAdminDate(review.created_at)}
                      </p>
                    </div>

                    {canModerate ? (
                      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => {
                            void handleStatusChange(review, "approved");
                          }}
                        >
                          {copy.approve}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => {
                            void handleStatusChange(review, "rejected");
                          }}
                        >
                          {copy.reject}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!showInitialLoading && total > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {copy.pageInfo(page, totalPages, total)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => refresh(page - 1)}
              >
                {adminCopy.common.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => refresh(page + 1)}
              >
                {adminCopy.common.next}
              </Button>
            </div>
          </div>
        ) : null}
      </AdminSection>
    </>
  );
}
