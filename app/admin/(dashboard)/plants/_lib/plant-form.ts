"use client";

import { z } from "zod";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import type { AdminPlant } from "@/types/admin-plant";
import type {
  PlantDifficulty,
  PlantGrowthRate,
  PlantSpaceRequirement,
  PlantSunlight,
  PlantType,
  PlantWatering,
} from "@/types/plant-attributes";
import { firstIssueMessage } from "@/lib/validation/first-issue";
import { isValidHttpUrl } from "@/lib/validation/primitives";
import {
  plantDifficultySchema,
  plantGrowthRateSchema,
  plantSpaceRequirementSchema,
  plantSunlightSchema,
  plantTypeSchema,
  plantWateringSchema,
} from "@/lib/validation/plant-attributes";
import { UNSET_VALUE } from "./plants-constants";

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

export { isValidHttpUrl };

function isNonNegativeAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
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

function nullableCareEnum<T extends z.ZodType>(
  schema: T,
  invalidMessage: string
) {
  return z.union([schema, z.null()], {
    error: invalidMessage,
  });
}

function buildPlantFormSchema(willBeActive: boolean) {
  return z
    .object({
      category_id: z.string().min(1, { error: copy.invalidCategory }),
      name: z
        .string()
        .min(1, { error: copy.invalidName })
        .max(255, { error: copy.invalidName }),
      name_vi: z.string().max(255, { error: copy.invalidNameVi }),
      description_vi: z.string(),
      slug: z
        .string()
        .min(1, { error: copy.invalidSlug })
        .max(255, { error: copy.invalidSlug }),
      sku: z
        .string()
        .min(1, { error: copy.invalidSku })
        .max(100, { error: copy.invalidSku }),
      price: z
        .string()
        .min(1, { error: copy.invalidPrice })
        .refine(isNonNegativeAmount, { error: copy.invalidPrice }),
      price_vi: z.string().refine(
        (value) => value === "" || isNonNegativeAmount(value),
        { error: copy.invalidPriceVi }
      ),
      stock: z.string().refine(
        (value) => {
          if (!value) return false;
          const stock = Number(value);
          return Number.isInteger(stock) && stock >= 0;
        },
        { error: copy.invalidStock }
      ),
      og_image_url: z.string().refine(
        (value) => value === "" || isValidHttpUrl(value),
        { error: copy.invalidOgImageUrl }
      ),
      plant_type: nullableCareEnum(plantTypeSchema, copy.invalidPlantType),
      difficulty: nullableCareEnum(
        plantDifficultySchema,
        copy.invalidDifficulty
      ),
      growth_rate: nullableCareEnum(
        plantGrowthRateSchema,
        copy.invalidGrowthRate
      ),
      sunlight: nullableCareEnum(plantSunlightSchema, copy.invalidSunlight),
      watering: nullableCareEnum(plantWateringSchema, copy.invalidWatering),
      space_requirement: nullableCareEnum(
        plantSpaceRequirementSchema,
        copy.invalidSpaceRequirement
      ),
    })
    .superRefine((data, ctx) => {
      if (willBeActive && !hasVietnameseCopy(data)) {
        ctx.addIssue({
          code: "custom",
          message: copy.vietnameseRequiredForActive,
          path: ["name_vi"],
        });
      }
    });
}

/** Client-side guardrails; the backend stays the source of truth. */
export function validateForm(
  values: PlantFormValues,
  willBeActive: boolean
): string | null {
  const result = buildPlantFormSchema(willBeActive).safeParse(values);
  if (result.success) return null;
  return firstIssueMessage(result.error);
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
