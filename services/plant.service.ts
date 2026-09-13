import plantsData from "@/data/plants.json";
import { enrichPlant } from "@/lib/plant-detail";
import { selectRelatedPlants } from "@/lib/plant-query";
import type { Plant } from "@/types/plant";

const plants = (plantsData as Plant[]).map(enrichPlant);

function clonePlant(plant: Plant): Plant {
  return {
    ...plant,
    tags: [...plant.tags],
    images: plant.images ? [...plant.images] : undefined,
    potSizes: plant.potSizes ? [...plant.potSizes] : undefined,
    potColors: plant.potColors ? [...plant.potColors] : undefined,
    care: plant.care ? { ...plant.care } : undefined,
  };
}

/**
 * Plant catalog access layer.
 * Currently reads local JSON; swap the body for API calls later
 * without changing product listing UI consumers.
 */
export async function getPlants(): Promise<Plant[]> {
  return plants.map(clonePlant);
}

export async function getPlantBySlug(slug: string): Promise<Plant | null> {
  if (!slug || slug.includes("/") || slug.includes("..")) {
    return null;
  }

  const plant = plants.find((entry) => entry.slug === slug);
  if (!plant) return null;

  return clonePlant(plant);
}

export async function getPlantSlugs(): Promise<string[]> {
  return plants.map((plant) => plant.slug);
}

export async function getPlantCategories(): Promise<string[]> {
  const categories = new Set(plants.map((plant) => plant.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export async function getRelatedPlants(
  currentPlantId: string,
  limit = 4,
): Promise<Plant[]> {
  return selectRelatedPlants(plants, currentPlantId, limit).map(clonePlant);
}
