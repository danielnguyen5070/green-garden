import { STOREFRONT_PLANTS_PAGE_SIZE } from "@/lib/api/storefront";

/** Catalog page numbers past the first, as `generateStaticParams` strings. */
export function getExtraCatalogPages(plantCount: number): string[] {
  const pageCount = Math.ceil(plantCount / STOREFRONT_PLANTS_PAGE_SIZE);
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
    String(index + 2)
  );
}
