import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gridVariants = cva("grid w-full", {
  variants: {
    cols: {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
    gap: {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    },
  },
  defaultVariants: {
    cols: 3,
    gap: "md",
  },
});

function Grid({
  className,
  cols,
  gap,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof gridVariants>) {
  return (
    <div
      data-slot="grid"
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  );
}

export { Grid, gridVariants };
