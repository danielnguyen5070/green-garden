import { notFound, permanentRedirect } from "next/navigation";
import { getCatalogPagePlants } from "@/components/plant/plant-list-section";
import { getCatalogPath, parseCatalogPageSegment } from "@/lib/storefront/catalog";
import type { StorefrontCategory } from "@/types/storefront";

/**
 * Resolves a `/page/N` segment to a page past the first: 404s on a malformed
 * or out-of-range page and 308s `/page/1` to the base path. Throws, so call
 * it outside `try` blocks and above any Suspense / `loading.tsx` boundary,
 * or the status is lost to a streamed soft 404.
 */
export async function requireCatalogPage(
  locale: string,
  segment: string,
  category: StorefrontCategory | null
): Promise<number> {
  const page = parseCatalogPageSegment(segment);

  if (page === null) {
    notFound();
  }

  if (page === 1) {
    permanentRedirect(getCatalogPath(locale, category?.slug, 1));
  }

  const plants = await getCatalogPagePlants(page, category).catch(() => null);
  if (plants && plants.items.length === 0) {
    notFound();
  }

  return page;
}
