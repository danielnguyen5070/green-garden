"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPlant,
  createPlantImage,
  createPlantPotSize,
  deletePlantImage,
  deletePlantPotSize,
  getPlant,
  listPlants,
  updatePlant,
  updatePlantImage,
  updatePlantPotSize,
  updatePlantStatus,
} from "@/lib/api/plants";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { queryKeys, type AdminPlantListKeyParams } from "@/lib/query/keys";
import type {
  AdminPlantCreateRequest,
  AdminPlantImageCreateRequest,
  AdminPlantImageUpdateRequest,
  AdminPlantOrder,
  AdminPlantPotSizeCreateRequest,
  AdminPlantPotSizeUpdateRequest,
  AdminPlantSort,
  AdminPlantStatusUpdateRequest,
  AdminPlantUpdateRequest,
} from "@/types/admin-plant";

const PAGE_SIZE = 20;

export type UseAdminPlantsListParams = AdminPlantListKeyParams & {
  onEmptyPage?: (page: number) => void;
};

export function useAdminPlantsList({
  page,
  search,
  categoryId,
  isActive,
  isFeatured,
  minPrice,
  maxPrice,
  sort,
  order,
  onEmptyPage,
}: UseAdminPlantsListParams) {
  const keyParams: AdminPlantListKeyParams = {
    page,
    search,
    categoryId,
    isActive,
    isFeatured,
    minPrice,
    maxPrice,
    sort,
    order,
  };

  const query = useQuery({
    queryKey: queryKeys.admin.plants.list(keyParams),
    queryFn: ({ signal }) =>
      listPlants(
        {
          page,
          page_size: PAGE_SIZE,
          search: search || undefined,
          category_id: categoryId ?? undefined,
          is_active: isActive ?? undefined,
          is_featured: isFeatured ?? undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          sort: sort as AdminPlantSort,
          order: order as AdminPlantOrder,
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

export function useAdminPlantDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.plants.detail(id ?? ""),
    queryFn: ({ signal }) => getPlant(id!, { signal }),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: !!id && (query.isPending || query.isFetching),
    error: query.error,
    isError: query.isError,
  };
}

/** Imperative detail fetch that shares the admin plant detail query key/cache. */
export function fetchAdminPlantDetail(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
) {
  return queryClient.fetchQuery({
    queryKey: queryKeys.admin.plants.detail(id),
    queryFn: ({ signal }) => getPlant(id, { signal }),
  });
}

/** Active plants for the order-create plant picker. */
export function useAdminPlantPicker() {
  const query = useQuery({
    queryKey: queryKeys.admin.plants.picker,
    queryFn: ({ signal }) =>
      listPlants(
        {
          page: 1,
          page_size: 100,
          is_active: true,
          sort: "name",
          order: "asc",
        },
        { signal }
      ),
  });

  useQueryErrorToast(query.error);

  return {
    items: query.data?.items ?? [],
    loading: query.isPending,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}

async function invalidatePlants(
  queryClient: ReturnType<typeof useQueryClient>,
  detailId?: string
) {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.plants.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview }),
  ];
  if (detailId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.plants.detail(detailId),
      })
    );
  }
  await Promise.all(tasks);
}

export function useCreatePlant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminPlantCreateRequest) => createPlant(data),
    onSuccess: () => invalidatePlants(queryClient),
  });
}

export function useUpdatePlant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminPlantUpdateRequest }) =>
      updatePlant(id, data),
    onSuccess: (_data, variables) => invalidatePlants(queryClient, variables.id),
  });
}

export function useUpdatePlantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AdminPlantStatusUpdateRequest;
    }) => updatePlantStatus(id, data),
    onSuccess: (_data, variables) => invalidatePlants(queryClient, variables.id),
  });
}

export function useInvalidatePlantDetail() {
  const queryClient = useQueryClient();
  return (plantId: string) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.plants.detail(plantId),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.plants.all }),
    ]);
}

export function useCreatePlantImage() {
  const invalidate = useInvalidatePlantDetail();
  return useMutation({
    mutationFn: ({
      plantId,
      data,
    }: {
      plantId: string;
      data: AdminPlantImageCreateRequest;
    }) => createPlantImage(plantId, data),
    onSuccess: (_data, variables) => invalidate(variables.plantId),
  });
}

export function useUpdatePlantImage() {
  const invalidate = useInvalidatePlantDetail();
  return useMutation({
    mutationFn: ({
      plantId,
      imageId,
      data,
    }: {
      plantId: string;
      imageId: string;
      data: AdminPlantImageUpdateRequest;
    }) => updatePlantImage(plantId, imageId, data),
    onSuccess: (_data, variables) => invalidate(variables.plantId),
  });
}

export function useDeletePlantImage() {
  const invalidate = useInvalidatePlantDetail();
  return useMutation({
    mutationFn: ({
      plantId,
      imageId,
    }: {
      plantId: string;
      imageId: string;
    }) => deletePlantImage(plantId, imageId),
    onSuccess: (_data, variables) => invalidate(variables.plantId),
  });
}

export function useCreatePlantPotSize() {
  const invalidate = useInvalidatePlantDetail();
  return useMutation({
    mutationFn: ({
      plantId,
      data,
    }: {
      plantId: string;
      data: AdminPlantPotSizeCreateRequest;
    }) => createPlantPotSize(plantId, data),
    onSuccess: (_data, variables) => invalidate(variables.plantId),
  });
}

export function useUpdatePlantPotSize() {
  const invalidate = useInvalidatePlantDetail();
  return useMutation({
    mutationFn: ({
      plantId,
      sizeId,
      data,
    }: {
      plantId: string;
      sizeId: string;
      data: AdminPlantPotSizeUpdateRequest;
    }) => updatePlantPotSize(plantId, sizeId, data),
    onSuccess: (_data, variables) => invalidate(variables.plantId),
  });
}

export function useDeletePlantPotSize() {
  const invalidate = useInvalidatePlantDetail();
  return useMutation({
    mutationFn: ({
      plantId,
      sizeId,
    }: {
      plantId: string;
      sizeId: string;
    }) => deletePlantPotSize(plantId, sizeId),
    onSuccess: (_data, variables) => invalidate(variables.plantId),
  });
}
