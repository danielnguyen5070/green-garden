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

export {
  isPlantDifficulty,
  isPlantGrowthRate,
  isPlantSpaceRequirement,
  isPlantSunlight,
  isPlantType,
  isPlantWatering,
} from "@/lib/validation/plant-attributes";
