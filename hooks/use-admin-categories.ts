"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCategory,
  getCategory,
  listCategories,
  updateCategory,
  updateCategoryStatus,
} from "@/lib/api/categories";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { adminCopy } from "@/lib/admin-copy";
import { queryKeys, type AdminCategoryListKeyParams } from "@/lib/query/keys";
import type {
  CategoryCreateRequest,
  CategoryStatusUpdateRequest,
  CategoryUpdateRequest,
} from "@/types/category";
import type { Category } from "@/types/category";

const PAGE_SIZE = 20;
const OPTIONS_PAGE_SIZE = 100;
const OPTIONS_MAX_PAGES = 10;

export type UseAdminCategoriesListParams = AdminCategoryListKeyParams & {
  onEmptyPage?: (page: number) => void;
};

export function useAdminCategoriesList({
  page,
  search,
  isActive,
  onEmptyPage,
}: UseAdminCategoriesListParams) {
  const keyParams: AdminCategoryListKeyParams = { page, search, isActive };

  const query = useQuery({
    queryKey: queryKeys.admin.categories.list(keyParams),
    queryFn: ({ signal }) =>
      listCategories(
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

export function useAdminCategoryDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.categories.detail(id ?? ""),
    queryFn: ({ signal }) => getCategory(id!, { signal }),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending || query.isFetching,
    error: query.error,
    isError: query.isError,
  };
}

/** Loads every category page for plant form/filter dropdowns. */
export function useAdminCategoryOptions() {
  const query = useQuery({
    queryKey: queryKeys.admin.categories.options,
    queryFn: async ({ signal }): Promise<Category[]> => {
      const collected: Category[] = [];
      for (let current = 1; current <= OPTIONS_MAX_PAGES; current += 1) {
        const response = await listCategories(
          { page: current, page_size: OPTIONS_PAGE_SIZE },
          { signal }
        );
        collected.push(...response.items);
        if (collected.length >= response.total || response.items.length === 0) {
          break;
        }
      }
      return collected;
    },
  });

  useQueryErrorToast(query.error, adminCopy.plants.categoriesLoadError);

  return {
    items: query.data ?? [],
    loading: query.isPending,
    error: query.error,
  };
}

async function invalidateCategories(
  queryClient: ReturnType<typeof useQueryClient>
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.categories.options,
    }),
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview }),
  ]);
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreateRequest) => createCategory(data),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
      updateCategory(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.categories.detail(variables.id),
      });
      return invalidateCategories(queryClient);
    },
  });
}

export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CategoryStatusUpdateRequest;
    }) => updateCategoryStatus(id, data),
    onSuccess: () => invalidateCategories(queryClient),
  });
}
