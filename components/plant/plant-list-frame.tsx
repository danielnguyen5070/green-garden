import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

/**
 * Chrome shared by the Homepage product section's loading, error and loaded
 * states so the heading never shifts as data arrives.
 */
function PlantListFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id="products"
      data-slot="plant-list"
      aria-labelledby="plant-list-heading"
      className={cn("bg-background py-8", className)}
    >
      <Container>
        <header className="max-w-2xl">
          <h2
            id="plant-list-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {title}
          </h2>
        </header>

        {children}
      </Container>
    </section>
  );
}

export { PlantListFrame };
