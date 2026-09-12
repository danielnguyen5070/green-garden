import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    gap: {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: {
    direction: "vertical",
    gap: "md",
    align: "stretch",
    justify: "start",
  },
});

function Stack({
  className,
  direction,
  gap,
  align,
  justify,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof stackVariants>) {
  return (
    <div
      data-slot="stack"
      className={cn(
        stackVariants({ direction, gap, align, justify }),
        className
      )}
      {...props}
    />
  );
}

export { Stack, stackVariants };
