"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheckIcon } from "lucide-react";
import { formatCartMoney } from "@/lib/cart";
import {
  CHECKOUT_MOCK_ITEMS,
  CHECKOUT_SHIPPING_METHODS,
  getCheckoutSubtotal,
  getCheckoutTax,
  getCheckoutTotal,
  type CheckoutShippingMethodId,
} from "@/lib/checkout";
import { cn } from "@/lib/utils";

function OrderSummary({
  shippingMethodId,
  className,
}: {
  shippingMethodId: CheckoutShippingMethodId;
  className?: string;
}) {
  const t = useTranslations("checkout.orderSummary");
  const locale = useLocale();
  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  const items = CHECKOUT_MOCK_ITEMS;
  const subtotal = getCheckoutSubtotal(items);
  const shipping =
    CHECKOUT_SHIPPING_METHODS.find((method) => method.id === shippingMethodId)
      ?.price ?? 0;
  const tax = getCheckoutTax(subtotal);
  const total = getCheckoutTotal(subtotal, shipping, tax);

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

      <ul className="mt-5 space-y-5">
        {items.map((item) => {
          const variant = [item.potSizeLabel, item.potColorLabel]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={item.id} className="flex gap-3.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-16">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    {variant ? (
                      <p className="mt-0.5 font-sans text-small text-muted-foreground">
                        {variant}
                      </p>
                    ) : null}
                    <p className="mt-1 font-sans text-small text-muted-foreground">
                      {t("qty", { count: item.quantity })}
                    </p>
                  </div>
                  <p className="shrink-0 font-sans text-sm font-semibold text-primary">
                    {formatCartMoney(item.price * item.quantity, moneyLocale)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-6 space-y-2.5 border-t border-border pt-5 font-sans text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("subtotal")}</dt>
          <dd className="tabular-nums text-foreground">
            {formatCartMoney(subtotal, moneyLocale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("shipping")}</dt>
          <dd
            className={
              shipping === 0
                ? "font-medium text-primary"
                : "tabular-nums text-foreground"
            }
          >
            {shipping === 0
              ? t("free")
              : formatCartMoney(shipping, moneyLocale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("tax")}</dt>
          <dd className="tabular-nums text-foreground">
            {formatCartMoney(tax, moneyLocale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <dt className="text-base font-semibold text-foreground">
            {t("total")}
          </dt>
          <dd className="text-lg font-bold tabular-nums text-foreground">
            {formatCartMoney(total, moneyLocale)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex gap-2.5 rounded-xl border border-primary/15 bg-secondary/60 px-3.5 py-3">
        <ShieldCheckIcon
          className="mt-0.5 size-4 shrink-0 text-primary stroke-[1.5]"
          aria-hidden="true"
        />
        <p className="font-sans text-[0.75rem] leading-relaxed text-muted-foreground">
          {t("secureNotice")}
        </p>
      </div>
    </aside>
  );
}

export { OrderSummary };
