import * as React from "react";
import { cn } from "@/lib/utils";

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)] px-[var(--page-padding)]",
        className
      )}
      {...props}
    />
  );
}

export { Container };
