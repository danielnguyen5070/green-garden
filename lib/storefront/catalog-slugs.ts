import {
  STOREFRONT_PLANTS_MAX_PAGE_SIZE,
  STOREFRONT_PLANTS_PAGE_SIZE,
  getStorefrontCategories,
  getStorefrontPlants,
} from "@/lib/api/storefront";
import { withBuildFallback } from "@/lib/storefront/build-fallback";
import { toIsoDate } from "@/lib/seo/url";

/**
 * Every active plant and category, for the sitemap and `generateStaticParams`.
 * These throw when the API fails, even mid-pagination, so a sitemap
 * regeneration keeps the last complete copy instead of dropping products, and
 * `next build` fails rather than publish an empty sitemap. Only an offline
 * build (`ALLOW_BUILD_WITHOUT_API=1`) gets an empty list; missing slugs then
 * render on their first visit.
 */

export type CatalogSlug = {
  slug: string;
  updatedAt: string | undefined;
};

export type CatalogPlantSlug = CatalogSlug & {
  categorySlug: string | null;
};

async function fetchAllCategorySlugs(): Promise<CatalogSlug[]> {
  const { items } = await getStorefrontCategories();
  return items
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      slug: category.slug,
      updatedAt: toIsoDate(category.updated_at),
    }));
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

export function getAllCategorySlugs(): Promise<CatalogSlug[]> {
  return withBuildFallback(fetchAllCategorySlugs(), []);
}

export function getAllPlantSlugs(): Promise<CatalogPlantSlug[]> {
  return withBuildFallback(fetchAllPlantSlugs(), []);
}

/** Catalog page numbers past the first, as `generateStaticParams` strings. */
export function getExtraCatalogPages(plantCount: number): string[] {
  const pageCount = Math.ceil(plantCount / STOREFRONT_PLANTS_PAGE_SIZE);
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
    String(index + 2)
  );
}
