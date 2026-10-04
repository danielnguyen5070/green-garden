import { requireCatalogPage } from "@/lib/storefront/require-catalog-page";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; page: string }>;
};

/**
 * Validate the page above `loading.tsx` so a bad or out-of-range page
 * returns a real 404 (and `/page/1` a real 308) instead of a streamed one.
 */
export default async function PlantsCatalogPageLayout({
  children,
  params,
}: Props) {
  const { locale, page } = await params;
  await requireCatalogPage(locale, page, null);
  return children;
}
