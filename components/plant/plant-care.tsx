"use client";

import { useTranslations } from "next-intl";
import { DropletsIcon, LeafIcon, PawPrintIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlantCare as PlantCareData } from "@/types/plant";

function PlantCare({
  care,
  className,
}: {
  care: PlantCareData;
  className?: string;
}) {
  const t = useTranslations("plantDetail");

  const items = [
    {
      key: "light" as const,
      label: t("light"),
      description: care.light,
      icon: SunIcon,
      iconClassName: "bg-accent/15 text-accent",
    },
    {
      key: "water" as const,
      label: t("water"),
      description: care.water,
      icon: DropletsIcon,
      iconClassName: "bg-secondary text-primary",
    },
    {
      key: "pets" as const,
      label: t("pets"),
      description: care.pets,
      icon: PawPrintIcon,
      iconClassName: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <section
      data-slot="plant-care"
      aria-labelledby="plant-care-heading"
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <LeafIcon className="size-4 text-primary stroke-[1.5]" aria-hidden="true" />
        <h2
          id="plant-care-heading"
          className="font-sans text-sm font-semibold tracking-tight text-foreground"
        >
          {t("plantCare")}
        </h2>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.key} className="min-w-0">
              <div
                className={cn(
                  "mb-3 flex size-9 items-center justify-center rounded-full",
                  item.iconClassName,
                )}
              >
                <Icon className="size-4 stroke-[1.5]" aria-hidden="true" />
              </div>
              <p className="font-sans text-sm font-semibold text-foreground">
                {item.label}
              </p>
              <p className="mt-1.5 font-sans text-small leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { PlantCare };
