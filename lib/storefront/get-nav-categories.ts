import { getStorefrontCategories } from "@/lib/api/storefront";
import type { StorefrontCategory } from "@/types/storefront";

/**
 * Active categories for site-wide links (header, footer, homepage). Returns
 * an empty list when the catalog is unavailable so page chrome never fails.
 */
async function getNavCategories(): Promise<StorefrontCategory[]> {
  try {
    const { items } = await getStorefrontCategories();
    return items
      .filter((category) => category.slug)
      .sort((a, b) => a.sort_order - b.sort_order);
  } catch {
    return [];
  }
}

export { getNavCategories };
