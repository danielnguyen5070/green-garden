"use client";

import { useLocale, useTranslations } from "next-intl";
import { PackageIcon, TruckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCartMoney } from "@/lib/cart";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/lib/utils";

function ShippingMethod({ className }: { className?: string }) {
  const t = useTranslations("checkout.shippingMethod");
  const locale = useLocale();
  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const shipping = useCartStore((state) => state.shipping(moneyLocale));
  const amountToFreeShipping = useCartStore((state) =>
    state.amountToFreeShipping(moneyLocale),
  );

  const isFree = shipping === 0;

  return (
    <section
      data-slot="shipping-method"
      aria-labelledby="shipping-method-heading"
      className={cn(className)}
    >
      <div className="mb-5 flex items-center gap-2">
        <PackageIcon
          className="size-4 text-primary stroke-[1.5]"
          aria-hidden="true"
        />
        <h2
          id="shipping-method-heading"
          className="font-sans text-base font-semibold tracking-tight text-foreground"
        >
          {t("title")}
        </h2>
      </div>

      <div className="flex items-start gap-3.5 rounded-xl border border-primary/30 bg-secondary/50 px-4 py-4">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          aria-hidden="true"
        >
          <TruckIcon className="size-4 text-primary stroke-[1.5]" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-sans text-sm font-semibold text-foreground">
              {t("standard")}
            </p>
            {hasHydrated ? (
              <p
                className={cn(
                  "font-sans text-sm font-semibold",
                  isFree ? "text-primary" : "tabular-nums text-foreground",
                )}
              >
                {isFree ? t("free") : formatCartMoney(shipping, moneyLocale)}
              </p>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
          </div>
          <p className="mt-1 font-sans text-small text-muted-foreground">
            {t("carrier")}
          </p>
          <p className="mt-0.5 font-sans text-small text-muted-foreground">
            {t("eta")}
          </p>
          {hasHydrated && !isFree ? (
            <p className="mt-1.5 font-sans text-small font-medium text-primary">
              {t("freeShippingHint", {
                amount: formatCartMoney(amountToFreeShipping, moneyLocale),
              })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { ShippingMethod };
