import { cache } from "react";
import { permanentRedirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { getStorefrontPlantBySlug } from "@/lib/api/storefront";
import { isStorefrontSlug } from "@/lib/storefront/slug";
import type { StorefrontPlantDetail } from "@/types/storefront";

/**
 * The `detail` FastAPI sends for `PlantNotFoundError` (unknown or inactive
 * plant). The API has no machine-readable error code, and a 404 from nginx,
 * Cloudflare or an unknown route (`"Not Found"`) must not pass as a missing
 * plant, so this exact string is the only accepted signal.
 */
const PLANT_NOT_FOUND_DETAIL = "Plant not found";

function isPlantNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    error.detail === PLANT_NOT_FOUND_DETAIL
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

export { getPlantBySlugOrNull, redirectToCanonicalPlantSlug };
