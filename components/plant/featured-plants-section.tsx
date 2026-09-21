import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { PlantCard } from "@/components/plant/plant-card";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { getStorefrontPlants } from "@/lib/api/storefront";
import type { StorefrontPlantListItem } from "@/types/storefront";
import { cn } from "@/lib/utils";

/** Compact homepage strip — not the full catalog. */
export const FEATURED_PLANTS_LIMIT = 4;

const SKELETON_CARDS = Array.from(
  { length: FEATURED_PLANTS_LIMIT },
  (_, index) => index
);

async function FeaturedPlantsSkeleton() {
  const t = await getTranslations("plants.featured");

  return (
    <section
      id="featured-plants"
      data-slot="featured-plants"
      aria-labelledby="featured-plants-heading"
      className="bg-background py-8 md:py-10"
    >
      <Container>
        <header className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="featured-plants-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {t("title")}
          </h2>
          <Skeleton className="h-5 w-28 rounded-md" />
        </header>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {SKELETON_CARDS.map((index) => (
            <div key={index} className="flex flex-col">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="mt-4 h-5 w-3/4 rounded-md" />
              <Skeleton className="mt-2 h-4 w-full rounded-md" />
              <Skeleton className="mt-4 h-5 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function loadFeaturedPlants(): Promise<StorefrontPlantListItem[] | null> {
  try {
    const featured = await getStorefrontPlants({
      page: 1,
      page_size: FEATURED_PLANTS_LIMIT,
      is_featured: true,
      sort: "created_at",
      order: "desc",
    });

    if (featured.items.length > 0) {
      return featured.items.slice(0, FEATURED_PLANTS_LIMIT);
    }

    // Keep the homepage populated when nothing is marked featured yet.
    const fallback = await getStorefrontPlants({
      page: 1,
      page_size: FEATURED_PLANTS_LIMIT,
      sort: "created_at",
      order: "desc",
    });
    return fallback.items.slice(0, FEATURED_PLANTS_LIMIT);
  } catch {
    return null;
  }
}

/**
 * Smaller homepage catalog teaser that links visitors to `/plants`.
 */
async function FeaturedPlantsSection({ className }: { className?: string }) {
  const t = await getTranslations("plants.featured");
  const plants = await loadFeaturedPlants();

  if (plants === null) {
    return (
      <section
        id="featured-plants"
        data-slot="featured-plants"
        aria-labelledby="featured-plants-heading"
        className={cn("bg-background py-8 md:py-10", className)}
      >
        <Container>
          <h2
            id="featured-plants-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {t("title")}
          </h2>
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-10 shadow-subtle">
            <p className="font-sans text-body text-foreground">
              {t("loadError")}
            </p>
          </div>
        </Container>
      </section>
    );
  }

  if (plants.length === 0) {
    return null;
  }

  return (
    <section
      id="featured-plants"
      data-slot="featured-plants"
      aria-labelledby="featured-plants-heading"
      className={cn("bg-background py-8 md:py-10", className)}
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="featured-plants-heading"
            className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2"
          >
            {t("title")}
          </h2>
          <Link
            href="/plants"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-primary outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("viewAll")}
            <ArrowRightIcon className="size-4 stroke-[1.5]" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { FeaturedPlantsSection, FeaturedPlantsSkeleton };
