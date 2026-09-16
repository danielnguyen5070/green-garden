import { api } from "@/lib/api/client";
import type {
  Category,
  CategoryCreateRequest,
  CategoryListResponse,
  CategoryStatusUpdateRequest,
  CategoryUpdateRequest,
} from "@/types/category";

export type ListCategoriesParams = {
  page?: number;
  page_size?: number;
  /** Matches category name or slug. */
  search?: string;
  is_active?: boolean;
};

export async function listCategories(
  params: ListCategoriesParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<CategoryListResponse> {
  return api.get<CategoryListResponse>("/categories", {
    signal: options.signal,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      search: params.search,
      is_active: params.is_active,
    },
  });
}

export async function getCategory(id: string): Promise<Category> {
  return api.get<Category>(`/categories/${id}`);
}

export async function createCategory(
  data: CategoryCreateRequest
): Promise<Category> {
  return api.post<Category>("/categories", data);
}

export async function updateCategory(
  id: string,
  data: CategoryUpdateRequest
): Promise<Category> {
  return api.patch<Category>(`/categories/${id}`, data);
}

export async function updateCategoryStatus(
  id: string,
  data: CategoryStatusUpdateRequest
): Promise<Category> {
  return api.patch<Category>(`/categories/${id}/status`, data);
}
