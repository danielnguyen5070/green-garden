import plantsData from "@/data/plants.json";
import type { Plant } from "@/types/plant";

const plants = plantsData as Plant[];

/**
 * Plant catalog access layer.
 * Currently reads local JSON; swap the body for API calls later
 * without changing product listing UI consumers.
 */
export async function getPlants(): Promise<Plant[]> {
  return plants.map((plant) => ({ ...plant, tags: [...plant.tags] }));
}

export async function getPlantCategories(): Promise<string[]> {
  const categories = new Set(plants.map((plant) => plant.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
