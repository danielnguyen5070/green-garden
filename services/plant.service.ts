import { cache } from "react";
import { permanentRedirect } from "next/navigation";
import { ApiError, ErrorCode } from "@/lib/api/errors";
import {
  STOREFRONT_PLANTS_MAX_PAGE_SIZE,
  STOREFRONT_PLANTS_PAGE_SIZE,
  getStorefrontPlantBySlug,
  getStorefrontPlants,
} from "@/lib/api/storefront";
import { toIsoDate } from "@/lib/seo/url";
import { withBuildFallback } from "@/lib/storefront/build-fallback";
import { isStorefrontSlug } from "@/lib/storefront/slug";
import { getCategoryBySlugOrNull } from "@/services/category.service";
import type {
  StorefrontCategory,
  StorefrontPlantDetail,
  StorefrontPlantListItem,
} from "@/types/storefront";

/** Compact homepage strip — not the full catalog. */
export const FEATURED_PLANTS_LIMIT = 4;

export const RELATED_PLANTS_LIMIT = 4;

export const FRUIT_TREES_SLUG = "fruit-trees";
export const FRUIT_TREES_PRODUCT_LIMIT = 4;

export type CatalogPlantSlug = {
  slug: string;
  updatedAt: string | undefined;
  categorySlug: string | null;
};

/**
 * Only the API's `PLANT_NOT_FOUND` code (unknown or inactive plant) counts. A
 * 404 from nginx, Cloudflare or an unknown route carries no code or the
 * generic `NOT_FOUND` one, and must not pass as a missing plant.
 */
function isPlantNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.errorCode === ErrorCode.PLANT_NOT_FOUND
  );
}

/**
 * Resolves a public plant by slug. Returns null only when the API says the
 * plant does not exist, so callers can invoke `notFound()`. Every other error,
 * including a generic 404, rethrows: a regenerating page then keeps its last
 * good copy instead of caching a 404.
 *
 * The API also resolves case/separator variants and slugs the plant used
 * before a rename; `plant.slug` is always the current, canonical slug.
 *
 * Safe to call from `generateMetadata`, layout, and page — React `cache()`
 * collapses them into one lookup per request, including ISR renders where
 * fetch memoization does not apply.
 */
const getPlantBySlugOrNull = cache(
  async (slug: string): Promise<StorefrontPlantDetail | null> => {
    try {
      return await getStorefrontPlantBySlug(slug);
    } catch (error) {
      if (isPlantNotFound(error)) {
        return null;
      }
      throw error;
    }
  }
);

/**
 * 308-redirects to the canonical plant URL when the requested slug is a
 * variant or an old slug. Must run outside `try` blocks: it throws.
 */
function redirectToCanonicalPlantSlug(
  locale: string,
  urlSlug: string,
  plant: StorefrontPlantDetail
): void {
  if (!isStorefrontSlug(plant.slug)) {
    throw new Error(`Invalid canonical slug for plant ${plant.id}`);
  }

  if (urlSlug !== plant.slug) {
    permanentRedirect(`/${locale}/plants/${plant.slug}`);
  }
}

/**
 * The page of plants the catalog section renders. Routes call it before
 * streaming starts so an out-of-range page gets a real 404; the identical
 * request is deduplicated with the section's own.
 */
function getCatalogPagePlants(
  page: number,
  category: StorefrontCategory | null
) {
  return getStorefrontPlants({
    page,
    page_size: STOREFRONT_PLANTS_PAGE_SIZE,
    category_id: category?.id,
    sort: "created_at",
    order: "desc",
  });
}

