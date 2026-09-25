import { ApiError } from "@/lib/api/errors";
import { getStorefrontPlantBySlug } from "@/lib/api/storefront";
import type { StorefrontPlantDetail } from "@/types/storefront";

/**
 * Resolves a public plant by slug. Returns null for HTTP 404 so callers can
 * invoke `notFound()` without leaking API details. Other errors rethrow.
 *
 * Safe to call from `generateMetadata`, layout, and page — fetch memoization
 * collapses them into one request per render.
 */
async function getPlantBySlugOrNull(
  slug: string
): Promise<StorefrontPlantDetail | null> {
  try {
    return await getStorefrontPlantBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export { getPlantBySlugOrNull };
