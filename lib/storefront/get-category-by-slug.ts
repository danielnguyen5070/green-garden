import { cache } from "react";
import { getStorefrontCategories } from "@/lib/api/storefront";
import type { StorefrontCategory } from "@/types/storefront";

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

export { getCategoryBySlugOrNull };
