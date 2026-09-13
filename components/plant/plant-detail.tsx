"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRightIcon, HeartIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PlantCare } from "@/components/plant/plant-care";
import { PlantGallery } from "@/components/plant/plant-gallery";
import { PlantInfo } from "@/components/plant/plant-info";
import { PlantOptions } from "@/components/plant/plant-options";
import { Link } from "@/i18n/navigation";
import { formatCartMoney } from "@/lib/cart";
import { DEFAULT_POT_COLORS, DEFAULT_POT_SIZES } from "@/lib/plant-detail";
import { useCartStore } from "@/store/cart.store";
import type { Plant } from "@/types/plant";
import { cn } from "@/lib/utils";

function PlantDetail({ plant }: { plant: Plant }) {
  const t = useTranslations("plantDetail");
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);

  const potSizes = plant.potSizes ?? DEFAULT_POT_SIZES;
  const potColors = plant.potColors ?? DEFAULT_POT_COLORS;

  const [selectedSizeId, setSelectedSizeId] = useState(
    potSizes[1]?.id ?? potSizes[0]?.id ?? "medium",
  );
  const [selectedColorId, setSelectedColorId] = useState(
    potColors[1]?.id ?? potColors[0]?.id ?? "stone",
  );
  const [quantity, setQuantity] = useState(1);
  const [favorited, setFavorited] = useState(false);

  const selectedSize = useMemo(
    () => potSizes.find((size) => size.id === selectedSizeId) ?? potSizes[0],
    [potSizes, selectedSizeId],
  );
  const selectedColor = useMemo(
    () =>
      potColors.find((color) => color.id === selectedColorId) ?? potColors[0],
    [potColors, selectedColorId],
  );

  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";
  const lineTotal = plant.price * quantity;

  function handleAddToCart() {
    addItem({
      id: plant.id,
      name: plant.name,
      slug: plant.slug,
      image: plant.image,
      price: plant.price,
      description: plant.description,
      quantity,
      potSizeId: selectedSize?.id,
      potSizeLabel: selectedSize?.label,
      potColorId: selectedColor?.id,
      potColorLabel: selectedColor?.label,
    });
  }

  return (
    <section
      data-slot="plant-detail"
      className="bg-background py-8 md:py-10 lg:py-12"
    >
      <Container>
        <nav aria-label={t("breadcrumb")} className="mb-8 md:mb-10">
          <ol className="flex flex-wrap items-center gap-1.5 font-sans text-small">
            <li>
              <Link
                href="/"
                className="text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("home")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRightIcon className="size-3.5" />
            </li>
            <li>
              <span className="text-muted-foreground">{plant.category}</span>
            </li>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRightIcon className="size-3.5" />
            </li>
            <li>
              <span className="font-medium text-foreground" aria-current="page">
                {plant.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <PlantGallery plant={plant} />

          <div className="flex min-w-0 flex-col">
            <PlantInfo plant={plant} />

            <div className="my-7 border-t border-border" />

            <PlantOptions
              potSizes={potSizes}
              potColors={potColors}
              selectedSizeId={selectedSizeId}
              selectedColorId={selectedColorId}
              onSizeChange={setSelectedSizeId}
              onColorChange={setSelectedColorId}
            />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="inline-flex h-11 items-center justify-between rounded-xl bg-muted px-1.5 sm:w-[7.5rem]"
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
                className="h-11 flex-1 rounded-xl font-sans text-sm font-semibold"
                onClick={handleAddToCart}
              >
                <ShoppingBagIcon className="size-4 stroke-[1.5]" data-icon="inline-start" />
                {t("addToCart", {
                  price: formatCartMoney(lineTotal, moneyLocale),
                })}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className={cn(
                  "size-11 shrink-0 rounded-xl border-border",
                  favorited && "border-primary/40 text-primary",
                )}
                aria-label={favorited ? t("unfavorite") : t("favorite")}
                aria-pressed={favorited}
                onClick={() => setFavorited((value) => !value)}
              >
                <HeartIcon
                  className={cn(
                    "size-4 stroke-[1.5]",
                    favorited && "fill-primary text-primary",
                  )}
                />
              </Button>
            </div>

            {plant.care ? (
              <PlantCare care={plant.care} className="mt-10" />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

export { PlantDetail };
