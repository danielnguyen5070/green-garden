"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAdmin,
  listAdmins,
  updateAdmin,
  updateAdminPassword,
  updateAdminStatus,
} from "@/lib/api/admins";
import { useQueryErrorToast } from "@/app/admin/_hooks/use-query-error-toast";
import { queryKeys } from "@/lib/query/keys";
import type {
  AdminCreateRequest,
  AdminPasswordUpdateRequest,
  AdminStatusUpdateRequest,
  AdminUpdateRequest,
} from "@/types/admin";

const PAGE_SIZE = 20;

export type UseAdminAdminsListParams = {
  page: number;
  onEmptyPage?: (page: number) => void;
};

export function useAdminAdminsList({
  page,
  onEmptyPage,
}: UseAdminAdminsListParams) {
  const query = useQuery({
    queryKey: queryKeys.admin.admins.list({ page }),
    queryFn: ({ signal }) =>
      listAdmins({ page, page_size: PAGE_SIZE }, { signal }),
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
    /** True while the first page of data is not yet available. */
    loading: query.isPending || (query.isFetching && items.length === 0),
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}

function invalidateAdmins(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.admin.admins.all,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateRequest) => createAdmin(data),
    onSuccess: () => invalidateAdmins(queryClient),
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateRequest }) =>
      updateAdmin(id, data),
    onSuccess: () => invalidateAdmins(queryClient),
  });
}

export function useUpdateAdminPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AdminPasswordUpdateRequest;
    }) => updateAdminPassword(id, data),
    onSuccess: () => invalidateAdmins(queryClient),
  });
}

export function useUpdateAdminStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AdminStatusUpdateRequest;
    }) => updateAdminStatus(id, data),
    onSuccess: () => invalidateAdmins(queryClient),
  });
}
