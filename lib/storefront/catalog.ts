/**
 * Crawlable catalog URLs: `/plants` for the full catalog,
 * `/categories/{slug}` per category, and `?page=N` for every page past the
 * first so each product is reachable through plain links.
 */

export const CATALOG_PAGE_PARAM = "page";

/** Locale-less pathname for the catalog, or one of its categories. */
export function getCatalogPathname(categorySlug?: string | null): string {
  return categorySlug ? `/categories/${categorySlug}` : "/plants";
}

/** `Link` href for a catalog page; page 1 never carries `?page=`. */
export function getCatalogHref(
  categorySlug: string | null | undefined,
  page: number
): { pathname: string; query?: Record<string, string> } {
  const pathname = getCatalogPathname(categorySlug);
  return page > 1
    ? { pathname, query: { [CATALOG_PAGE_PARAM]: String(page) } }
    : { pathname };
}

/** Locale-prefixed path, used for canonical and hreflang URLs. */
export function getCatalogPath(
  locale: string,
  categorySlug: string | null | undefined,
  page: number
): string {
  const path = `/${locale}${getCatalogPathname(categorySlug)}`;
  return page > 1 ? `${path}?${CATALOG_PAGE_PARAM}=${page}` : path;
}

/**
 * Reads `?page=`. A missing value is page 1; anything that is not a positive
 * integer (or is repeated) returns null so the route can 404.
 */
export function parseCatalogPage(
  value: string | string[] | undefined
): number | null {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d{0,5}$/.test(value)) return null;
  return Number(value);
}
