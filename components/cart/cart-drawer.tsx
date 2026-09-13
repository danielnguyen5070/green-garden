"use client";

import { useTranslations } from "next-intl";
import { ShoppingBagIcon, XIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartStore } from "@/store/cart.store";

function CartDrawer() {
  const t = useTranslations("cart");
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const count = hasHydrated ? totalItems : 0;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          useCartStore.getState().openCart();
          return;
        }
        closeCart();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden border-l border-border bg-card p-0 shadow-lg sm:max-w-[400px]"
      >
        <SheetHeader className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <ShoppingBagIcon
                className="size-5 shrink-0 text-primary stroke-[1.5]"
                aria-hidden="true"
              />
              <SheetTitle className="font-sans text-base font-bold tracking-tight text-foreground">
                {t("title")}
              </SheetTitle>
              <span className="rounded-md bg-secondary px-2 py-0.5 font-sans text-[0.6875rem] font-semibold text-secondary-foreground">
                {t("items", { count })}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-muted-foreground hover:text-foreground"
              aria-label={t("close")}
              onClick={closeCart}
            >
              <XIcon className="size-4 stroke-[1.5]" />
            </Button>
          </div>
          <SheetDescription className="sr-only">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <>
            <ul className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ul>
            <CartSummary />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { CartDrawer };
