"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ShippingDetails } from "@/components/checkout/shipping-details";
import { ShippingMethod } from "@/components/checkout/shipping-method";
import { useRouter } from "@/i18n/navigation";
import { createStorefrontOrder } from "@/lib/api/storefront";
import { ApiError } from "@/lib/api/errors";
import {
  CHECKOUT_FORM_FIELDS,
  EMPTY_CHECKOUT_FORM,
  isCheckoutFormValid,
  toStorefrontOrderPayload,
  validateCheckoutField,
  validateCheckoutForm,
  type CheckoutFormErrors,
  type CheckoutFormField,
  type CheckoutFormValues,
} from "@/lib/checkout-form";
import { toast } from "@/lib/toast";
import { useCartStore } from "@/store/cart.store";
import { useLastOrderStore } from "@/store/order.store";

/** Backend failures the customer can act on; everything else is generic. */
function getErrorKey(error: unknown) {
  if (!(error instanceof ApiError)) return "generic";

  switch (error.status) {
    case 404:
      return "unavailable";
    case 409:
      return "outOfStock";
    case 422:
      return "invalidDetails";
    default:
      return "generic";
  }
}

function CheckoutPageView() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const locale = useLocale();
  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  const [values, setValues] = useState<CheckoutFormValues>(EMPTY_CHECKOUT_FORM);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total(moneyLocale));
  const setLastOrder = useLastOrderStore((state) => state.setOrder);

  const canSubmit =
    hasHydrated &&
    !submitting &&
    items.length > 0 &&
    isCheckoutFormValid(values);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const nextErrors = validateCheckoutForm(values);
    setErrors(nextErrors);

    const firstInvalid = CHECKOUT_FORM_FIELDS.find((field) =>
      Boolean(nextErrors[field]),
    );

    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }

    if (items.length === 0) {
      toast.error(t("errors.emptyCart"));
      return;
    }

    setSubmitting(true);

    try {
      const order = await createStorefrontOrder(
        toStorefrontOrderPayload(values, items),
      );

      // Carry the checkout total across: the backend prices in USD, so its own
      // total would not match what the customer just agreed to.
      setLastOrder({ order, total, moneyLocale });
      // Only now is the order safely on the backend.
      clearCart();
      router.push("/order-success");
    } catch (error) {
      toast.error(t(`errors.${getErrorKey(error)}`));
      setSubmitting(false);
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
            disabled={submitting}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ShippingMethod className="mt-9 md:mt-10" />

          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            className="mt-8 h-12 w-full rounded-xl font-sans text-sm font-semibold md:mt-10"
          >
            {submitting ? t("placingOrder") : t("placeOrder")}
          </Button>
        </form>

        <OrderSummary className="lg:sticky lg:top-8" />
      </div>
    </div>
  );
}

export { CheckoutPageView };
