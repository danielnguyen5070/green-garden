import type { Plant, PlantSortOption } from "@/types/plant";

export function sortPlants(items: Plant[], sort: PlantSortOption): Plant[] {
  const next = [...items];

  switch (sort) {
    case "newest":
      return next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "price-asc":
      return next.sort((a, b) => a.price - b.price);
    case "price-desc":
      return next.sort((a, b) => b.price - a.price);
    case "best-selling":
      return next.sort((a, b) => b.soldCount - a.soldCount);
    case "featured":
    default:
      return next.sort((a, b) => {
        if (a.bestseller !== b.bestseller) {
          return a.bestseller ? -1 : 1;
        }
        return b.soldCount - a.soldCount;
      });
  }
}

export function filterPlants(
  items: Plant[],
  {
    search = "",
    category = "all",
  }: {
    search?: string;
    category?: string;
  }
): Plant[] {
  const query = search.trim().toLowerCase();

  return items.filter((plant) => {
    const matchesCategory = category === "all" || plant.category === category;

    if (!matchesCategory) return false;
    if (!query) return true;

    const haystack = [plant.name, plant.description, ...plant.tags]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

/**
 * Deterministic related plants:
 * same category > shared tags > similar price, then stable by id.
 */
export function selectRelatedPlants(
  items: Plant[],
  currentPlantId: string,
  limit = 4,
): Plant[] {
  const current = items.find((plant) => plant.id === currentPlantId);
  if (!current) return [];

  const currentTags = new Set(current.tags);

  return items
    .filter((plant) => plant.id !== currentPlantId)
    .map((plant) => {
      let score = 0;

      if (plant.category === current.category) {
        score += 100;
      }

      for (const tag of plant.tags) {
        if (currentTags.has(tag)) {
          score += 20;
        }
      }

      const priceDelta = Math.abs(plant.price - current.price);
      score += Math.max(0, 30 - priceDelta);

      return { plant, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.plant.id.localeCompare(b.plant.id);
    })
    .slice(0, limit)
    .map(({ plant }) => plant);
}
