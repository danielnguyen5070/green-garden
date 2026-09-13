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
