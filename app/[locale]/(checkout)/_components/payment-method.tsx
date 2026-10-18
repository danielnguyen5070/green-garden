"use client";

import { useTranslations } from "next-intl";
import { CreditCardIcon, LandmarkIcon, WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/order";

const METHOD_ICONS = {
  cod: WalletIcon,
  bank_transfer: LandmarkIcon,
} satisfies Record<PaymentMethod, typeof WalletIcon>;

const METHOD_KEYS = {
  cod: "cod",
  bank_transfer: "bankTransfer",
} as const satisfies Record<PaymentMethod, string>;

function PaymentMethodSelector({
  className,
  value,
  disabled,
  onChange,
}: {
  className?: string;
  value: PaymentMethod;
  disabled?: boolean;
  onChange: (value: PaymentMethod) => void;
}) {
  const t = useTranslations("checkout.paymentMethod");

  return (
    <section
      data-slot="payment-method"
      aria-labelledby="payment-method-heading"
      className={cn(className)}
    >
      <div className="mb-5 flex items-center gap-2">
        <CreditCardIcon
          className="size-4 text-primary stroke-[1.5]"
          aria-hidden="true"
        />
        <h2
          id="payment-method-heading"
          className="font-sans text-base font-semibold tracking-tight text-foreground"
        >
          {t("title")}
        </h2>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="payment-method-heading"
        className="space-y-3"
      >
        {PAYMENT_METHODS.map((method) => {
          const Icon = METHOD_ICONS[method];
          const key = METHOD_KEYS[method];
          const selected = value === method;

          return (
            <label
              key={method}
              className={cn(
                "flex cursor-pointer items-start gap-3.5 rounded-xl border px-4 py-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                selected
                  ? "border-primary/30 bg-secondary/50"
                  : "border-border bg-card hover:border-primary/20",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={method}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(method)}
                className="sr-only"
              />
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                aria-hidden="true"
              >
                <Icon className="size-4 text-primary stroke-[1.5]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm font-semibold text-foreground">
                  {t(`${key}.title`)}
                </span>
                <span className="mt-1 block font-sans text-small text-muted-foreground">
                  {t(`${key}.description`)}
                </span>
              </span>
              <span
                className={cn(
                  "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-primary" : "border-muted-foreground/40",
                )}
                aria-hidden="true"
              >
                {selected ? (
                  <span className="size-2 rounded-full bg-primary" />
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export { PaymentMethodSelector };
