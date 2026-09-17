"use client";

import { useTranslations } from "next-intl";
import { TruckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CHECKOUT_FORM_FIELDS,
  type CheckoutFormErrors,
  type CheckoutFormField,
  type CheckoutFormValues,
} from "@/lib/checkout-form";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "h-[3.25rem] rounded-[10px] border-border bg-card px-4 text-sm text-foreground shadow-none md:text-sm";

const FIELD_PROPS: Record<
  CheckoutFormField,
  { autoComplete: string; type?: string; inputMode?: "tel" }
> = {
  name: { autoComplete: "name" },
  phone: { autoComplete: "tel", type: "tel", inputMode: "tel" },
  address: { autoComplete: "street-address" },
};

function ShippingDetails({
  values,
  errors,
  onChange,
  onBlur,
  className,
}: {
  values: CheckoutFormValues;
  errors: CheckoutFormErrors;
  onChange: (field: CheckoutFormField, value: string) => void;
  onBlur: (field: CheckoutFormField) => void;
  className?: string;
}) {
  const t = useTranslations("checkout.shippingDetails");

  return (
    <section
      data-slot="shipping-details"
      aria-labelledby="shipping-details-heading"
      className={cn(className)}
    >
      <div className="mb-5 flex items-center gap-2">
        <TruckIcon
          className="size-4 text-primary stroke-[1.5]"
          aria-hidden="true"
        />
        <h2
          id="shipping-details-heading"
          className="font-sans text-base font-semibold tracking-tight text-foreground"
        >
          {t("title")}
        </h2>
      </div>

      <div className="space-y-4">
        {CHECKOUT_FORM_FIELDS.map((field) => {
          const error = errors[field];
          const fieldId = `checkout-${field}`;
          const errorId = `${fieldId}-error`;

          return (
            <div key={field} className="space-y-2">
              <Label
                htmlFor={fieldId}
                className="text-sm font-medium text-foreground"
              >
                {t(field)}
              </Label>
              <Input
                id={fieldId}
                name={field}
                value={values[field]}
                onChange={(event) => onChange(field, event.target.value)}
                onBlur={() => onBlur(field)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={FIELD_CLASS}
                {...FIELD_PROPS[field]}
              />
              {error ? (
                <p
                  id={errorId}
                  role="alert"
                  className="font-sans text-small text-destructive"
                >
                  {t(`errors.${error}`)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { ShippingDetails };
