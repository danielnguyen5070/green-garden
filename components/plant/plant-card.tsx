"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  formatStorefrontPrice,
  getLocalizedPlant,
  getPlantCardImage,
} from "@/lib/storefront";
import type { StorefrontPlantListItem } from "@/types/storefront";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";

function PlantCard({
  plant,
  className,
}: {
  plant: StorefrontPlantListItem;
  className?: string;
}) {
  const t = useTranslations("home.products");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);

  const { name, description, price } = getLocalizedPlant(plant, locale);
  const image = getPlantCardImage(plant.images, name);
  const inStock = plant.stock > 0;

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      id: plant.id,
      name,
      slug: plant.slug,
      image: image.src,
      price,
      description: description ?? "",
    });
  }

  function handleFavorite(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <article
      data-slot="plant-card"
      className={cn("group flex h-full flex-col", className)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Link
          href={`/plants/${plant.slug}`}
          className="relative block aspect-square w-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </Link>

        {plant.is_featured ? (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-accent px-2 py-1 font-sans text-[0.625rem] font-semibold tracking-[0.08em] text-accent-foreground uppercase">
            {t("featured")}
          </span>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="absolute top-3 right-3 z-10 size-9 rounded-full border-border/80 bg-card text-foreground shadow-subtle hover:bg-card hover:text-foreground"
          aria-label={t("favorite")}
          onClick={handleFavorite}
        >
          <HeartIcon className="size-4 stroke-[1.5]" />
        </Button>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1.5">
        <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
          <Link
            href={`/plants/${plant.slug}`}
            className="outline-none transition-colors hover:text-primary focus-visible:text-primary"
          >
            {name}
          </Link>
        </h3>
        {description ? (
          <p className="line-clamp-2 font-sans text-small text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="font-sans text-base font-semibold text-primary">
            {formatStorefrontPrice(price, locale)}
          </p>
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-lg px-3 font-sans text-xs font-semibold"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            {inStock ? tCommon("addToCart") : t("outOfStock")}
          </Button>
        </div>
      </div>
    </article>
  );
}

export { PlantCard };
