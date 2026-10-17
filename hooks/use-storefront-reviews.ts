"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  STOREFRONT_REVIEWS_PAGE_SIZE,
  getStorefrontReviews,
} from "@/lib/api/storefront";
import { queryKeys } from "@/lib/query/keys";
import type {
  StorefrontReview,
  StorefrontReviewListResponse,
} from "@/types/storefront-review";

export type UseStorefrontReviewsResult = {
  reviews: StorefrontReview[];
  total: number;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  fetchNextPage: () => void;
};

/**
 * Paginated site-wide reviews. The first page is usually SSR-seeded so the
 * homepage and `/reviews` share the same Data Cache entry on the server.
 */
export function useStorefrontReviews({
  initial,
}: {
  initial: Pick<StorefrontReviewListResponse, "items" | "total">;
}): UseStorefrontReviewsResult {
  const query = useInfiniteQuery({
    queryKey: queryKeys.reviews.storefront({
      pageSize: STOREFRONT_REVIEWS_PAGE_SIZE,
    }),
    queryFn: ({ pageParam, signal }) =>
      getStorefrontReviews(
        {
          page: pageParam,
          page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
        },
        { signal }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const loaded = lastPageParam * STOREFRONT_REVIEWS_PAGE_SIZE;
      return loaded < lastPage.total ? lastPageParam + 1 : undefined;
    },
    initialData: {
      pages: [
        {
          items: initial.items,
          total: initial.total,
          page: 1,
          page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
        },
      ],
      pageParams: [1],
    },
  });

  const reviews = useMemo(() => {
    const seen = new Set<string>();
    const items: StorefrontReview[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const item of page.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
    }
    return items;
  }, [query.data]);

  const total = query.data?.pages.at(-1)?.total ?? initial.total;

  return {
    reviews,
    total,
    hasMore: query.hasNextPage ?? reviews.length < total,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    fetchNextPage: () => {
      void query.fetchNextPage();
    },
  };
}
