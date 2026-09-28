import { notFound } from "next/navigation";
import { StoreChrome } from "@/components/layout/store-chrome";
import {
  getPlantBySlugOrNull,
  redirectToCanonicalPlantSlug,
} from "@/lib/storefront/get-plant-by-slug";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Resolve the plant before mounting store chrome so a missing slug can render
 * the standalone locale `not-found` without Header/Footer, and a stale slug
 * redirects before any chrome renders.
 */
export default async function PlantDetailLayout({ children, params }: Props) {
  const { locale, slug } = await params;
  const plant = await getPlantBySlugOrNull(slug);

  if (!plant) {
    notFound();
  }

  redirectToCanonicalPlantSlug(locale, slug, plant);

  return <StoreChrome>{children}</StoreChrome>;
}
