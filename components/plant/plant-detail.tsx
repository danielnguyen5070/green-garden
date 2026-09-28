"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { PlantGallery } from "@/components/plant/plant-gallery";
import { PlantInfo } from "@/components/plant/plant-info";
import { PlantCareSpecs } from "@/components/plant/plant-care-specs";
import {
  PlantOptions,
  type PotSizeOption,
} from "@/components/plant/plant-options";
import {
  formatStorefrontPrice,
  getActivePotSizes,
  getLocalizedPlant,
  getPotSizeAdjustment,
  getPotSizeUnitPrice,
  isPlantInStock,
  localizeOptionalTextEither,
  localizeText,
  sortPlantImages,
} from "@/lib/storefront";
import { getCatalogHref } from "@/lib/storefront/catalog";
import { useCartStore } from "@/store/cart.store";
import type { StorefrontPlantDetail } from "@/types/storefront";
import { cn } from "@/lib/utils";

/** Signed label such as `+50.000 ₫`; zero adjustments are not worth the noise. */
function formatAdjustment(amount: number, locale: string): string | null {
  if (amount === 0) return null;
  const sign = amount > 0 ? "+" : "−";
  return `${sign}${formatStorefrontPrice(Math.abs(amount), locale)}`;
}

function PlantDetail({ plant }: { plant: StorefrontPlantDetail }) {
  const t = useTranslations("plantDetail");
  const tPlants = useTranslations("plants");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);

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

  const images = useMemo(() => sortPlantImages(plant.images), [plant.images]);

  const potSizes = useMemo(
    () => getActivePotSizes(plant.pot_sizes),
    [plant.pot_sizes]
  );

  const [selectedSizeId, setSelectedSizeId] = useState(potSizes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [favorited, setFavorited] = useState(false);

  const selectedSize =
    potSizes.find((size) => size.id === selectedSizeId) ?? potSizes[0] ?? null;

  const sizeOptions: PotSizeOption[] = potSizes.map((size) => ({
    id: size.id,
    label: size.name,
    adjustmentLabel: formatAdjustment(getPotSizeAdjustment(size), locale),
  }));

  // Both the base price and the adjustment come from the backend; the only
  // arithmetic here is adding the two amounts it already decided on. The cart
  // stores only the selection and is re-priced by the backend quote.
  const unitPrice =
    basePrice === null ? null : getPotSizeUnitPrice(basePrice, selectedSize);
  const lineTotal = unitPrice === null ? null : unitPrice * quantity;
  const inStock = isPlantInStock(plant);
  const canAddToCart = inStock && unitPrice !== null;

  function handleAddToCart() {
    addItem({
      plantId: plant.id,
      potSizeId: selectedSize?.id,
      quantity,
    });
  }

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
            <PlantInfo
              name={name}
              priceLabel={
                unitPrice === null
                  ? tCommon("contactForPrice")
                  : formatStorefrontPrice(unitPrice, locale)
              }
              description={description}
            />

            {sizeOptions.length > 0 ? (
              <>
                <div className="my-7 border-t border-border" />
                <PlantOptions
                  potSizes={sizeOptions}
                  selectedSizeId={selectedSize?.id ?? ""}
                  onSizeChange={setSelectedSizeId}
                />
              </>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="inline-flex h-12 w-full items-center justify-between rounded-xl bg-muted px-1.5 sm:w-[7.5rem]"
                role="group"
                aria-label={t("quantity")}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  aria-label={t("decreaseQuantity")}
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <MinusIcon className="size-4 stroke-[1.75]" />
                </Button>
                <span
                  className="min-w-6 text-center font-sans text-sm font-semibold tabular-nums"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  aria-label={t("increaseQuantity")}
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  <PlusIcon className="size-4 stroke-[1.75]" />
                </Button>
              </div>

              <Button
                type="button"
                size="lg"
                className="h-12 w-full rounded-xl px-5 font-sans text-sm font-semibold sm:flex-1"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                <ShoppingBagIcon
                  className="size-4 stroke-[1.5]"
                  data-icon="inline-start"
                />
                {!inStock
                  ? t("outOfStock")
                  : lineTotal === null
                    ? tCommon("contactForPrice")
                    : t("addToCart", {
                        price: formatStorefrontPrice(lineTotal, locale),
                      })}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className={cn(
                  "size-12 shrink-0 rounded-xl border-border",
                  favorited && "border-primary/40 text-primary"
                )}
                aria-label={favorited ? t("unfavorite") : t("favorite")}
                aria-pressed={favorited}
                onClick={() => setFavorited((value) => !value)}
              >
                <HeartIcon
                  className={cn(
                    "size-4 stroke-[1.5]",
                    favorited && "fill-primary text-primary"
                  )}
                />
              </Button>
            </div>

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
      </Container>
    </section>
  );
}

export { PlantDetail };
