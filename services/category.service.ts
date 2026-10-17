import { cache } from "react";
import { getStorefrontCategories } from "@/lib/api/storefront";
import { toIsoDate } from "@/lib/seo/url";
import { withBuildFallback } from "@/lib/storefront/build-fallback";
import type { StorefrontCategory } from "@/types/storefront";

export type CatalogSlug = {
  slug: string;
  updatedAt: string | undefined;
};

/**
 * Resolves an active storefront category by slug. The API has no by-slug
 * endpoint, so this reads the (already small, cached) category list.
 *
 * Safe to call from `generateMetadata`, layout, and page — React `cache()`
 * collapses them into one lookup per request.
 */
const getCategoryBySlugOrNull = cache(
  async (slug: string): Promise<StorefrontCategory | null> => {
    const { items } = await getStorefrontCategories();
    return items.find((category) => category.slug === slug) ?? null;
  }
);

async function fetchNavCategories(): Promise<StorefrontCategory[]> {
  const { items } = await getStorefrontCategories();
  return items
    .filter((category) => category.slug)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Active categories for site-wide links (header, footer, homepage). Throws
 * when the catalog is unavailable so a regenerating page keeps its cached
 * links; only an offline build falls back to an empty list.
 */
function getNavCategories(): Promise<StorefrontCategory[]> {
  return withBuildFallback(fetchNavCategories(), []);
}

async function fetchAllCategorySlugs(): Promise<CatalogSlug[]> {
  const { items } = await getStorefrontCategories();
  return items
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      slug: category.slug,
      updatedAt: toIsoDate(category.updated_at),
    }));
}

/**
 * Every active category slug for the sitemap and `generateStaticParams`.
 * Throws when the API fails so a sitemap regeneration keeps the last
 * complete copy; only an offline build gets an empty list.
 */
function getAllCategorySlugs(): Promise<CatalogSlug[]> {
  return withBuildFallback(fetchAllCategorySlugs(), []);
}

export { getCategoryBySlugOrNull, getNavCategories, getAllCategorySlugs };
