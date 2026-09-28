/**
 * Public storefront responses from `GET /api/v1/storefront/*`.
 *
 * Deliberately separate from `types/admin-plant.ts` and `types/category.ts`:
 * the storefront payloads omit SKU, stock counts, `is_active` and audit
 * timestamps, so reusing the admin types would promise fields that are never
 * sent to the public site.
 */

import type { OrderStatus } from "@/types/order";
import type { PlantCareAttributes } from "@/types/plant-attributes";

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

/** The pot size a card's "Add to cart" sells: the plant's first active one. */
export type StorefrontPotSizeSummary = {
  id: string;
  name: string;
  price_adjustment_vi: Decimal | null;
};

/**
 * Listing row. Carries everything a product card renders, so a catalogue page
 * never has to call the detail endpoint per card.
 *
 * `price_vi` is the VND selling price; `price` is a legacy column that is never
 * charged or shown.
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
  default_pot_size?: StorefrontPotSizeSummary | null;
};

export type StorefrontPlantListResponse = {
  items: StorefrontPlantListItem[];
  page: number;
  page_size: number;
  total: number;
};

/** Response from `GET /storefront/plants/search`. */
export type StorefrontPlantSearchResponse = {
  query: string;
  items: StorefrontPlantListItem[];
  total: number;
};

export type StorefrontPlantDetail = {
  id: string;
  name: string;
  name_vi: string | null;
  slug: string;
  description: string | null;
  description_vi: string | null;
  long_description: string | null;
  long_description_vi: string | null;
  price: Decimal;
  price_vi: Decimal | null;
  is_featured: boolean;
  in_stock: boolean;
  /** Dedicated social-share image from the admin plant form; may be null. */
  og_image_url: string | null;
  category?: StorefrontCategorySummary | null;
  images?: StorefrontPlantDetailImage[];
  pot_sizes?: StorefrontPlantPotSize[];
} & PlantCareAttributes;

/**
 * Public checkout payload for `POST /api/v1/storefront/orders`.
 *
 * Only the selection is sent: the backend prices every line from the catalogue
 * and ignores any amount in the body, so no unit price or total belongs here.
 */
export type StorefrontOrderItemRequest = {
  plant_id: string;
  quantity: number;
  /** Without one, the backend sells the plant's first active pot size. */
  pot_size_id?: string | null;
};

export type CreateStorefrontOrderRequest = {
  customer: {
    name: string;
    phone: string;
  };
  shipping_address: string;
  note?: string | null;
  items: StorefrontOrderItemRequest[];
};

/** Every storefront amount is in VND. */
export type StorefrontCurrency = "VND";

/** Confirmation returned on 201 — the source of truth for the order total. */
export type StorefrontOrderResponse = {
  id: string;
  order_number: string;
  status: OrderStatus;
  currency: StorefrontCurrency;
  subtotal_amount: Decimal;
  shipping_fee: Decimal;
  total_amount: Decimal;
  created_at: string;
};

/** A cart line for `POST /storefront/orders/quote`: the selection only. */
export type StorefrontQuoteItemRequest = {
  plant_id: string;
  quantity: number;
  pot_size_id?: string | null;
};

export type StorefrontQuoteRequest = {
  items: StorefrontQuoteItemRequest[];
};

/**
 * One priced cart line, in request order. An unavailable line (unknown or
 * inactive plant, no VND price, pot size off sale) costs nothing and may have
 * null catalogue fields. `max_quantity` is the plant's current stock.
 */
export type StorefrontQuoteLine = {
  plant_id: string;
  pot_size_id: string | null;
  quantity: number;
  available: boolean;
  slug: string | null;
  name: string | null;
  name_vi: string | null;
  image_url: string | null;
  pot_size_name: string | null;
  unit_price: Decimal;
  line_total: Decimal;
  max_quantity: number;
};

/** What checkout would charge right now. */
export type StorefrontQuoteResponse = {
  currency: StorefrontCurrency;
  lines: StorefrontQuoteLine[];
  subtotal_amount: Decimal;
  shipping_fee: Decimal;
  total_amount: Decimal;
  /** Shipping is free when the subtotal is strictly above this. */
  free_shipping_above: Decimal;
  amount_to_free_shipping: Decimal;
};

/** Response from `GET /storefront/shipping-policy`. */
export type StorefrontShippingPolicy = {
  currency: StorefrontCurrency;
  shipping_fee: Decimal;
  free_shipping_above: Decimal;
};

export type StorefrontPlantSort = "created_at" | "name" | "price" | "stock";

export type StorefrontSortOrder = "asc" | "desc";

/** Sort choices offered by the storefront UI. */
export type StorefrontPlantSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";
