import { api } from "@/lib/api/client";
import type {
  StorefrontCategoryListResponse,
  StorefrontPlantDetail,
  StorefrontPlantListResponse,
  StorefrontPlantSort,
  StorefrontSortOrder,
} from "@/types/storefront";

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
const MAX_PAGE_SIZE = 100;

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
    query: { page: 1, page_size: MAX_PAGE_SIZE },
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
