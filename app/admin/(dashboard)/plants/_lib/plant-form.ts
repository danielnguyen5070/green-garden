"use client";

import { adminCopy } from "@/app/admin/_lib/admin-copy";
import type { AdminPlant } from "@/types/admin-plant";
import {
  isPlantDifficulty,
  isPlantGrowthRate,
  isPlantSpaceRequirement,
  isPlantSunlight,
  isPlantType,
  isPlantWatering,
  type PlantDifficulty,
  type PlantGrowthRate,
  type PlantSpaceRequirement,
  type PlantSunlight,
  type PlantType,
  type PlantWatering,
} from "@/types/plant-attributes";

/** Select sentinel for optional enum / nullable boolean fields. */
export const UNSET_VALUE = "__unset__";

const copy = adminCopy.plants;

export type PlantFormValues = {
  category_id: string;
  name: string;
  name_vi: string;
  slug: string;
  description: string;
  description_vi: string;
  long_description: string;
  long_description_vi: string;
  sku: string;
  price: string;
  price_vi: string;
  stock: string;
  og_image_url: string;
  is_featured: boolean;
  is_active: boolean;
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

export type CareFormState = {
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

export function careStateFromPlant(plant?: AdminPlant | null): CareFormState {
  return {
    plant_type: plant?.plant_type ?? null,
    difficulty: plant?.difficulty ?? null,
    growth_rate: plant?.growth_rate ?? null,
    sunlight: plant?.sunlight ?? null,
    watering: plant?.watering ?? null,
    space_requirement: plant?.space_requirement ?? null,
    indoor_suitable: plant?.indoor_suitable ?? null,
    outdoor_suitable: plant?.outdoor_suitable ?? null,
    pet_safe: plant?.pet_safe ?? null,
    beginner_friendly: plant?.beginner_friendly ?? null,
  };
}

export function readForm(
  form: HTMLFormElement,
  categoryId: string,
  care: CareFormState
): PlantFormValues {
  const formData = new FormData(form);
  return {
    category_id: categoryId,
    name: String(formData.get("name") ?? "").trim(),
    name_vi: String(formData.get("name_vi") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    description_vi: String(formData.get("description_vi") ?? "").trim(),
    long_description: String(formData.get("long_description") ?? "").trim(),
    long_description_vi: String(
      formData.get("long_description_vi") ?? ""
    ).trim(),
    sku: String(formData.get("sku") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    price_vi: String(formData.get("price_vi") ?? "").trim(),
    stock: String(formData.get("stock") ?? "").trim(),
    og_image_url: String(formData.get("og_image_url") ?? "").trim(),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
    plant_type: care.plant_type,
    difficulty: care.difficulty,
    growth_rate: care.growth_rate,
    sunlight: care.sunlight,
    watering: care.watering,
    space_requirement: care.space_requirement,
    indoor_suitable: care.indoor_suitable,
    outdoor_suitable: care.outdoor_suitable,
    pet_safe: care.pet_safe,
    beginner_friendly: care.beginner_friendly,
  };
}

function isNonNegativeAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * `/vi` is the default storefront; without these it shows English copy under
 * `lang="vi"`, so a plant can't be live until they're filled in.
 */
export function hasVietnameseCopy(plant: {
  name_vi: string | null;
  description_vi: string | null;
}): boolean {
  return Boolean(plant.name_vi?.trim() && plant.description_vi?.trim());
}

/** Client-side guardrails; the backend stays the source of truth. */
export function validateForm(
  values: PlantFormValues,
  willBeActive: boolean
): string | null {
  if (!values.category_id) return copy.invalidCategory;
  if (!values.name || values.name.length > 255) return copy.invalidName;
  if (values.name_vi.length > 255) return copy.invalidNameVi;
  if (willBeActive && !hasVietnameseCopy(values)) {
    return copy.vietnameseRequiredForActive;
  }
  if (!values.slug || values.slug.length > 255) return copy.invalidSlug;
  if (!values.sku || values.sku.length > 100) return copy.invalidSku;

  if (!values.price || !isNonNegativeAmount(values.price)) {
    return copy.invalidPrice;
  }
  if (values.price_vi && !isNonNegativeAmount(values.price_vi)) {
    return copy.invalidPriceVi;
  }

  const stock = Number(values.stock);
  if (!values.stock || !Number.isInteger(stock) || stock < 0) {
    return copy.invalidStock;
  }

  if (values.og_image_url && !isValidHttpUrl(values.og_image_url)) {
    return copy.invalidOgImageUrl;
  }

  if (values.plant_type != null && !isPlantType(values.plant_type)) {
    return copy.invalidPlantType;
  }
  if (values.difficulty != null && !isPlantDifficulty(values.difficulty)) {
    return copy.invalidDifficulty;
  }
  if (values.growth_rate != null && !isPlantGrowthRate(values.growth_rate)) {
    return copy.invalidGrowthRate;
  }
  if (values.sunlight != null && !isPlantSunlight(values.sunlight)) {
    return copy.invalidSunlight;
  }
  if (values.watering != null && !isPlantWatering(values.watering)) {
    return copy.invalidWatering;
  }
  if (
    values.space_requirement != null &&
    !isPlantSpaceRequirement(values.space_requirement)
  ) {
    return copy.invalidSpaceRequirement;
  }

  return null;
}

export function enumSelectValue<T extends string>(value: T | null): string {
  return value ?? UNSET_VALUE;
}

export function parseEnumSelectValue<T extends string>(
  value: string | null | undefined,
  isValid: (candidate: string) => candidate is T
): T | null {
  if (value == null || value === UNSET_VALUE) return null;
  return isValid(value) ? value : null;
}

/** Checkbox: checked → true; unchecking a true value → false; unset stays null. */
export function nextNullableBool(
  checked: boolean,
  previous: boolean | null
): boolean | null {
  if (checked) return true;
  if (previous === true) return false;
  return previous;
}
