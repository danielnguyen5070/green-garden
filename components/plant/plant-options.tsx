"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlantPotColor, PlantPotSize } from "@/types/plant";

function PlantOptions({
  potSizes,
  potColors,
  selectedSizeId,
  selectedColorId,
  onSizeChange,
  onColorChange,
  className,
}: {
  potSizes: PlantPotSize[];
  potColors: PlantPotColor[];
  selectedSizeId: string;
  selectedColorId: string;
  onSizeChange: (id: string) => void;
  onColorChange: (id: string) => void;
  className?: string;
}) {
  const t = useTranslations("plantDetail");

  return (
    <div data-slot="plant-options" className={cn("space-y-6", className)}>
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-sans text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {t("potSize")}
          </p>
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 font-sans text-sm font-medium text-primary"
          >
            {t("sizeGuide")}
          </Button>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("potSize")}
        >
          {potSizes.map((size) => {
            const selected = size.id === selectedSizeId;
            return (
              <Button
                key={size.id}
                type="button"
                variant="outline"
                aria-pressed={selected}
                onClick={() => onSizeChange(size.id)}
                className={cn(
                  "h-10 rounded-xl border px-3.5 font-sans text-sm",
                  selected
                    ? "border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {size.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 font-sans text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {t("potColor")}
        </p>
        <div
          className="flex flex-wrap items-center gap-3"
          role="group"
          aria-label={t("potColor")}
        >
          {potColors.map((color) => {
            const selected = color.id === selectedColorId;
            return (
              <button
                key={color.id}
                type="button"
                aria-label={color.label}
                aria-pressed={selected}
                onClick={() => onColorChange(color.id)}
                className={cn(
                  "size-9 rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "ring-1 ring-border/80",
                )}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { PlantOptions };