async function fetchAllPlantSlugs(): Promise<CatalogPlantSlug[]> {
  const plants: CatalogPlantSlug[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while ((page - 1) * STOREFRONT_PLANTS_MAX_PAGE_SIZE < total) {
    const response = await getStorefrontPlants({
      page,
      page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE,
    });

    for (const plant of response.items) {
      if (plant.slug) {
        plants.push({
          slug: plant.slug,
          updatedAt: toIsoDate(plant.updated_at),
          categorySlug: plant.category?.slug ?? null,
        });
      }
    }

    total = response.total;

    if (response.items.length === 0) {
      break;
    }

    page += 1;
  }

  return plants;
}

/**
 * Every active plant slug for the sitemap and `generateStaticParams`.
 * Throws when the API fails, even mid-pagination, so a sitemap regeneration
 * keeps the last complete copy instead of dropping products, and `next build`
 * fails rather than publish an empty sitemap. Only an offline build
 * (`ALLOW_BUILD_WITHOUT_API=1`) gets an empty list; missing slugs then
 * render on their first visit.
 */
function getAllPlantSlugs(): Promise<CatalogPlantSlug[]> {
  return withBuildFallback(fetchAllPlantSlugs(), []);
}

async function fetchFeaturedPlants(): Promise<StorefrontPlantListItem[]> {
  const featured = await getStorefrontPlants({
    page: 1,
    page_size: FEATURED_PLANTS_LIMIT,
    is_featured: true,
    sort: "created_at",
    order: "desc",
  });

  if (featured.items.length > 0) {
    return featured.items.slice(0, FEATURED_PLANTS_LIMIT);
  }

  // Keep the homepage populated when nothing is marked featured yet.
  const fallback = await getStorefrontPlants({
    page: 1,
    page_size: FEATURED_PLANTS_LIMIT,
    sort: "created_at",
    order: "desc",
  });
  return fallback.items.slice(0, FEATURED_PLANTS_LIMIT);
}

/** Featured (or newest) plants for the homepage strip. Offline build → null. */
function loadFeaturedPlants(): Promise<StorefrontPlantListItem[] | null> {
  return withBuildFallback(fetchFeaturedPlants(), null);
}

/**
 * The `limit` plants after `plantId` in catalog order, wrapping to the start.
 * Every product in a category gets inbound links from its neighbours instead
 * of every page linking to the same newest few.
 */
function pickRelatedNeighbours(
  items: StorefrontPlantListItem[],
  plantId: string,
  limit: number
): StorefrontPlantListItem[] {
  // With the current plant removed, its own index points at the next neighbour.
  const start = Math.max(
    items.findIndex((item) => item.id === plantId),
    0
  );
  const others = items.filter((item) => item.id !== plantId);

  return [...others.slice(start), ...others.slice(0, start)].slice(0, limit);
}

/**
 * One listing request scoped to the plant's own category (in catalog order),
 * rather than a detail lookup per card. Offline build → null.
 */
function loadRelatedCategoryPlants(
  categoryId: string
): Promise<{ items: StorefrontPlantListItem[] } | null> {
  return withBuildFallback(
    getStorefrontPlants({
      category_id: categoryId,
      page_size: STOREFRONT_PLANTS_MAX_PAGE_SIZE,
      sort: "created_at",
      order: "desc",
    }),
    null
  );
}

async function fetchFruitTrees(): Promise<{
  category: StorefrontCategory;
  plants: StorefrontPlantListItem[];
} | null> {
  const category = await getCategoryBySlugOrNull(FRUIT_TREES_SLUG);
  if (!category) return null;

  const { items } = await getStorefrontPlants({
    category_id: category.id,
    page: 1,
    page_size: FRUIT_TREES_PRODUCT_LIMIT,
    sort: "created_at",
    order: "desc",
  });

  return {
    category,
    plants: items.slice(0, FRUIT_TREES_PRODUCT_LIMIT),
  };
}

/**
 * Homepage teaser for the Fruit Trees category. Offline build → null.
 */
function loadFruitTrees(): Promise<{
  category: StorefrontCategory;
  plants: StorefrontPlantListItem[];
} | null> {
  return withBuildFallback(fetchFruitTrees(), null);
}

export {
  getPlantBySlugOrNull,
  redirectToCanonicalPlantSlug,
  getCatalogPagePlants,
  getAllPlantSlugs,
  loadFeaturedPlants,
  pickRelatedNeighbours,
  loadRelatedCategoryPlants,
  loadFruitTrees,
};
