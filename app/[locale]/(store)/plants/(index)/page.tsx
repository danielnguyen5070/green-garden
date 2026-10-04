import type { Metadata } from "next";
import {
  PlantsCatalog,
  buildPlantsCatalogMetadata,
} from "../plants-catalog";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPlantsCatalogMetadata(locale, 1);
}

export default function PlantsPage() {
  return <PlantsCatalog page={1} />;
}
