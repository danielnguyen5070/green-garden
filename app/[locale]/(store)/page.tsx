import { Hero } from "@/components/home/hero";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { PlantList } from "@/components/plant/plant-list";
import {
  getPlantCategories,
  getPlants,
} from "@/services/plant.service";

export default async function HomePage() {
  const [plants, categories] = await Promise.all([
    getPlants(),
    getPlantCategories(),
  ]);

  return (
    <>
      <Hero />
      <PlantList plants={plants} categories={categories} />
      <NewsletterSection />
    </>
  );
}
