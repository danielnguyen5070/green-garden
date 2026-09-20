import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function ReviewStars({
  rating,
  size = "md",
  label,
  className,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  /** Accessible name when stars are decorative beside visible text. */
  label?: string;
  className?: string;
}) {
  const safeRating = Math.min(5, Math.max(0, Math.round(rating)));
  const iconClass =
    size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < safeRating;
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(
              iconClass,
              filled
                ? "fill-warning text-warning"
                : "fill-transparent text-muted-foreground/35"
            )}
          />
        );
      })}
    </div>
  );
}

export { ReviewStars };
