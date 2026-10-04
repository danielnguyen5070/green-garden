import type { Metadata } from "next";
import {
  getAllPlantSlugs,
  getExtraCatalogPages,
} from "@/lib/storefront/catalog-slugs";
import { parseCatalogPageSegment } from "@/lib/storefront/catalog";
import { requireCatalogPage } from "@/lib/storefront/require-catalog-page";
import {
  PlantsCatalog,
  buildPlantsCatalogMetadata,
} from "../../plants-catalog";

type Props = {
  params: Promise<{ locale: string; page: string }>;
};

export async function generateStaticParams() {
  const plants = await getAllPlantSlugs();
  return getExtraCatalogPages(plants.length).map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page: segment } = await params;
  const page = parseCatalogPageSegment(segment);

  if (page === null || page === 1) {
    return {};
  }

  return buildPlantsCatalogMetadata(locale, page);
}

export default async function PlantsCatalogPage({ params }: Props) {
  const { locale, page: segment } = await params;
  const page = await requireCatalogPage(locale, segment, null);

  return <PlantsCatalog page={page} />;
}
