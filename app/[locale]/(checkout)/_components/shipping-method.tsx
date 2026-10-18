"use client";

import { useLocale, useTranslations } from "next-intl";
import { PackageIcon, TruckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseCartQuoteResult } from "@/hooks/use-cart-quote";
import { parseMoney } from "@/lib/cart";
import { formatStorefrontPrice } from "@/lib/storefront";
import { cn } from "@/lib/utils";

function ShippingMethod({
  className,
  cartQuote,
}: {
  className?: string;
  cartQuote: UseCartQuoteResult;
}) {
  const t = useTranslations("checkout.shippingMethod");
  const locale = useLocale();

  const { quote, isStale } = cartQuote;
  const isFree = quote !== null && parseMoney(quote.shipping_fee) === 0;

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
            {quote ? (
              <p
                className={cn(
                  "font-sans text-sm font-semibold transition-opacity",
                  isFree ? "text-primary" : "tabular-nums text-foreground",
                  isStale && "opacity-50",
                )}
              >
                {isFree
                  ? t("free")
                  : formatStorefrontPrice(quote.shipping_fee, locale)}
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
          {quote && !isFree && parseMoney(quote.subtotal_amount) > 0 ? (
            <p className="mt-1.5 font-sans text-small font-medium text-primary">
              {t("freeShippingHint", {
                amount: formatStorefrontPrice(
                  quote.amount_to_free_shipping,
                  locale,
                ),
              })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { ShippingMethod };
