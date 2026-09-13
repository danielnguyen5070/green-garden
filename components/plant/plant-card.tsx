"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Plant } from "@/types/plant";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function PlantCard({ plant, className }: { plant: Plant; className?: string }) {
  const t = useTranslations("home.products");
  const tCommon = useTranslations("common");
  const addItem = useCartStore((state) => state.addItem);

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addItem(plant);
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
          className="relative block aspect-[4/5] w-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src={plant.image}
            alt={plant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </Link>

        {plant.bestseller ? (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-accent px-2 py-1 font-sans text-[0.625rem] font-semibold tracking-[0.08em] text-accent-foreground uppercase">
            {t("bestseller")}
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
            {plant.name}
          </Link>
        </h3>
        <p className="font-sans text-small text-muted-foreground">
          {plant.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="font-sans text-base font-semibold text-primary">
            {priceFormatter.format(plant.price)}
          </p>
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-lg px-3 font-sans text-xs font-semibold"
            onClick={handleAddToCart}
          >
            {tCommon("addToCart")}
          </Button>
        </div>
      </div>
    </article>
  );
}

export { PlantCard };
