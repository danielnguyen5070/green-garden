import { cache } from "react";
import { permanentRedirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { getStorefrontPlantBySlug } from "@/lib/api/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

/**
 * Resolves a public plant by slug. Returns null for HTTP 404 so callers can
 * invoke `notFound()` without leaking API details. Other errors rethrow.
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
      if (error instanceof ApiError && error.status === 404) {
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
  if (urlSlug !== plant.slug) {
    permanentRedirect(`/${locale}/plants/${plant.slug}`);
  }
}

export { getPlantBySlugOrNull, redirectToCanonicalPlantSlug };
