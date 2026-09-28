"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLANT_IMAGE_PLACEHOLDER,
  formatStorefrontPrice,
  localizeText,
} from "@/lib/storefront";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { CartItem as CartItemType } from "@/types/cart";
import type { StorefrontQuoteLine } from "@/types/storefront";

function CartItem({
  item,
  line,
  isStale,
}: {
  item: CartItemType;
  /** Backend pricing for this line; missing until the first quote arrives. */
  line: StorefrontQuoteLine | undefined;
  isStale: boolean;
}) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const name = line?.name
    ? localizeText(line.name, line.name_vi, locale)
    : line
      ? t("unavailablePlant")
      : "";
  const exceedsStock = line?.available && item.quantity > line.max_quantity;

  return (
    <li
      data-slot="cart-item"
      className="flex gap-3.5 border-b border-border/70 py-4 last:border-b-0"
    >
      <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-xl bg-muted sm:size-[4.5rem]">
        {line ? (
          <Image
            src={line.image_url ?? PLANT_IMAGE_PLACEHOLDER}
            alt={name}
            fill
            className={cn("object-cover", !line.available && "opacity-50")}
            sizes="72px"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {line ? (
              <h3 className="truncate font-sans text-sm font-semibold tracking-tight text-foreground">
                {name}
              </h3>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}
            {line && !line.available ? (
              <p className="mt-0.5 font-sans text-small font-medium text-destructive">
                {t("lineUnavailable")}
              </p>
            ) : exceedsStock ? (
              <p className="mt-0.5 font-sans text-small font-medium text-destructive">
                {t("lineLimitedStock", { count: line.max_quantity })}
              </p>
            ) : line?.pot_size_name ? (
              <p className="mt-0.5 line-clamp-1 font-sans text-small text-muted-foreground">
                {line.pot_size_name}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            aria-label={t("remove", { name })}
            onClick={() => removeItem(item.id)}
          >
            <Trash2Icon className="size-3.5 stroke-[1.5]" />
          </Button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div
            className="inline-flex h-8 items-center rounded-full bg-muted px-1"
            role="group"
            aria-label={t("quantity")}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-6 rounded-full text-foreground hover:bg-background"
              aria-label={t("decreaseQuantity", { name })}
              disabled={item.quantity <= 1}
              onClick={() => decreaseQuantity(item.id)}
            >
              <MinusIcon className="size-3.5 stroke-[1.75]" />
            </Button>
            <span
              className="min-w-6 text-center font-sans text-sm font-medium tabular-nums text-foreground"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-6 rounded-full text-foreground hover:bg-background"
              aria-label={t("increaseQuantity", { name })}
              disabled={line !== undefined && !line.available}
              onClick={() => increaseQuantity(item.id)}
            >
              <PlusIcon className="size-3.5 stroke-[1.75]" />
            </Button>
          </div>

          {line ? (
            line.available ? (
              <p
                className={cn(
                  "font-sans text-sm font-semibold tabular-nums text-primary transition-opacity",
                  isStale && "opacity-50"
                )}
              >
                {formatStorefrontPrice(line.line_total, locale)}
              </p>
            ) : null
          ) : (
            <Skeleton className="h-4 w-16" />
          )}
        </div>
      </div>
    </li>
  );
}

export { CartItem };
