import type {
  Plant,
  PlantCare,
  PlantPotColor,
  PlantPotSize,
} from "@/types/plant";

export const DEFAULT_POT_SIZES: PlantPotSize[] = [
  { id: "small", label: 'Small (8")' },
  { id: "medium", label: 'Medium (10")' },
  { id: "large", label: 'Large (12")' },
];

export const DEFAULT_POT_COLORS: PlantPotColor[] = [
  { id: "terracotta", label: "Terracotta", hex: "#C47A4A" },
  { id: "stone", label: "Stone", hex: "#D9D4CB" },
  { id: "navy", label: "Navy", hex: "#243447" },
];

const CARE_BY_CATEGORY: Record<string, PlantCare> = {
  Indoor: {
    light: "Prefers bright, indirect light near a window.",
    water: "Water when the top inch of soil feels dry.",
    pets: "Check plant toxicity before placing near pets.",
  },
  Outdoor: {
    light: "Thrives in bright light to partial direct sun.",
    water: "Water regularly in warm weather; less in cooler months.",
    pets: "Keep outdoor plants monitored around curious pets.",
  },
  "Low Light": {
    light: "Tolerates low to medium indirect light.",
    water: "Water sparingly and let soil dry between waterings.",
    pets: "Verify safety if you share your space with pets.",
  },
  "Pet Friendly": {
    light: "Enjoys bright, indirect light for steady growth.",
    water: "Keep soil lightly moist without waterlogging.",
    pets: "Generally considered a safer choice around pets.",
  },
  "Easy Care": {
    light: "Adapts to a wide range of indoor light conditions.",
    water: "Water every 1–2 weeks, allowing soil to dry out.",
    pets: "Confirm care needs and toxicity for your household.",
  },
};

const FALLBACK_CARE: PlantCare = {
  light: "Thrives in bright, indirect to direct sunlight.",
  water: "Water every 1–2 weeks, allowing soil to dry out.",
  pets: "Toxic to pets if ingested. Keep away.",
};

export function enrichPlant(plant: Plant): Plant {
  const images =
    plant.images && plant.images.length > 0
      ? plant.images
      : [
          { src: plant.image, alt: plant.name, type: "image" as const },
          { src: plant.image, alt: `${plant.name} detail`, type: "image" as const },
          {
            src: plant.image,
            alt: `${plant.name} in a living space`,
            type: "image" as const,
          },
          {
            src: plant.image,
            alt: `${plant.name} care video`,
            type: "video" as const,
          },
        ];

  return {
    ...plant,
    tags: [...plant.tags],
    scientificName: plant.scientificName ?? plant.name,
    longDescription:
      plant.longDescription ??
      `${plant.description}. A thoughtfully grown Green Garden plant ready to settle into your space.`,
    rating: plant.rating ?? Math.min(5, 4.2 + (plant.soldCount % 8) * 0.1),
    reviewCount:
      plant.reviewCount ?? Math.max(12, Math.round(plant.soldCount * 0.75)),
    images,
    potSizes: plant.potSizes ?? DEFAULT_POT_SIZES,
    potColors: plant.potColors ?? DEFAULT_POT_COLORS,
    care: plant.care ?? CARE_BY_CATEGORY[plant.category] ?? FALLBACK_CARE,
  };
}
