"use client";

import { useTranslations } from "next-intl";
import { TruckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "h-[3.25rem] rounded-[10px] border-border bg-card px-4 text-sm text-foreground shadow-none md:text-sm";

function ShippingDetails({ className }: { className?: string }) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkout-first-name" className="text-sm font-medium text-foreground">
              {t("firstName")}
            </Label>
            <Input
              id="checkout-first-name"
              name="firstName"
              autoComplete="given-name"
              defaultValue="MD.ABDUL"
              className={FIELD_CLASS}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-last-name" className="text-sm font-medium text-foreground">
              {t("lastName")}
            </Label>
            <Input
              id="checkout-last-name"
              name="lastName"
              autoComplete="family-name"
              defaultValue="ASIF"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-address" className="text-sm font-medium text-foreground">
            {t("address")}
          </Label>
          <Input
            id="checkout-address"
            name="address1"
            autoComplete="address-line1"
            defaultValue="123 Plant Lane"
            className={FIELD_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkout-city" className="text-sm font-medium text-foreground">
              {t("city")}
            </Label>
            <Input
              id="checkout-city"
              name="city"
              autoComplete="address-level2"
              defaultValue="Greenwich"
              className={FIELD_CLASS}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-postal" className="text-sm font-medium text-foreground">
              {t("postalCode")}
            </Label>
            <Input
              id="checkout-postal"
              name="postalCode"
              autoComplete="postal-code"
              defaultValue="SW1A 1AA"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-email" className="text-sm font-medium text-foreground">
            {t("email")}
          </Label>
          <Input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue="john@example.com"
            className={FIELD_CLASS}
          />
        </div>
      </div>
    </section>
  );
}

export { ShippingDetails };
