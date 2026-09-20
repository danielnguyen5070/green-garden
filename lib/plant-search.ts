import { normalizeSearch } from "@/lib/normalize-search";
import type { StorefrontPlantListItem } from "@/types/storefront";

/** Fields the homepage catalog search matches against. */
function plantSearchHaystack(plant: StorefrontPlantListItem): string {
  return [
    plant.name,
    plant.name_vi,
    plant.description,
    plant.description_vi,
    plant.slug,
    plant.category?.name,
    plant.category?.name_vi,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");
}

/**
 * Accent-insensitive partial match for storefront plant cards.
 * Both the query and plant fields are normalized before comparing.
 */
export function plantMatchesSearch(
  plant: StorefrontPlantListItem,
  query: string
): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;

  return normalizeSearch(plantSearchHaystack(plant)).includes(normalizedQuery);
}
