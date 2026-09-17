"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ShippingDetails } from "@/components/checkout/shipping-details";
import { ShippingMethod } from "@/components/checkout/shipping-method";
import {
  CHECKOUT_FORM_FIELDS,
  EMPTY_CHECKOUT_FORM,
  validateCheckoutField,
  validateCheckoutForm,
  type CheckoutFormErrors,
  type CheckoutFormField,
  type CheckoutFormValues,
} from "@/lib/checkout-form";

function CheckoutPageView() {
  const t = useTranslations("checkout");
  const [values, setValues] = useState<CheckoutFormValues>(EMPTY_CHECKOUT_FORM);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});

  const handleChange = useCallback(
    (field: CheckoutFormField, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      // Clearing as the customer types keeps the message from nagging mid-fix.
      setErrors((current) =>
        current[field] ? { ...current, [field]: undefined } : current,
      );
    },
    [],
  );

  const handleBlur = useCallback(
    (field: CheckoutFormField) => {
      setErrors((current) => ({
        ...current,
        [field]: validateCheckoutField(field, values),
      }));
    },
    [values],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCheckoutForm(values);
    setErrors(nextErrors);

    const firstInvalid = CHECKOUT_FORM_FIELDS.find((field) =>
      Boolean(nextErrors[field]),
    );

    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
    }
  }

  return (
    <div data-slot="checkout-page">
      <CheckoutProgress currentStep="shipping" className="mb-8 md:mb-9" />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-12 xl:gap-16">
        <form className="min-w-0" onSubmit={handleSubmit} noValidate>
          <header className="max-w-xl">
            <h1 className="font-heading text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[2.5rem]">
              {t("title")}
            </h1>
            <p className="mt-2 font-sans text-body text-muted-foreground">
              {t("description")}
            </p>
          </header>

          <ShippingDetails
            className="mt-9 md:mt-10"
            values={values}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ShippingMethod className="mt-9 md:mt-10" />

          <Button
            type="submit"
            size="lg"
            className="mt-8 h-12 w-full rounded-xl font-sans text-sm font-semibold md:mt-10"
          >
            {t("continueToPayment")}
          </Button>
        </form>

        <OrderSummary className="lg:sticky lg:top-8" />
      </div>
    </div>
  );
}

export { CheckoutPageView };
