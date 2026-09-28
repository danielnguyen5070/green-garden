import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

/**
 * Chrome shared by plant listing loading, error and loaded states so the
 * heading never shifts as data arrives.
 */
function PlantListFrame({
  title,
  description,
  children,
  className,
  id = "products",
  headingId = "plant-list-heading",
  headingAs = "h2",
}: {
  title: string;
  description?: string | null;
  children: ReactNode;
  className?: string;
  id?: string;
  headingId?: string;
  headingAs?: "h1" | "h2";
}) {
  const Heading = headingAs;

  return (
    <section
      id={id}
      data-slot="plant-list"
      aria-labelledby={headingId}
      className={cn("bg-background py-8", className)}
    >
      <Container>
        <header className="max-w-2xl">
          <Heading
            id={headingId}
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {title}
          </Heading>
          {description ? (
            <p className="mt-3 font-sans text-body text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>

        {children}
      </Container>
    </section>
  );
}

export { PlantListFrame };
