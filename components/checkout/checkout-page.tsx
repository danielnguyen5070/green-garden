"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ShippingDetails } from "@/components/checkout/shipping-details";
import { ShippingMethod } from "@/components/checkout/shipping-method";
import type { CheckoutShippingMethodId } from "@/lib/checkout";

function CheckoutPageView() {
  const t = useTranslations("checkout");
  const [shippingMethodId, setShippingMethodId] =
    useState<CheckoutShippingMethodId>("standard");

  return (
    <div data-slot="checkout-page">
      <CheckoutProgress currentStep="shipping" className="mb-8 md:mb-9" />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-12 xl:gap-16">
        <div className="min-w-0">
          <header className="max-w-xl">
            <h1 className="font-heading text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[2.5rem]">
              {t("title")}
            </h1>
            <p className="mt-2 font-sans text-body text-muted-foreground">
              {t("description")}
            </p>
          </header>

          <ShippingDetails className="mt-9 md:mt-10" />
          <ShippingMethod
            className="mt-9 md:mt-10"
            value={shippingMethodId}
            onChange={setShippingMethodId}
          />

          <Button
            type="button"
            size="lg"
            className="mt-8 h-12 w-full rounded-xl font-sans text-sm font-semibold md:mt-10"
          >
            {t("continueToPayment")}
          </Button>
        </div>

        <OrderSummary
          shippingMethodId={shippingMethodId}
          className="lg:sticky lg:top-8"
        />
      </div>
    </div>
  );
}

export { CheckoutPageView };
