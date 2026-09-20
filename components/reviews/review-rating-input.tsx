"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function ReviewRatingInput({
  value,
  onChange,
  disabled,
  error,
  id,
  "aria-labelledby": ariaLabelledBy,
}: {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const t = useTranslations("reviews.form");

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabelledBy ? undefined : t("rating")}
      aria-labelledby={ariaLabelledBy}
      aria-invalid={error || undefined}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const checked = value === rating;
        const filled = value != null && rating <= value;

        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={t("ratingValue", { rating })}
            disabled={disabled}
            className={cn(
              "rounded-md p-1 text-muted-foreground/40 outline-none transition-colors",
              "hover:text-warning focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              filled && "text-warning",
              disabled && "pointer-events-none opacity-50"
            )}
            onClick={() => onChange(rating)}
          >
            <Star
              aria-hidden="true"
              className={cn(
                "size-7",
                filled ? "fill-warning text-warning" : "fill-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export { ReviewRatingInput };
