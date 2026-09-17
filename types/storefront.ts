/**
 * Public storefront responses from `GET /api/v1/storefront/*`.
 *
 * Deliberately separate from `types/admin-plant.ts` and `types/category.ts`:
 * the storefront payloads omit SKU, stock counts, `is_active` and audit
 * timestamps, so reusing the admin types would promise fields that are never
 * sent to the public site.
 */

/** Money arrives as a decimal string so no precision is lost in transport. */
type Decimal = string;

export type StorefrontCategory = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
  description: string | null;
  description_vi: string | null;
  image_url: string | null;
  sort_order: number;
};

export type StorefrontCategoryListResponse = {
  items: StorefrontCategory[];
  page: number;
  page_size: number;
  total: number;
};

/** Category shape embedded in plant responses. */
export type StorefrontCategorySummary = {
  id: string;
  name: string;
  name_vi?: string | null;
  slug: string;
};

/** Both media kinds live in `plant_images`, so the URL alone is ambiguous. */
export type StorefrontPlantImageType = "image" | "video";

export type StorefrontPlantImage = {
  id: string;
  url: string;
  type: StorefrontPlantImageType;
  alt_text: string | null;
  sort_order: number;
};

/** The detail endpoint adds a back-reference and audit timestamp. */
export type StorefrontPlantDetailImage = StorefrontPlantImage & {
  plant_id: string;
  created_at: string;
};

export type StorefrontPlantPotSize = {
  id: string;
  plant_id: string;
  name: string;
  price_adjustment: Decimal;
  price_adjustment_vi: Decimal | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Listing row. Carries everything a product card renders, so a catalogue page
 * never has to call the detail endpoint per card.
 */
export type StorefrontPlantListItem = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
  description: string | null;
  description_vi: string | null;
  price: Decimal;
  price_vi: Decimal | null;
  stock: number;
  is_featured: boolean;
  category?: StorefrontCategorySummary | null;
  images?: StorefrontPlantImage[];
};

export type StorefrontPlantListResponse = {
  items: StorefrontPlantListItem[];
  page: number;
  page_size: number;
  total: number;
};

export type StorefrontPlantDetail = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
  description: string | null;
  description_vi: string | null;
  price: Decimal;
  price_vi: Decimal | null;
  is_featured: boolean;
  in_stock: boolean;
  category?: StorefrontCategorySummary | null;
  images?: StorefrontPlantDetailImage[];
  pot_sizes?: StorefrontPlantPotSize[];
};

export type StorefrontPlantSort = "created_at" | "name" | "price" | "stock";

export type StorefrontSortOrder = "asc" | "desc";

/** Sort choices offered by the storefront UI. */
export type StorefrontPlantSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";
