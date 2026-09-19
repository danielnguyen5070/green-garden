/**
 * Plant shapes from the FastAPI admin API.
 * Kept separate from `types/storefront.ts`, whose responses omit SKU, stock
 * bookkeeping and audit fields.
 */

/**
 * Money is serialized by the backend as an exact decimal string ("450000.00").
 * Keep it a string end to end and parse only when formatting for display.
 */
export type DecimalString = string;

/** Money accepted by the API on write; a plain string avoids float rounding. */
export type DecimalInput = DecimalString | number;

export type PlantImageType = "image" | "video";

/** Minimal category embedded in plant responses. */
export type AdminPlantCategory = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
};

export type AdminPlantImage = {
  id: string;
  plant_id: string;
  url: string;
  type: PlantImageType;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type AdminPlantPotSize = {
  id: string;
  plant_id: string;
  name: string;
  price_adjustment: DecimalString;
  price_adjustment_vi: DecimalString | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Full plant from `GET /plants/{id}`, including nested images and pot sizes. */
export type AdminPlant = {
  id: string;
  category_id: string;
  category: AdminPlantCategory | null;
  name: string;
  name_vi: string | null;
  slug: string;
  description: string | null;
  description_vi: string | null;
  price: DecimalString;
  price_vi: DecimalString | null;
  stock: number;
  sku: string;
  og_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  images: AdminPlantImage[];
  pot_sizes: AdminPlantPotSize[];
  created_at: string;
  updated_at: string;
};

/** Row from `GET /plants`; omits description, images and pot sizes. */
export type AdminPlantListItem = Omit<
  AdminPlant,
  "description" | "description_vi" | "images" | "pot_sizes"
>;

export type AdminPlantListResponse = {
  items: AdminPlantListItem[];
  page: number;
  page_size: number;
  total: number;
};

export type AdminPlantSort = "created_at" | "name" | "price" | "stock";
export type AdminPlantOrder = "asc" | "desc";

export type AdminPlantCreateRequest = {
  category_id: string;
  name: string;
  name_vi?: string | null;
  slug: string;
  description?: string | null;
  description_vi?: string | null;
  price: DecimalInput;
  price_vi?: DecimalInput | null;
  stock?: number;
  sku: string;
  og_image_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
};

export type AdminPlantUpdateRequest = {
  category_id?: string | null;
  name?: string | null;
  name_vi?: string | null;
  slug?: string | null;
  description?: string | null;
  description_vi?: string | null;
  price?: DecimalInput | null;
  price_vi?: DecimalInput | null;
  stock?: number | null;
  sku?: string | null;
  og_image_url?: string | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
};

export type AdminPlantStatusUpdateRequest = {
  is_active: boolean;
};

export type AdminPlantImageCreateRequest = {
  url: string;
  type?: PlantImageType;
  alt_text?: string | null;
  sort_order?: number;
};

export type AdminPlantImageUpdateRequest = {
  url?: string | null;
  type?: PlantImageType | null;
  alt_text?: string | null;
  sort_order?: number | null;
};

export type AdminPlantPotSizeCreateRequest = {
  name: string;
  price_adjustment?: DecimalInput;
  price_adjustment_vi?: DecimalInput | null;
  sort_order?: number;
  is_active?: boolean;
};

export type AdminPlantPotSizeUpdateRequest = {
  name?: string | null;
  price_adjustment?: DecimalInput | null;
  price_adjustment_vi?: DecimalInput | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};
