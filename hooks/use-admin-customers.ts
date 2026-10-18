"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
  updateCustomerStatus,
} from "@/lib/api/customers";
import { listOrders } from "@/lib/api/orders";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { queryKeys, type AdminCustomerListKeyParams } from "@/lib/query/keys";
import type {
  CustomerCreateRequest,
  CustomerStatusUpdateRequest,
  CustomerUpdateRequest,
} from "@/types/customer";

const PAGE_SIZE = 20;
const CUSTOMER_ORDERS_PAGE_SIZE = 20;

export type UseAdminCustomersListParams = AdminCustomerListKeyParams & {
  onEmptyPage?: (page: number) => void;
};

export function useAdminCustomersList({
  page,
  search,
  isActive,
  onEmptyPage,
}: UseAdminCustomersListParams) {
  const keyParams: AdminCustomerListKeyParams = { page, search, isActive };

  const query = useQuery({
    queryKey: queryKeys.admin.customers.list(keyParams),
    queryFn: ({ signal }) =>
      listCustomers(
        {
          page,
          page_size: PAGE_SIZE,
          search: search || undefined,
          is_active: isActive ?? undefined,
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

export function useAdminCustomerDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.customers.detail(id ?? ""),
    queryFn: ({ signal }) => getCustomer(id!, { signal }),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: !!id && (query.isPending || query.isFetching),
    error: query.error,
    isError: query.isError,
  };
}

export function useAdminCustomerOrders(customerId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.orders.byCustomer(customerId ?? ""),
    queryFn: ({ signal }) =>
      listOrders(
        {
          customer_id: customerId!,
          page: 1,
          page_size: CUSTOMER_ORDERS_PAGE_SIZE,
        },
        { signal }
      ),
    enabled: !!customerId,
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    loading: !!customerId && (query.isPending || query.isFetching),
    error: query.error,
    isError: query.isError,
  };
}

async function invalidateCustomers(
  queryClient: ReturnType<typeof useQueryClient>,
  detailId?: string
) {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview }),
  ];
  if (detailId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.customers.detail(detailId),
      })
    );
  }
  await Promise.all(tasks);
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerCreateRequest) => createCustomer(data),
    onSuccess: () => invalidateCustomers(queryClient),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdateRequest }) =>
      updateCustomer(id, data),
    onSuccess: (_data, variables) =>
      invalidateCustomers(queryClient, variables.id),
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CustomerStatusUpdateRequest;
    }) => updateCustomerStatus(id, data),
    onSuccess: (_data, variables) =>
      invalidateCustomers(queryClient, variables.id),
  });
}
