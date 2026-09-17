import { cn } from "@/lib/utils";

function PlantInfo({
  name,
  priceLabel,
  description,
  className,
}: {
  name: string;
  priceLabel: string;
  description: string | null;
  className?: string;
}) {
  return (
    <div data-slot="plant-info" className={cn(className)}>
      <h1 className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2">
        {name}
      </h1>

      <p className="mt-5 font-sans text-xl font-semibold tracking-tight text-foreground">
        {priceLabel}
      </p>

      {description ? (
        <p className="mt-4 max-w-xl font-sans text-body leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { PlantInfo };
