import { api } from "@/lib/api/client";
import { ApiError, INVALID_RESPONSE_MESSAGE } from "@/lib/api/errors";
import { isStorefrontSlug } from "@/lib/storefront/slug";
import type {
  CreateStorefrontOrderRequest,
  StorefrontCategoryListResponse,
  StorefrontOrderResponse,
  StorefrontPaymentStatus,
  StorefrontPlantDetail,
  StorefrontPlantListResponse,
  StorefrontPlantSearchResponse,
  StorefrontPlantSort,
  StorefrontQuoteRequest,
  StorefrontQuoteResponse,
  StorefrontShippingPolicy,
  StorefrontSortOrder,
} from "@/types/storefront";
import type {
  StorefrontReview,
  StorefrontReviewCreateRequest,
  StorefrontReviewListResponse,
} from "@/types/storefront-review";
import type { AppLocale } from "@/i18n/routing";
import { CACHE_TAGS } from "@/lib/storefront/cache-tags";

/**
 * Storefront endpoints are public. Opting out of the shared client's refresh
 * and redirect flow keeps a visitor from ever being sent to `/admin/login`
 * because of a failed catalog request.
 */
const PUBLIC_REQUEST = {
  skipAuthRefresh: true,
  skipAuthRedirect: true,
} as const;

/**
 * Admin edits and FastAPI webhooks invalidate catalog tags on demand; this
 * window is only a safety net for a missed notification.
 */
const CATALOG_REVALIDATE_SECONDS = 6 * 60 * 60;

/** Cards per Homepage page, and per "Load more" step. */
export const STOREFRONT_PLANTS_PAGE_SIZE = 8;

/** The API caps `page_size` at 100. */
export const STOREFRONT_PLANTS_MAX_PAGE_SIZE = 100;

/** Approved reviews per Reviews page load / "Load more" step. */
export const STOREFRONT_REVIEWS_PAGE_SIZE = 8;

/** Approved reviews per plant detail page load / "Load more" step. */
export const STOREFRONT_PLANT_REVIEWS_PAGE_SIZE = 6;

/** Moderation invalidates review tags on demand; same safety net as the catalog. */
const REVIEWS_REVALIDATE_SECONDS = 6 * 60 * 60;

type RequestContext = {
  signal?: AbortSignal;
};

type GetOptions = NonNullable<Parameters<typeof api.get>[1]>;

/**
 * Catalog reads feed statically rendered pages, so a malformed 200 must throw:
 * a regenerating page then keeps its last good copy instead of rendering it.
 */
function invalidResponse(path: string): ApiError {
  return new ApiError(200, INVALID_RESPONSE_MESSAGE, { error: { path } });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isListResponse(
  value: unknown
): value is { items: Record<string, unknown>[]; total: number } {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isRecord) &&
    typeof value.total === "number" &&
    Number.isInteger(value.total) &&
    value.total >= 0
  );
}

async function getList<T>(path: string, options: GetOptions): Promise<T> {
  const payload = await api.get<unknown>(path, options);
  if (!isListResponse(payload)) throw invalidResponse(path);
  return payload as T;
}

async function getRecord<T>(path: string, options: GetOptions): Promise<T> {
  const payload = await api.get<unknown>(path, options);
  if (!isRecord(payload)) throw invalidResponse(path);
  return payload as T;
}

export type StorefrontPlantsParams = {
  page?: number;
  page_size?: number;
  /** Matches plant name or SKU. */
  search?: string;
  category_id?: string;
  is_featured?: boolean;
  min_price?: string;
  max_price?: string;
  sort?: StorefrontPlantSort;
  order?: StorefrontSortOrder;
};

export async function getStorefrontCategories(
  context: RequestContext = {}
): Promise<StorefrontCategoryListResponse> {
  return getList<StorefrontCategoryListResponse>("/storefront/categories", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.categories],
    // The backend already limits this to active categories.
    query: { page: 1, page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE },
  });
}

export async function getStorefrontPlants(
  params: StorefrontPlantsParams = {},
  context: RequestContext = {}
): Promise<StorefrontPlantListResponse> {
  return getList<StorefrontPlantListResponse>("/storefront/plants", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.plants],
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? STOREFRONT_PLANTS_PAGE_SIZE,
      search: params.search,
      category_id: params.category_id,
      is_featured: params.is_featured,
      min_price: params.min_price,
      max_price: params.max_price,
      sort: params.sort,
      order: params.order,
    },
  });
}

/** Default cap for keyword search results (API max is 100). */
export const STOREFRONT_PLANTS_SEARCH_LIMIT = 20;

export type StorefrontPlantSearchParams = {
  q: string;
  locale: AppLocale;
  limit?: number;
};

/**
 * Locale-aware keyword search over the active catalogue.
 * `locale` selects which name/description columns the API matches against.
 */
export async function searchStorefrontPlants(
  params: StorefrontPlantSearchParams,
  context: RequestContext = {}
): Promise<StorefrontPlantSearchResponse> {
  return getList<StorefrontPlantSearchResponse>("/storefront/plants/search", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.plants],
    query: {
      q: params.q,
      locale: params.locale,
      limit: params.limit ?? STOREFRONT_PLANTS_SEARCH_LIMIT,
    },
  });
}

