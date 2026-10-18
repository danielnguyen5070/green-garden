"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatStorefrontPrice,
} from "@/lib/storefront";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/lib/utils";

/**
 * The interactive part of the plant detail page: price, quantity and add to
 * cart. `children` is the server-rendered description, shown between the price
 * and the quantity controls.
 */
function PlantPurchase({
  plantId,
  basePrice,
  inStock,
  children,
}: {
  plantId: string;
  basePrice: number | null;
  inStock: boolean;
  children?: React.ReactNode;
}) {
  const t = useTranslations("plantDetail");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [favorited, setFavorited] = useState(false);

  const lineTotal = basePrice === null ? null : basePrice * quantity;
  const canAddToCart = inStock && basePrice !== null;

  function handleAddToCart() {
    addItem({ plantId, quantity });
  }

  return (
    <>
      <p className="mt-5 font-sans text-xl font-semibold tracking-tight text-foreground">
        {basePrice === null
          ? tCommon("contactForPrice")
          : formatStorefrontPrice(basePrice, locale)}
      </p>

      {children}

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
          data-testid="add-to-cart"
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
    </>
  );
}

export { PlantPurchase };
