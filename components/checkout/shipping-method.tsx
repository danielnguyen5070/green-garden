"use client";

import { useTranslations } from "next-intl";
import { PackageIcon } from "lucide-react";
import { CHECKOUT_SHIPPING_METHODS, type CheckoutShippingMethodId } from "@/lib/checkout";
import { formatCartMoney } from "@/lib/cart";
import { cn } from "@/lib/utils";

function ShippingMethod({
  value,
  onChange,
  className,
}: {
  value: CheckoutShippingMethodId;
  onChange: (id: CheckoutShippingMethodId) => void;
  className?: string;
}) {
  const t = useTranslations("checkout.shippingMethod");

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

      <div
        className="space-y-3"
        role="radiogroup"
        aria-labelledby="shipping-method-heading"
      >
        {CHECKOUT_SHIPPING_METHODS.map((method) => {
          const selected = method.id === value;

          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(method.id)}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-xl border px-4 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-secondary/50"
                  : "border-border bg-card hover:border-border",
              )}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary"
                    : "border-muted-foreground/40",
                )}
                aria-hidden="true"
              >
                {selected ? (
                  <span className="size-2 rounded-full bg-primary" />
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm font-semibold text-foreground">
                  {t(method.nameKey)}
                </span>
                <span className="mt-0.5 block font-sans text-small text-muted-foreground">
                  {t(method.etaKey)}
                </span>
              </span>

              <span
                className={cn(
                  "shrink-0 font-sans text-sm font-semibold",
                  method.price === 0 ? "text-primary" : "text-foreground",
                )}
              >
                {method.price === 0
                  ? t("free")
                  : formatCartMoney(method.price)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { ShippingMethod };
