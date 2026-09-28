"use client";

import { useLocale, useTranslations } from "next-intl";
import { TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseCartQuoteResult } from "@/hooks/use-cart-quote";
import { parseMoney } from "@/lib/cart";
import { formatStorefrontPrice } from "@/lib/storefront";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "@/i18n/navigation";

function CartSummary({ cartQuote }: { cartQuote: UseCartQuoteResult }) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);

  const { quote, isStale, hasError, isOrderable, retry } = cartQuote;

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  if (items.length === 0) {
    return null;
  }

  const shippingFee = quote ? parseMoney(quote.shipping_fee) : null;
  const freeShippingUnlocked =
    quote !== null && shippingFee === 0 && parseMoney(quote.subtotal_amount) > 0;
  const amountClass = cn("tabular-nums transition-opacity", isStale && "opacity-50");

  return (
    <div
      data-slot="cart-summary"
      className="shrink-0 border-t border-border bg-card px-5 pt-4 pb-5 sm:px-6"
    >
      {hasError ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
          <p className="font-sans text-small text-foreground">{t("priceError")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 rounded-lg px-2.5 font-sans text-xs"
            onClick={retry}
          >
            {t("retry")}
          </Button>
        </div>
      ) : quote ? (
        <div
          className={`mb-4 rounded-xl border px-3.5 py-3 ${
            freeShippingUnlocked
              ? "border-primary/20 bg-secondary/60"
              : "border-border bg-muted/70"
          }`}
        >
          <div className="flex gap-2.5">
            <TruckIcon
              className={`mt-0.5 size-4 shrink-0 stroke-[1.5] ${
                freeShippingUnlocked ? "text-primary" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-foreground">
                {freeShippingUnlocked
                  ? t("freeShippingUnlocked")
                  : t("freeShipping")}
              </p>
              <p className="mt-0.5 font-sans text-small text-muted-foreground">
                {freeShippingUnlocked
                  ? t("freeShippingDescription")
                  : t("addMoreForFreeShipping", {
                      amount: formatStorefrontPrice(
                        quote.amount_to_free_shipping,
                        locale
                      ),
                    })}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <dl className="space-y-2 font-sans text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("subtotal")}</dt>
          <dd className={cn(amountClass, "text-muted-foreground")}>
            {quote ? (
              formatStorefrontPrice(quote.subtotal_amount, locale)
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("shipping")}</dt>
          <dd
            className={cn(
              amountClass,
              shippingFee === 0
                ? "font-medium text-primary"
                : "text-muted-foreground"
            )}
          >
            {quote === null ? (
              <Skeleton className="h-4 w-16" />
            ) : shippingFee === 0 ? (
              t("free")
            ) : (
              formatStorefrontPrice(quote.shipping_fee, locale)
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <dt className="text-base font-semibold text-foreground">
            {t("total")}
          </dt>
          <dd className={cn(amountClass, "text-lg font-bold text-primary")}>
            {quote ? (
              formatStorefrontPrice(quote.total_amount, locale)
            ) : (
              <Skeleton className="h-5 w-24" />
            )}
          </dd>
        </div>
      </dl>

      {quote && !isStale && !isOrderable ? (
        <p className="mt-3 font-sans text-small font-medium text-destructive">
          {t("reviewCart")}
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="mt-4 h-11 w-full rounded-xl font-sans text-sm font-semibold"
        onClick={handleCheckout}
      >
        {t("checkout")}
      </Button>

      <p className="mt-3 text-center font-sans text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
        {t("secureCheckout")}
      </p>
    </div>
  );
}

export { CartSummary };
