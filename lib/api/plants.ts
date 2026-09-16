import { api } from "@/lib/api/client";
import type {
  AdminPlant,
  AdminPlantCreateRequest,
  AdminPlantImage,
  AdminPlantImageCreateRequest,
  AdminPlantImageUpdateRequest,
  AdminPlantListResponse,
  AdminPlantOrder,
  AdminPlantPotSize,
  AdminPlantPotSizeCreateRequest,
  AdminPlantPotSizeUpdateRequest,
  AdminPlantSort,
  AdminPlantStatusUpdateRequest,
  AdminPlantUpdateRequest,
} from "@/types/admin-plant";

export type ListPlantsParams = {
  page?: number;
  page_size?: number;
  /** Matches plant name or SKU. */
  search?: string;
  category_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  min_price?: string;
  max_price?: string;
  sort?: AdminPlantSort;
  order?: AdminPlantOrder;
};

export async function listPlants(
  params: ListPlantsParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<AdminPlantListResponse> {
  return api.get<AdminPlantListResponse>("/plants", {
    signal: options.signal,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      search: params.search,
      category_id: params.category_id,
      is_active: params.is_active,
      is_featured: params.is_featured,
      min_price: params.min_price,
      max_price: params.max_price,
      sort: params.sort ?? "created_at",
      order: params.order ?? "desc",
    },
  });
}

export async function getPlant(id: string): Promise<AdminPlant> {
  return api.get<AdminPlant>(`/plants/${id}`);
}

export async function createPlant(
  data: AdminPlantCreateRequest
): Promise<AdminPlant> {
  return api.post<AdminPlant>("/plants", data);
}

export async function updatePlant(
  id: string,
  data: AdminPlantUpdateRequest
): Promise<AdminPlant> {
  return api.patch<AdminPlant>(`/plants/${id}`, data);
}

export async function updatePlantStatus(
  id: string,
  data: AdminPlantStatusUpdateRequest
): Promise<AdminPlant> {
  return api.patch<AdminPlant>(`/plants/${id}/status`, data);
}

export async function listPlantImages(
  plantId: string
): Promise<AdminPlantImage[]> {
  return api.get<AdminPlantImage[]>(`/plants/${plantId}/images`);
}

export async function createPlantImage(
  plantId: string,
  data: AdminPlantImageCreateRequest
): Promise<AdminPlantImage> {
  return api.post<AdminPlantImage>(`/plants/${plantId}/images`, data);
}

export async function updatePlantImage(
  plantId: string,
  imageId: string,
  data: AdminPlantImageUpdateRequest
): Promise<AdminPlantImage> {
  return api.patch<AdminPlantImage>(
    `/plants/${plantId}/images/${imageId}`,
    data
  );
}

export async function deletePlantImage(
  plantId: string,
  imageId: string
): Promise<void> {
  await api.delete<void>(`/plants/${plantId}/images/${imageId}`);
}

export async function listPlantPotSizes(
  plantId: string
): Promise<AdminPlantPotSize[]> {
  return api.get<AdminPlantPotSize[]>(`/plants/${plantId}/pot-sizes`);
}

export async function createPlantPotSize(
  plantId: string,
  data: AdminPlantPotSizeCreateRequest
): Promise<AdminPlantPotSize> {
  return api.post<AdminPlantPotSize>(`/plants/${plantId}/pot-sizes`, data);
}

export async function updatePlantPotSize(
  plantId: string,
  sizeId: string,
  data: AdminPlantPotSizeUpdateRequest
): Promise<AdminPlantPotSize> {
  return api.patch<AdminPlantPotSize>(
    `/plants/${plantId}/pot-sizes/${sizeId}`,
    data
  );
}

export async function deletePlantPotSize(
  plantId: string,
  sizeId: string
): Promise<void> {
  await api.delete<void>(`/plants/${plantId}/pot-sizes/${sizeId}`);
}
