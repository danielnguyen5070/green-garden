"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BankTransferPayment } from "@/components/checkout/bank-transfer-payment";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethodSelector } from "@/components/checkout/payment-method";
import { ShippingDetails } from "@/components/checkout/shipping-details";
import { ShippingMethod } from "@/components/checkout/shipping-method";
import { useBotSignals } from "@/hooks/use-bot-signals";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { useRouter } from "@/i18n/navigation";
import { createStorefrontOrder } from "@/lib/api/storefront";
import {
  ApiError,
  ErrorCode,
  getErrorReference,
  getFieldErrors,
} from "@/lib/api/errors";
import {
  CHECKOUT_FORM_FIELDS,
  EMPTY_CHECKOUT_FORM,
  isCheckoutFormValid,
  toCheckoutFormErrors,
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
import type { PaymentMethod } from "@/types/order";
import type { StorefrontOrderResponse } from "@/types/storefront";

function awaitsBankTransfer(order: StorefrontOrderResponse) {
  return (
    order.payment_method === "bank_transfer" &&
    order.payment !== null &&
    order.payment_status !== "paid"
  );
}

function BankTransferStep({ order }: { order: StorefrontOrderResponse }) {
  const t = useTranslations("checkout.bankTransferStep");
  const router = useRouter();
  const setLastOrder = useLastOrderStore((state) => state.setOrder);

  const handlePaid = useCallback(() => {
    setLastOrder({ order: { ...order, payment_status: "paid" } });
    router.push("/order-success");
  }, [order, router, setLastOrder]);

  return (
    <div data-slot="checkout-bank-transfer">
      <CheckoutProgress currentStep="payment" className="mb-8 md:mb-9" />

      <div className="mx-auto max-w-xl">
        <header className="text-center">
          <h1 className="font-heading text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[2.5rem]">
            {t("title")}
          </h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">
            {t("description", { orderNumber: order.order_number })}
          </p>
        </header>

        {order.payment ? (
          <BankTransferPayment
            orderId={order.id}
            payment={order.payment}
            initialStatus={order.payment_status}
            onPaid={handlePaid}
          />
        ) : null}
      </div>
    </div>
  );
}

/** Backend failures the customer can act on; everything else is generic. */
function getErrorKey(error: unknown) {
  if (!(error instanceof ApiError)) return "generic";

  switch (error.errorCode) {
    case ErrorCode.SUBMISSION_REJECTED:
      return "rejected";
    case ErrorCode.PLANT_NOT_FOUND:
    case ErrorCode.PLANT_POT_SIZE_NOT_FOUND:
    case ErrorCode.POT_SIZE_UNAVAILABLE:
    case ErrorCode.PLANT_UNAVAILABLE:
      return "unavailable";
    case ErrorCode.INSUFFICIENT_STOCK:
      return "outOfStock";
    case ErrorCode.VALIDATION_ERROR:
      return "invalidDetails";
    case ErrorCode.RATE_LIMITED:
      return error.retryAfterSeconds ? "rateLimited" : "rateLimitedLater";
    case ErrorCode.SERVICE_UNAVAILABLE:
      return "bankTransferUnavailable";
    default:
      return "generic";
  }
}

function getRetryAfterMinutes(error: unknown) {
  const seconds = error instanceof ApiError ? error.retryAfterSeconds : undefined;
  return seconds ? Math.max(1, Math.ceil(seconds / 60)) : 0;
}

function CheckoutPageView() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [values, setValues] = useState<CheckoutFormValues>(EMPTY_CHECKOUT_FORM);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);

  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clearCart);
  const lastOrder = useLastOrderStore((state) => state.order);
  const lastOrderHydrated = useLastOrderStore((state) => state.hasHydrated);
  const setLastOrder = useLastOrderStore((state) => state.setOrder);
  const cartQuote = useCartQuote();
  const { honeypotRef, getBotSignals } = useBotSignals();

  // The customer only submits against a current backend quote they can see.
  const canSubmit =
    hasHydrated &&
    !submitting &&
    items.length > 0 &&
    cartQuote.isOrderable &&
    isCheckoutFormValid(values);
  const showCartProblem =
    cartQuote.quote !== null && !cartQuote.isStale && !cartQuote.isOrderable;

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
        toStorefrontOrderPayload(values, items, getBotSignals(), paymentMethod),
      );

      setLastOrder({ order });
      // Only now is the order safely on the backend.
      clearCart();
      if (awaitsBankTransfer(order)) {
        setSubmitting(false);
      } else {
        router.push("/order-success");
      }
    } catch (error) {
      const serverErrors = toCheckoutFormErrors(getFieldErrors(error));
      const firstServerInvalid = CHECKOUT_FORM_FIELDS.find((field) =>
        Boolean(serverErrors[field]),
      );
      if (firstServerInvalid) {
        setErrors(serverErrors);
      }

      const reference = getErrorReference(error);
      toast.error(
        t(`errors.${getErrorKey(error)}`, {
          minutes: getRetryAfterMinutes(error),
        }),
        reference
          ? { description: tCommon("errorReference", { id: reference }) }
          : undefined,
      );
      setSubmitting(false);
      if (firstServerInvalid) {
        // The inputs re-enable on the next render, so focus after it.
        requestAnimationFrame(() => {
          document.getElementById(`checkout-${firstServerInvalid}`)?.focus();
        });
      }
    }
  }

  // An unpaid transfer whose cart is already cleared survives a refresh here.
  const pendingTransfer =
    hasHydrated &&
    lastOrderHydrated &&
    items.length === 0 &&
    lastOrder &&
    awaitsBankTransfer(lastOrder.order)
      ? lastOrder.order
      : null;

  if (pendingTransfer) {
    return <BankTransferStep order={pendingTransfer} />;
  }

  const isBankTransfer = paymentMethod === "bank_transfer";

  return (
    <div data-slot="checkout-page">
      <CheckoutProgress currentStep="shipping" className="mb-8 md:mb-9" />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-12 xl:gap-16">
        <form className="relative min-w-0" onSubmit={handleSubmit} noValidate>
          <HoneypotField ref={honeypotRef} />
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
          <ShippingMethod className="mt-9 md:mt-10" cartQuote={cartQuote} />
          <PaymentMethodSelector
            className="mt-9 md:mt-10"
            value={paymentMethod}
            disabled={submitting}
            onChange={setPaymentMethod}
          />

          {showCartProblem ? (
            <p
              className="mt-8 font-sans text-small font-medium text-destructive md:mt-10"
              role="alert"
            >
              {tCart("reviewCart")}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            className="mt-8 h-12 w-full rounded-xl font-sans text-sm font-semibold md:mt-10"
          >
            {submitting
              ? isBankTransfer
                ? t("preparingPayment")
                : t("placingOrder")
              : isBankTransfer
                ? t("continuePayment")
                : t("placeOrder")}
          </Button>
        </form>

        <OrderSummary
          className="lg:sticky lg:top-8"
          cartQuote={cartQuote}
          paymentMethod={paymentMethod}
        />
      </div>
    </div>
  );
}

export { CheckoutPageView };
