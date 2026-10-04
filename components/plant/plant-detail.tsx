import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { PlantGallery } from "@/components/plant/plant-gallery";
import { PlantCareSpecs } from "@/components/plant/plant-care-specs";
import { PlantPageViews } from "@/components/plant/plant-page-views";
import { PlantPurchase } from "@/components/plant/plant-purchase";
import { PlantReviews } from "@/components/plant/plant-reviews";
import { ReviewStars } from "@/components/reviews/review-stars";
import type { PlantReviewsData } from "@/lib/reviews";
import {
  getActivePotSizes,
  getLocalizedPlant,
  isPlantInStock,
  localizeOptionalTextEither,
  localizeText,
  sortPlantImages,
} from "@/lib/storefront";
import { getCatalogHref } from "@/lib/storefront/catalog";
import type { StorefrontPlantDetail } from "@/types/storefront";

async function PlantDetail({
  plant,
  reviews,
}: {
  plant: StorefrontPlantDetail;
  /** `null` when reviews could not be loaded; the reviews UI is hidden. */
  reviews: PlantReviewsData | null;
}) {
  const [t, tPlants, locale] = await Promise.all([
    getTranslations("plantDetail"),
    getTranslations("plants"),
    getLocale(),
  ]);

  const {
    name,
    description,
    price: basePrice,
  } = getLocalizedPlant(plant, locale);
  const longDescription = localizeOptionalTextEither(
    plant.long_description,
    plant.long_description_vi,
    locale
  );
  const categoryName = plant.category
    ? localizeText(plant.category.name, plant.category.name_vi, locale)
    : null;

  const ratingSummary =
    reviews && reviews.summary.total_reviews > 0 ? reviews.summary : null;

  const images = sortPlantImages(plant.images);
  const potSizes = getActivePotSizes(plant.pot_sizes).map((size) => ({
    id: size.id,
    name: size.name,
    price_adjustment_vi: size.price_adjustment_vi,
  }));

  return (
    <section
      data-slot="plant-detail"
      className="bg-background py-8 md:py-10 lg:py-12"
    >
      <Container>
        <Breadcrumbs
          label={t("breadcrumb")}
          items={[
            { label: t("home"), href: "/" },
            { label: tPlants("title"), href: "/plants" },
            ...(plant.category && categoryName
              ? [
                  {
                    label: categoryName,
                    href: getCatalogHref(plant.category.slug, 1),
                  },
                ]
              : []),
            { label: name },
          ]}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <PlantGallery
            images={images}
            name={name}
            featured={plant.is_featured}
          />

          <div className="flex min-w-0 flex-col">
            <h1 className="font-heading text-h3 font-bold tracking-tight text-foreground md:text-h2">
              {name}
            </h1>

            {ratingSummary ? (
              <a
                href="#reviews"
                data-slot="plant-rating"
                className="mt-2 inline-flex w-fit items-center gap-2 rounded font-sans text-small text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={t("reviews.ratingLinkLabel", {
                  rating: ratingSummary.average_rating.toFixed(1),
                  count: ratingSummary.total_reviews,
                })}
              >
                <ReviewStars rating={ratingSummary.average_rating} size="sm" />
                <span className="font-medium text-foreground tabular-nums">
                  {ratingSummary.average_rating.toFixed(1)}
                </span>
                <span>
                  {t("reviews.count", { count: ratingSummary.total_reviews })}
                </span>
              </a>
            ) : null}

            <Suspense fallback={null}>
              <PlantPageViews
                locale={locale}
                slug={plant.slug}
                className="mt-2"
              />
            </Suspense>

            <PlantPurchase
              plantId={plant.id}
              basePrice={basePrice}
              potSizes={potSizes}
              inStock={isPlantInStock(plant)}
            >
              {description ? (
                <p className="mt-4 max-w-xl font-sans text-body leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </PlantPurchase>

            <PlantCareSpecs plant={plant} className="mt-8" />
          </div>
        </div>

        {longDescription ? (
          <div className="mt-12 border-t border-border pt-10 md:mt-14 md:pt-12 lg:mt-16">
            <div className="whitespace-pre-wrap font-sans text-body leading-relaxed text-muted-foreground">
              {longDescription}
            </div>
          </div>
        ) : null}

        {reviews ? (
          <PlantReviews
            plantSlug={plant.slug}
            plantName={name}
            initialReviews={reviews.reviews}
            initialTotal={reviews.total}
            summary={reviews.summary}
            className="mt-12 border-t border-border pt-10 md:mt-14 md:pt-12 lg:mt-16"
          />
        ) : null}
      </Container>
    </section>
  );
}

export { PlantDetail };
