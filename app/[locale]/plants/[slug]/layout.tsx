import { notFound } from "next/navigation";
import { StoreChrome } from "@/components/layout/store-chrome";
import { getPlantBySlugOrNull } from "@/lib/storefront/get-plant-by-slug";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

/**
 * Resolve the plant before mounting store chrome so a missing slug can render
 * the standalone locale `not-found` without Header/Footer.
 */
export default async function PlantDetailLayout({ children, params }: Props) {
  const { slug } = await params;
  const plant = await getPlantBySlugOrNull(slug);

  if (!plant) {
    notFound();
  }

  return <StoreChrome>{children}</StoreChrome>;
}