/**
 * Prices the cart exactly as checkout will, without creating an order. The
 * cart holds only plant, pot size and quantity; everything shown comes from
 * here.
 */
export async function quoteStorefrontCart(
  payload: StorefrontQuoteRequest,
  context: RequestContext = {}
): Promise<StorefrontQuoteResponse> {
  return api.post<StorefrontQuoteResponse>("/storefront/orders/quote", payload, {
    ...PUBLIC_REQUEST,
    signal: context.signal,
  });
}

/** Shipping rules change rarely; the same short window as the catalogue. */
export async function getStorefrontShippingPolicy(
  context: RequestContext = {}
): Promise<StorefrontShippingPolicy> {
  return getRecord<StorefrontShippingPolicy>("/storefront/shipping-policy", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.shippingPolicy],
  });
}

/**
 * Places a cash-on-delivery or bank-transfer order. No account, no token: the
 * phone number in the payload is the only identity the backend needs.
 */
export async function createStorefrontOrder(
  payload: CreateStorefrontOrderRequest,
  context: RequestContext = {}
): Promise<StorefrontOrderResponse> {
  return api.post<StorefrontOrderResponse>("/storefront/orders", payload, {
    ...PUBLIC_REQUEST,
    signal: context.signal,
  });
}

/** Live payment state of a placed order, polled by the thank-you page. */
export async function getStorefrontOrderPayment(
  orderId: string,
  context: RequestContext = {}
): Promise<StorefrontPaymentStatus> {
  return api.get<StorefrontPaymentStatus>(
    `/storefront/orders/${encodeURIComponent(orderId)}/payment`,
    {
      ...PUBLIC_REQUEST,
      signal: context.signal,
    }
  );
}

export async function getStorefrontPlantBySlug(
  slug: string,
  context: RequestContext = {}
): Promise<StorefrontPlantDetail> {
  const path = `/storefront/plants/${encodeURIComponent(slug)}`;
  const payload = await api.get<unknown>(path, {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    // `slug` may be a variant or old slug, so `plants` also covers it.
    tags: [CACHE_TAGS.plants, CACHE_TAGS.plant(slug)],
  });

  // The canonical-slug redirect and every plant URL are built from `slug`.
  if (!isRecord(payload) || !isStorefrontSlug(payload.slug)) {
    throw invalidResponse(path);
  }
  return payload as StorefrontPlantDetail;
}

export type StorefrontReviewsParams = {
  page?: number;
  page_size?: number;
};

export async function getStorefrontReviews(
  params: StorefrontReviewsParams = {},
  context: RequestContext = {}
): Promise<StorefrontReviewListResponse> {
  return getList<StorefrontReviewListResponse>("/storefront/reviews", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: REVIEWS_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.reviews],
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? STOREFRONT_REVIEWS_PAGE_SIZE,
    },
  });
}

/**
 * Loads every approved review page so average/distribution can be derived when
 * the list endpoint does not yet return summary fields.
 */
export async function getAllStorefrontReviews(
  context: RequestContext = {}
): Promise<StorefrontReview[]> {
  const first = await getStorefrontReviews(
    { page: 1, page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE },
    context
  );

  const items = [...first.items];
  const totalPages = Math.max(
    1,
    Math.ceil(first.total / STOREFRONT_PLANTS_MAX_PAGE_SIZE)
  );

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getStorefrontReviews(
      { page, page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE },
      context
    );
    items.push(...response.items);
  }

  return items;
}

export async function createStorefrontReview(
  payload: StorefrontReviewCreateRequest,
  context: RequestContext = {}
): Promise<StorefrontReview> {
  return api.post<StorefrontReview>("/storefront/reviews", payload, {
    ...PUBLIC_REQUEST,
    signal: context.signal,
  });
}

/** Approved reviews of one plant, with that plant's rating summary. */
export async function getStorefrontPlantReviews(
  slug: string,
  params: StorefrontReviewsParams = {},
  context: RequestContext = {}
): Promise<StorefrontReviewListResponse> {
  return getList<StorefrontReviewListResponse>(
    `/storefront/plants/${encodeURIComponent(slug)}/reviews`,
    {
      ...PUBLIC_REQUEST,
      signal: context.signal,
      revalidate: REVIEWS_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.reviews, CACHE_TAGS.plantReviews(slug)],
      query: {
        page: params.page ?? 1,
        page_size: params.page_size ?? STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
      },
    }
  );
}

export async function createStorefrontPlantReview(
  slug: string,
  payload: StorefrontReviewCreateRequest,
  context: RequestContext = {}
): Promise<StorefrontReview> {
  return api.post<StorefrontReview>(
    `/storefront/plants/${encodeURIComponent(slug)}/reviews`,
    payload,
    {
      ...PUBLIC_REQUEST,
      signal: context.signal,
    }
  );
}
