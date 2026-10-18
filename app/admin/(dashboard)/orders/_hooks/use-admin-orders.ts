"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrder, getOrder, listOrders, updateOrderStatus } from "@/lib/api/orders";
import { useQueryErrorToast } from "@/app/admin/_hooks/use-query-error-toast";
import { queryKeys, type AdminOrderListKeyParams } from "@/lib/query/keys";
import type {
  OrderCreateRequest,
  OrderStatus,
  OrderStatusUpdateRequest,
} from "@/types/order";

const PAGE_SIZE = 20;

export type UseAdminOrdersListParams = AdminOrderListKeyParams & {
  onEmptyPage?: (page: number) => void;
};

export function useAdminOrdersList({
  page,
  search,
  status,
  dateFrom,
  dateTo,
  onEmptyPage,
}: UseAdminOrdersListParams) {
  const keyParams: AdminOrderListKeyParams = {
    page,
    search,
    status,
    dateFrom,
    dateTo,
  };

  const query = useQuery({
    queryKey: queryKeys.admin.orders.list(keyParams),
    queryFn: ({ signal }) =>
      listOrders(
        {
          page,
          page_size: PAGE_SIZE,
          search: search || undefined,
          status: (status as OrderStatus | null) ?? undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
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
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useAdminOrderDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.orders.detail(id ?? ""),
    queryFn: ({ signal }) => getOrder(id!, { signal }),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: !!id && (query.isPending || query.isFetching),
    error: query.error,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}

async function invalidateOrders(
  queryClient: ReturnType<typeof useQueryClient>,
  detailId?: string,
  options?: { plantsPicker?: boolean }
) {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview }),
  ];
  if (detailId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.detail(detailId),
      })
    );
  }
  if (options?.plantsPicker) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.plants.picker,
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.plants.all })
    );
  }
  await Promise.all(tasks);
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreateRequest) => createOrder(data),
    onSuccess: () =>
      invalidateOrders(queryClient, undefined, { plantsPicker: true }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: OrderStatusUpdateRequest;
    }) => updateOrderStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.admin.orders.detail(variables.id),
        data
      );
      return invalidateOrders(queryClient, variables.id);
    },
  });
}
