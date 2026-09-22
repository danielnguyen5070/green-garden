/**
 * Care / suitability attributes shared by admin and storefront plant APIs.
 * Values match the FastAPI / PostgreSQL enums in green-garden-api.
 */

export const PLANT_TYPES = [
  "foliage",
  "flowering",
  "succulent",
  "cactus",
  "herb",
  "fern",
  "vine",
  "tree",
  "palm",
  "bamboo",
  "aquatic",
  "other",
] as const;

export const PLANT_DIFFICULTIES = ["easy", "moderate", "hard"] as const;

export const PLANT_GROWTH_RATES = ["slow", "moderate", "fast"] as const;

export const PLANT_SUNLIGHTS = [
  "full_sun",
  "partial_sun",
  "partial_shade",
  "shade",
  "low_light",
] as const;

export const PLANT_WATERINGS = ["low", "moderate", "high"] as const;

export const PLANT_SPACE_REQUIREMENTS = ["small", "medium", "large"] as const;

export type PlantType = (typeof PLANT_TYPES)[number];
export type PlantDifficulty = (typeof PLANT_DIFFICULTIES)[number];
export type PlantGrowthRate = (typeof PLANT_GROWTH_RATES)[number];
export type PlantSunlight = (typeof PLANT_SUNLIGHTS)[number];
export type PlantWatering = (typeof PLANT_WATERINGS)[number];
export type PlantSpaceRequirement = (typeof PLANT_SPACE_REQUIREMENTS)[number];

/** Nullable care fields present on admin detail and storefront detail responses. */
export type PlantCareAttributes = {
  plant_type: PlantType | null;
  difficulty: PlantDifficulty | null;
  growth_rate: PlantGrowthRate | null;
  sunlight: PlantSunlight | null;
  watering: PlantWatering | null;
  space_requirement: PlantSpaceRequirement | null;
  indoor_suitable: boolean | null;
  outdoor_suitable: boolean | null;
  pet_safe: boolean | null;
  beginner_friendly: boolean | null;
};

export type PlantCareAttributesInput = {
  plant_type?: PlantType | null;
  difficulty?: PlantDifficulty | null;
  growth_rate?: PlantGrowthRate | null;
  sunlight?: PlantSunlight | null;
  watering?: PlantWatering | null;
  space_requirement?: PlantSpaceRequirement | null;
  indoor_suitable?: boolean | null;
  outdoor_suitable?: boolean | null;
  pet_safe?: boolean | null;
  beginner_friendly?: boolean | null;
};

const PLANT_TYPE_SET = new Set<string>(PLANT_TYPES);
const PLANT_DIFFICULTY_SET = new Set<string>(PLANT_DIFFICULTIES);
const PLANT_GROWTH_RATE_SET = new Set<string>(PLANT_GROWTH_RATES);
const PLANT_SUNLIGHT_SET = new Set<string>(PLANT_SUNLIGHTS);
const PLANT_WATERING_SET = new Set<string>(PLANT_WATERINGS);
const PLANT_SPACE_REQUIREMENT_SET = new Set<string>(PLANT_SPACE_REQUIREMENTS);

export function isPlantType(value: string): value is PlantType {
  return PLANT_TYPE_SET.has(value);
}

export function isPlantDifficulty(value: string): value is PlantDifficulty {
  return PLANT_DIFFICULTY_SET.has(value);
}

export function isPlantGrowthRate(value: string): value is PlantGrowthRate {
  return PLANT_GROWTH_RATE_SET.has(value);
}

export function isPlantSunlight(value: string): value is PlantSunlight {
  return PLANT_SUNLIGHT_SET.has(value);
}

export function isPlantWatering(value: string): value is PlantWatering {
  return PLANT_WATERING_SET.has(value);
}

export function isPlantSpaceRequirement(
  value: string
): value is PlantSpaceRequirement {
  return PLANT_SPACE_REQUIREMENT_SET.has(value);
}
