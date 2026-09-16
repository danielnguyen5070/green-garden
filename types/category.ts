/** Category from the FastAPI backend. English fields with Vietnamese translations. */
export type Category = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
  description: string | null;
  description_vi: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryListResponse = {
  items: Category[];
  page: number;
  page_size: number;
  total: number;
};

export type CategoryCreateRequest = {
  name: string;
  name_vi?: string | null;
  slug: string;
  description?: string | null;
  description_vi?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type CategoryUpdateRequest = {
  name?: string | null;
  name_vi?: string | null;
  slug?: string | null;
  description?: string | null;
  description_vi?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export type CategoryStatusUpdateRequest = {
  is_active: boolean;
};
