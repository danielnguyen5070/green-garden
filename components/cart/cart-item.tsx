"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCartMoney } from "@/lib/cart";
import { useCartStore } from "@/store/cart.store";
import type { CartItem as CartItemType } from "@/types/cart";

function CartItem({ item }: { item: CartItemType }) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <li
      data-slot="cart-item"
      className="flex gap-3.5 border-b border-border/70 py-4 last:border-b-0"
    >
      <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-xl bg-muted sm:size-[4.5rem]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="72px"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-sans text-sm font-semibold tracking-tight text-foreground">
              {item.name}
            </h3>
            {item.description ? (
              <p className="mt-0.5 line-clamp-1 font-sans text-small text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            aria-label={t("remove", { name: item.name })}
            onClick={() => removeItem(item.plantId)}
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
              aria-label={t("decreaseQuantity", { name: item.name })}
              disabled={item.quantity <= 1}
              onClick={() => decreaseQuantity(item.plantId)}
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
              aria-label={t("increaseQuantity", { name: item.name })}
              onClick={() => increaseQuantity(item.plantId)}
            >
              <PlusIcon className="size-3.5 stroke-[1.75]" />
            </Button>
          </div>

          <p className="font-sans text-sm font-semibold tabular-nums text-primary">
            {formatCartMoney(item.price * item.quantity, moneyLocale)}
          </p>
        </div>
      </div>
    </li>
  );
}

export { CartItem };
