"use client";

import { useTranslations } from "next-intl";
import { TruckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHECKOUT_FORM_FIELDS,
  type CheckoutFormErrors,
  type CheckoutFormField,
  type CheckoutFormValues,
} from "@/lib/checkout-form";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "h-[3.25rem] rounded-[10px] border-border bg-card px-4 text-sm text-foreground shadow-none md:text-sm";

const NOTE_CLASS =
  "min-h-[5.5rem] rounded-[10px] border-border bg-card px-4 py-3 text-sm text-foreground shadow-none md:text-sm";

const FIELD_PROPS: Record<
  CheckoutFormField,
  {
    autoComplete: string;
    type?: string;
    inputMode?: "tel";
    maxLength: number;
    multiline?: true;
  }
> = {
  phone: {
    autoComplete: "tel",
    type: "tel",
    inputMode: "tel",
    maxLength: 32,
  },
  name: { autoComplete: "name", maxLength: 255 },
  address: { autoComplete: "street-address", maxLength: 1000 },
  note: { autoComplete: "off", maxLength: 1000, multiline: true },
};

function ShippingDetails({
  values,
  errors,
  disabled,
  onChange,
  onBlur,
  className,
}: {
  values: CheckoutFormValues;
  errors: CheckoutFormErrors;
  disabled?: boolean;
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
          const { multiline, ...fieldProps } = FIELD_PROPS[field];
          const error = errors[field];
          const fieldId = `checkout-${field}`;
          const errorId = `${fieldId}-error`;

          const sharedProps = {
            id: fieldId,
            name: field,
            value: values[field],
            disabled,
            "aria-invalid": error ? (true as const) : undefined,
            "aria-describedby": error ? errorId : undefined,
            onBlur: () => onBlur(field),
            ...fieldProps,
          };

          return (
            <div key={field} className="space-y-2">
              <Label
                htmlFor={fieldId}
                className="text-sm font-medium text-foreground"
              >
                {t(field)}
              </Label>
              {multiline ? (
                <Textarea
                  {...sharedProps}
                  rows={3}
                  placeholder={t("notePlaceholder")}
                  onChange={(event) => onChange(field, event.target.value)}
                  className={NOTE_CLASS}
                />
              ) : (
                <Input
                  {...sharedProps}
                  onChange={(event) => onChange(field, event.target.value)}
                  className={FIELD_CLASS}
                />
              )}
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
