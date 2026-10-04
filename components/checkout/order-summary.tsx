"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseCartQuoteResult } from "@/hooks/use-cart-quote";
import { Link } from "@/i18n/navigation";
import { parseMoney } from "@/lib/cart";
import {
  PLANT_IMAGE_PLACEHOLDER,
  formatStorefrontPrice,
  localizeText,
} from "@/lib/storefront";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/order";

function SummarySkeleton() {
  return (
    <div className="mt-5 space-y-5" aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className="flex gap-3.5">
          <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderSummary({
  className,
  cartQuote,
  paymentMethod = "cod",
}: {
  className?: string;
  cartQuote: UseCartQuoteResult;
  paymentMethod?: PaymentMethod;
}) {
  const t = useTranslations("checkout.orderSummary");
  const tCart = useTranslations("cart");
  const locale = useLocale();

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const { quote, lineFor, isStale, hasError, retry } = cartQuote;

  const shippingFee = quote ? parseMoney(quote.shipping_fee) : null;
  const amountClass = cn("tabular-nums transition-opacity", isStale && "opacity-50");

  return (
    <aside
      data-slot="order-summary"
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 shadow-subtle sm:p-6",
        className,
      )}
    >
      <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
        {t("title")}
      </h2>

      {!hasHydrated ? (
        <SummarySkeleton />
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="font-sans text-sm font-semibold text-foreground">
            {t("empty")}
          </p>
          <Link
            href="/"
            className="mt-2 inline-block font-sans text-small font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("shopPlants")}
          </Link>
        </div>
      ) : hasError && !quote ? (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-5 text-center">
          <p className="font-sans text-sm text-foreground">{tCart("priceError")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 rounded-lg px-3 font-sans text-xs"
            onClick={retry}
          >
            {tCart("retry")}
          </Button>
        </div>
      ) : !quote ? (
        <SummarySkeleton />
      ) : (
        <>
          <ul className="mt-5 space-y-5">
            {items.map((item) => {
              const line = lineFor(item.id);
              const name = line?.name
                ? localizeText(line.name, line.name_vi, locale)
                : tCart("unavailablePlant");
              const exceedsStock =
                line?.available && item.quantity > line.max_quantity;

              return (
                <li key={item.id} className="flex gap-3.5">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-16">
                    {line ? (
                      <Image
                        src={line.image_url ?? PLANT_IMAGE_PLACEHOLDER}
                        alt={name}
                        fill
                        className={cn(
                          "object-cover",
                          !line.available && "opacity-50",
                        )}
                        sizes="64px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {line ? (
                          <p className="font-sans text-sm font-semibold text-foreground">
                            {name}
                          </p>
                        ) : (
                          <Skeleton className="h-3.5 w-32" />
                        )}
                        {line && !line.available ? (
                          <p className="mt-0.5 font-sans text-small font-medium text-destructive">
                            {tCart("lineUnavailable")}
                          </p>
                        ) : exceedsStock ? (
                          <p className="mt-0.5 font-sans text-small font-medium text-destructive">
                            {tCart("lineLimitedStock", {
                              count: line.max_quantity,
                            })}
                          </p>
                        ) : line?.pot_size_name ? (
                          <p className="mt-0.5 font-sans text-small text-muted-foreground">
                            {line.pot_size_name}
                          </p>
                        ) : null}
                        <p className="mt-1 font-sans text-small text-muted-foreground">
                          {t("qty", { count: item.quantity })}
                        </p>
                      </div>
                      {line?.available ? (
                        <p
                          className={cn(
                            amountClass,
                            "shrink-0 font-sans text-sm font-semibold text-primary",
                          )}
                        >
                          {formatStorefrontPrice(line.line_total, locale)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 space-y-2.5 border-t border-border pt-5 font-sans text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t("subtotal")}</dt>
              <dd className={cn(amountClass, "text-foreground")}>
                {formatStorefrontPrice(quote.subtotal_amount, locale)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t("shipping")}</dt>
              <dd
                className={cn(
                  amountClass,
                  shippingFee === 0
                    ? "font-medium text-primary"
                    : "text-foreground",
                )}
              >
                {shippingFee === 0
                  ? t("free")
                  : formatStorefrontPrice(quote.shipping_fee, locale)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <dt className="text-base font-semibold text-foreground">
                {t("total")}
              </dt>
              <dd className={cn(amountClass, "text-lg font-bold text-foreground")}>
                {formatStorefrontPrice(quote.total_amount, locale)}
              </dd>
            </div>
          </dl>
        </>
      )}

      <div className="mt-5 flex gap-2.5 rounded-xl border border-primary/15 bg-secondary/60 px-3.5 py-3">
        <ShieldCheckIcon
          className="mt-0.5 size-4 shrink-0 text-primary stroke-[1.5]"
          aria-hidden="true"
        />
        <p className="font-sans text-[0.75rem] leading-relaxed text-muted-foreground">
          {paymentMethod === "bank_transfer"
            ? t("bankTransferNotice")
            : t("secureNotice")}
        </p>
      </div>
    </aside>
  );
}

export { OrderSummary };
