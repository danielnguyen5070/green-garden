import { getStorefrontCategories } from "@/lib/api/storefront";
import { withBuildFallback } from "@/lib/storefront/build-fallback";
import type { StorefrontCategory } from "@/types/storefront";

async function fetchNavCategories(): Promise<StorefrontCategory[]> {
  const { items } = await getStorefrontCategories();
  return items
    .filter((category) => category.slug)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Active categories for site-wide links (header, footer, homepage). Throws
 * when the catalog is unavailable so a regenerating page keeps its cached
 * links; only `next build` falls back to an empty list.
 */
function getNavCategories(): Promise<StorefrontCategory[]> {
  return withBuildFallback(fetchNavCategories(), []);
}

export { getNavCategories };
