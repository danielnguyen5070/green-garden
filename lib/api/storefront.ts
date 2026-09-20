import { api } from "@/lib/api/client";
import type {
  CreateStorefrontOrderRequest,
  StorefrontCategoryListResponse,
  StorefrontOrderResponse,
  StorefrontPlantDetail,
  StorefrontPlantListResponse,
  StorefrontPlantSearchResponse,
  StorefrontPlantSort,
  StorefrontSortOrder,
} from "@/types/storefront";
import type {
  StorefrontReview,
  StorefrontReviewCreateRequest,
  StorefrontReviewListResponse,
} from "@/types/storefront-review";
import type { AppLocale } from "@/i18n/routing";

/**
 * Storefront endpoints are public. Opting out of the shared client's refresh
 * and redirect flow keeps a visitor from ever being sent to `/admin/login`
 * because of a failed catalog request.
 */
const PUBLIC_REQUEST = {
  skipAuthRefresh: true,
  skipAuthRedirect: true,
} as const;

/** Catalog data changes rarely; a short Data Cache window is plenty. */
const CATALOG_REVALIDATE_SECONDS = 60;

/** Cards per Homepage page, and per "Load more" step. */
export const STOREFRONT_PLANTS_PAGE_SIZE = 8;

/** The API caps `page_size` at 100. */
export const STOREFRONT_PLANTS_MAX_PAGE_SIZE = 100;

/** Approved reviews per Reviews page load / "Load more" step. */
export const STOREFRONT_REVIEWS_PAGE_SIZE = 8;

/** Reviews change when admins moderate; keep a short Data Cache window. */
const REVIEWS_REVALIDATE_SECONDS = 60;

type RequestContext = {
  signal?: AbortSignal;
};

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
  return api.get<StorefrontCategoryListResponse>("/storefront/categories", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    // The backend already limits this to active categories.
    query: { page: 1, page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE },
  });
}

export async function getStorefrontPlants(
  params: StorefrontPlantsParams = {},
  context: RequestContext = {}
): Promise<StorefrontPlantListResponse> {
  return api.get<StorefrontPlantListResponse>("/storefront/plants", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
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
  return api.get<StorefrontPlantSearchResponse>("/storefront/plants/search", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    query: {
      q: params.q,
      locale: params.locale,
      limit: params.limit ?? STOREFRONT_PLANTS_SEARCH_LIMIT,
    },
  });
}

/**
 * Places a cash-on-delivery order. No account, no token: the phone number in
 * the payload is the only identity the backend needs.
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

export async function getStorefrontPlantBySlug(
  slug: string,
  context: RequestContext = {}
): Promise<StorefrontPlantDetail> {
  return api.get<StorefrontPlantDetail>(
    `/storefront/plants/${encodeURIComponent(slug)}`,
    {
      ...PUBLIC_REQUEST,
      signal: context.signal,
      revalidate: CATALOG_REVALIDATE_SECONDS,
    }
  );
}

export type StorefrontReviewsParams = {
  page?: number;
  page_size?: number;
};

export async function getStorefrontReviews(
  params: StorefrontReviewsParams = {},
  context: RequestContext = {}
): Promise<StorefrontReviewListResponse> {
  return api.get<StorefrontReviewListResponse>("/storefront/reviews", {
    ...PUBLIC_REQUEST,
    signal: context.signal,
    revalidate: REVIEWS_REVALIDATE_SECONDS,
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
