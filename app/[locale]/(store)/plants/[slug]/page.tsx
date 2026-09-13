import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlantDetail } from "@/components/plant/plant-detail";
import { RelatedPlants } from "@/components/plant/related-plants";
import { routing } from "@/i18n/routing";
import {
  getPlantBySlug,
  getPlantSlugs,
  getRelatedPlants,
} from "@/services/plant.service";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPlantSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);

  if (!plant) {
    return {};
  }

  return {
    title: `${plant.name} | Green Garden`,
    description: plant.longDescription ?? plant.description,
  };
}

export default async function PlantDetailPage({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);

  if (!plant) {
    notFound();
  }

  const relatedPlants = await getRelatedPlants(plant.id, 4);

  return (
    <>
      <PlantDetail plant={plant} />
      <RelatedPlants plants={relatedPlants} />
    </>
  );
}
