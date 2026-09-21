import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { getStorefrontPlants } from "@/lib/api/storefront";
import {
  formatStorefrontPrice,
  getLocalizedPlant,
  getPlantCardImage,
  localizeText,
} from "@/lib/storefront";
import type {
  StorefrontPlantDetail,
  StorefrontPlantListItem,
} from "@/types/storefront";
import { cn } from "@/lib/utils";

const RELATED_LIMIT = 4;

function RelatedPlantCard({
  plant,
  locale,
}: {
  plant: StorefrontPlantListItem;
  locale: string;
}) {
  const { name, description, price } = getLocalizedPlant(plant, locale);
  const image = getPlantCardImage(plant.images, name);
  const subtitle =
    description ??
    (plant.category
      ? localizeText(plant.category.name, plant.category.name_vi, locale)
      : "");
  const href = `/plants/${plant.slug}`;

  return (
    <article data-slot="related-plant-card" className="group min-w-0">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="mt-4 space-y-1">
        <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
          <Link
            href={href}
            className="outline-none transition-colors hover:text-primary focus-visible:text-primary"
          >
            {name}
          </Link>
        </h3>
        <p className="line-clamp-1 font-sans text-small text-muted-foreground">
          {subtitle}
        </p>
        <p className="pt-0.5 font-sans text-base font-semibold text-foreground">
          {formatStorefrontPrice(price, locale)}
        </p>
      </div>
    </article>
  );
}

/**
 * One extra listing request scoped to the plant's own category, rather than a
 * detail lookup per card.
 */
async function RelatedPlants({
  plant,
  className,
}: {
  plant: StorefrontPlantDetail;
  className?: string;
}) {
  if (!plant.category) {
    return null;
  }

  const [t, locale, response] = await Promise.all([
    getTranslations("plantDetail.related"),
    getLocale(),
    getStorefrontPlants({
      category_id: plant.category.id,
      page_size: RELATED_LIMIT + 1,
    }).catch(() => null),
  ]);

  const plants = (response?.items ?? [])
    .filter((item) => item.id !== plant.id)
    .slice(0, RELATED_LIMIT);

  if (plants.length === 0) {
    return null;
  }

  return (
    <section
      data-slot="related-plants"
      aria-labelledby="related-plants-heading"
      className={cn(
        "bg-background pt-4 pb-12 md:pt-6 md:pb-16 lg:pb-20",
        className
      )}
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="related-plants-heading"
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

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:mt-10 lg:grid-cols-4 lg:gap-x-6">
          {plants.map((item) => (
            <RelatedPlantCard key={item.id} plant={item} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { RelatedPlants };
