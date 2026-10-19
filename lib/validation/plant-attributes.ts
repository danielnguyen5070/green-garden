import { z } from "zod";
import {
  PLANT_DIFFICULTIES,
  PLANT_GROWTH_RATES,
  PLANT_SPACE_REQUIREMENTS,
  PLANT_SUNLIGHTS,
  PLANT_TYPES,
  PLANT_WATERINGS,
  type PlantDifficulty,
  type PlantGrowthRate,
  type PlantSpaceRequirement,
  type PlantSunlight,
  type PlantType,
  type PlantWatering,
} from "@/types/plant-attributes";

export const plantTypeSchema = z.enum(PLANT_TYPES);
export const plantDifficultySchema = z.enum(PLANT_DIFFICULTIES);
export const plantGrowthRateSchema = z.enum(PLANT_GROWTH_RATES);
export const plantSunlightSchema = z.enum(PLANT_SUNLIGHTS);
export const plantWateringSchema = z.enum(PLANT_WATERINGS);
export const plantSpaceRequirementSchema = z.enum(PLANT_SPACE_REQUIREMENTS);

export function isPlantType(value: string): value is PlantType {
  return plantTypeSchema.safeParse(value).success;
}

export function isPlantDifficulty(value: string): value is PlantDifficulty {
  return plantDifficultySchema.safeParse(value).success;
}

export function isPlantGrowthRate(value: string): value is PlantGrowthRate {
  return plantGrowthRateSchema.safeParse(value).success;
}

export function isPlantSunlight(value: string): value is PlantSunlight {
  return plantSunlightSchema.safeParse(value).success;
}

export function isPlantWatering(value: string): value is PlantWatering {
  return plantWateringSchema.safeParse(value).success;
}

export function isPlantSpaceRequirement(
  value: string
): value is PlantSpaceRequirement {
  return plantSpaceRequirementSchema.safeParse(value).success;
}
