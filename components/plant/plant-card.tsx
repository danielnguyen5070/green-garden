"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  function handleAddToCart() {
    addItem(plant);
  }

  return (
    <article
      data-slot="plant-card"
      className={cn("group flex h-full flex-col", className)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={plant.image}
            alt={plant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>

        {plant.bestseller ? (
          <span className="absolute top-3 left-3 rounded-md bg-accent px-2 py-1 font-sans text-[0.625rem] font-semibold tracking-[0.08em] text-accent-foreground uppercase">
            {t("bestseller")}
          </span>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="absolute top-3 right-3 size-9 rounded-full border-border/80 bg-card text-foreground shadow-subtle hover:bg-card hover:text-foreground"
          aria-label={t("favorite")}
        >
          <HeartIcon className="size-4 stroke-[1.5]" />
        </Button>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1.5">
        <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
          {plant.name}
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
