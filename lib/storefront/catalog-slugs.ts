import {
  STOREFRONT_PLANTS_MAX_PAGE_SIZE,
  STOREFRONT_PLANTS_PAGE_SIZE,
  getStorefrontCategories,
  getStorefrontPlants,
} from "@/lib/api/storefront";
import { toIsoDate } from "@/lib/seo/url";

/**
 * Every active plant and category, for the sitemap and `generateStaticParams`.
 * The catalog may be unavailable at build time, so these never throw: a
 * missing slug is simply rendered on its first visit instead.
 */

export type CatalogSlug = {
  slug: string;
  updatedAt: string | undefined;
};

export type CatalogPlantSlug = CatalogSlug & {
  categorySlug: string | null;
};

export async function getAllCategorySlugs(): Promise<CatalogSlug[]> {
  try {
    const { items } = await getStorefrontCategories();
    return items
      .filter((category) => Boolean(category.slug))
      .map((category) => ({
        slug: category.slug,
        updatedAt: toIsoDate(category.updated_at),
      }));
  } catch {
    return [];
  }
}

export async function getAllPlantSlugs(): Promise<CatalogPlantSlug[]> {
  const plants: CatalogPlantSlug[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  try {
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
  } catch {
    return plants;
  }

  return plants;
}

/** Catalog page numbers past the first, as `generateStaticParams` strings. */
export function getExtraCatalogPages(plantCount: number): string[] {
  const pageCount = Math.ceil(plantCount / STOREFRONT_PLANTS_PAGE_SIZE);
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
    String(index + 2)
  );
}
