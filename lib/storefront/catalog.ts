/**
 * Crawlable catalog URLs: `/plants` for the full catalog,
 * `/categories/{slug}` per category, and `/page/N` appended for every page
 * past the first so each product is reachable through plain links. Path
 * segments (not `?page=`) keep every catalog page statically renderable.
 */

import { z } from "zod";

const catalogPageSchema = z
  .string()
  .regex(/^[1-9]\d{0,5}$/)
  .transform((value) => Number(value));

/** Locale-less pathname for the catalog, or one of its categories. */
export function getCatalogPathname(categorySlug?: string | null): string {
  return categorySlug ? `/categories/${categorySlug}` : "/plants";
}

/** Locale-less pathname for one catalog page; page 1 never carries `/page/1`. */
function getCatalogPagePathname(
  categorySlug: string | null | undefined,
  page: number
): string {
  const pathname = getCatalogPathname(categorySlug);
  return page > 1 ? `${pathname}/page/${page}` : pathname;
}

/** `Link` href for a catalog page. */
export function getCatalogHref(
  categorySlug: string | null | undefined,
  page: number
): { pathname: string } {
  return { pathname: getCatalogPagePathname(categorySlug, page) };
}

/** Locale-prefixed path, used for canonical and hreflang URLs. */
export function getCatalogPath(
  locale: string,
  categorySlug: string | null | undefined,
  page: number
): string {
  return `/${locale}${getCatalogPagePathname(categorySlug, page)}`;
}

/**
 * Reads the `/page/N` segment. Anything that is not a positive integer
 * returns null so the route can 404; page 1 is returned as-is so the route
 * can redirect to the base path.
 */
export function parseCatalogPageSegment(value: string): number | null {
  const result = catalogPageSchema.safeParse(value);
  return result.success ? result.data : null;
}

/**
 * Reads a legacy `?page=` value. Returns the page when it is a positive
 * integer, otherwise null.
 */
export function parseLegacyCatalogPage(value: string | null): number | null {
  if (value === null) return null;
  const result = catalogPageSchema.safeParse(value);
  return result.success ? result.data : null;
}
