"use client";

import { useTranslations } from "next-intl";
import type { StorefrontPlantDetail } from "@/types/storefront";
import { cn } from "@/lib/utils";

type CareRow = {
  key: string;
  label: string;
  value: string;
};

function PlantCareSpecs({
  plant,
  className,
}: {
  plant: StorefrontPlantDetail;
  className?: string;
}) {
  const t = useTranslations("plantDetail.care");

  const rows: CareRow[] = [];

  if (plant.plant_type) {
    rows.push({
      key: "plant_type",
      label: t("plantType"),
      value: t(`plantTypeValues.${plant.plant_type}`),
    });
  }
  if (plant.difficulty) {
    rows.push({
      key: "difficulty",
      label: t("difficulty"),
      value: t(`difficultyValues.${plant.difficulty}`),
    });
  }
  if (plant.growth_rate) {
    rows.push({
      key: "growth_rate",
      label: t("growthRate"),
      value: t(`growthRateValues.${plant.growth_rate}`),
    });
  }
  if (plant.sunlight) {
    rows.push({
      key: "sunlight",
      label: t("sunlight"),
      value: t(`sunlightValues.${plant.sunlight}`),
    });
  }
  if (plant.watering) {
    rows.push({
      key: "watering",
      label: t("watering"),
      value: t(`wateringValues.${plant.watering}`),
    });
  }
  if (plant.space_requirement) {
    rows.push({
      key: "space_requirement",
      label: t("spaceRequirement"),
      value: t(`spaceRequirementValues.${plant.space_requirement}`),
    });
  }

  // Boolean flags: show positive traits when true; warn only when pet_safe is false.
  if (plant.indoor_suitable === true) {
    rows.push({
      key: "indoor_suitable",
      label: t("indoorSuitable"),
      value: t("indoorSuitable"),
    });
  }
  if (plant.outdoor_suitable === true) {
    rows.push({
      key: "outdoor_suitable",
      label: t("outdoorSuitable"),
      value: t("outdoorSuitable"),
    });
  }
  if (plant.pet_safe === true) {
    rows.push({
      key: "pet_safe",
      label: t("petSafe"),
      value: t("petSafe"),
    });
  } else if (plant.pet_safe === false) {
    rows.push({
      key: "pet_safe",
      label: t("petSafe"),
      value: t("notPetSafe"),
    });
  }
  if (plant.beginner_friendly === true) {
    rows.push({
      key: "beginner_friendly",
      label: t("beginnerFriendly"),
      value: t("beginnerFriendly"),
    });
  }

  if (rows.length === 0) return null;

  const enumKeys = new Set([
    "plant_type",
    "difficulty",
    "growth_rate",
    "sunlight",
    "watering",
    "space_requirement",
  ]);
  const specRows = rows.filter((row) => enumKeys.has(row.key));
  const flagRows = rows.filter((row) => !enumKeys.has(row.key));

  return (
    <section
      data-slot="plant-care-specs"
      className={cn(
        "max-w-3xl border-t border-border pt-10 md:pt-12",
        className
      )}
    >
      <h2 className="font-heading text-h5 font-semibold tracking-tight text-foreground">
        {t("title")}
      </h2>

      {specRows.length > 0 ? (
        <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          {specRows.map((row) => (
            <div key={row.key} className="flex flex-col gap-1">
              <dt className="font-sans text-small text-muted-foreground">
                {row.label}
              </dt>
              <dd className="font-sans text-body font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {flagRows.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {flagRows.map((row) => (
            <li
              key={row.key}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 font-sans text-small text-foreground",
                row.key === "pet_safe" &&
                  plant.pet_safe === false &&
                  "border-destructive/30 text-destructive"
              )}
            >
              {row.value}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export { PlantCareSpecs };
