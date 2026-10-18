"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { listReviews, updateReviewStatus } from "@/lib/api/reviews";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { queryKeys, type AdminReviewListKeyParams } from "@/lib/query/keys";
import type {
  ReviewListResponse,
  ReviewScope,
  ReviewStatus,
  ReviewStatusUpdateRequest,
} from "@/types/review";

const PAGE_SIZE = 20;

export type UseAdminReviewsListParams = AdminReviewListKeyParams & {
  onEmptyPage?: (page: number) => void;
};

export function useAdminReviewsList({
  page,
  search,
  status,
  scope,
  onEmptyPage,
}: UseAdminReviewsListParams) {
  const keyParams: AdminReviewListKeyParams = { page, search, status, scope };

  const query = useQuery({
    queryKey: queryKeys.admin.reviews.list(keyParams),
    queryFn: ({ signal }) =>
      listReviews(
        {
          page,
          page_size: PAGE_SIZE,
          search: search || undefined,
          status: (status as ReviewStatus | null) ?? undefined,
          scope: (scope as ReviewScope | null) ?? undefined,
        },
        { signal }
      ),
    placeholderData: keepPreviousData,
  });

  useQueryErrorToast(query.error);

  useEffect(() => {
    if (!query.isSuccess || !query.data) return;
    if (query.data.items.length === 0 && page > 1) {
      onEmptyPage?.(page);
    }
  }, [query.isSuccess, query.data, page, onEmptyPage]);

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return {
    items,
    total,
    loading: query.isPending || (query.isFetching && items.length === 0),
    isFetching: query.isFetching,
    error: query.error,
    listKey: queryKeys.admin.reviews.list(keyParams),
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useUpdateReviewStatus(listKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ReviewStatusUpdateRequest;
    }) => updateReviewStatus(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<ReviewListResponse>(listKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === updated.id ? updated : item
          ),
        };
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.overview,
      });
    },
  });
}

export function useInvalidateAdminReviews() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.reviews.all,
    });
}
