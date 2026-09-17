"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PotSizeOption = {
  id: string;
  label: string;
  /** Formatted price adjustment, omitted when the backend sends zero. */
  adjustmentLabel: string | null;
};

function PlantOptions({
  potSizes,
  selectedSizeId,
  onSizeChange,
  className,
}: {
  potSizes: PotSizeOption[];
  selectedSizeId: string;
  onSizeChange: (id: string) => void;
  className?: string;
}) {
  const t = useTranslations("plantDetail");

  if (potSizes.length === 0) {
    return null;
  }

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
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                {size.label}
                {size.adjustmentLabel ? (
                  <span className="text-muted-foreground">
                    {size.adjustmentLabel}
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { PlantOptions };
