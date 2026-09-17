"use client";

import { useLocale, useTranslations } from "next-intl";
import { TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCartMoney } from "@/lib/cart";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "@/i18n/navigation";

function CartSummary() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  const subtotal = useCartStore((state) => state.subtotal());
  const shipping = useCartStore((state) => state.shipping(moneyLocale));
  const total = useCartStore((state) => state.total(moneyLocale));
  const freeShippingUnlocked = useCartStore((state) =>
    state.freeShippingUnlocked(moneyLocale),
  );
  const amountToFreeShipping = useCartStore((state) =>
    state.amountToFreeShipping(moneyLocale),
  );

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      data-slot="cart-summary"
      className="shrink-0 border-t border-border bg-card px-5 pt-4 pb-5 sm:px-6"
    >
      <div
        className={`mb-4 rounded-xl border px-3.5 py-3 ${
          freeShippingUnlocked
            ? "border-primary/20 bg-secondary/60"
            : "border-border bg-muted/70"
        }`}
      >
        <div className="flex gap-2.5">
          <TruckIcon
            className={`mt-0.5 size-4 shrink-0 stroke-[1.5] ${
              freeShippingUnlocked ? "text-primary" : "text-muted-foreground"
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold text-foreground">
              {freeShippingUnlocked
                ? t("freeShippingUnlocked")
                : t("freeShipping")}
            </p>
            <p className="mt-0.5 font-sans text-small text-muted-foreground">
              {freeShippingUnlocked
                ? t("freeShippingDescription")
                : t("addMoreForFreeShipping", {
                    amount: formatCartMoney(amountToFreeShipping, moneyLocale),
                  })}
            </p>
          </div>
        </div>
      </div>

      <dl className="space-y-2 font-sans text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("subtotal")}</dt>
          <dd className="tabular-nums text-muted-foreground">
            {formatCartMoney(subtotal, moneyLocale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("shipping")}</dt>
          <dd
            className={
              shipping === 0
                ? "font-medium text-primary"
                : "tabular-nums text-muted-foreground"
            }
          >
            {shipping === 0
              ? t("free")
              : formatCartMoney(shipping, moneyLocale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <dt className="text-base font-semibold text-foreground">
            {t("total")}
          </dt>
          <dd className="text-lg font-bold tabular-nums text-primary">
            {formatCartMoney(total, moneyLocale)}
          </dd>
        </div>
      </dl>

      <Button
        type="button"
        size="lg"
        className="mt-4 h-11 w-full rounded-xl font-sans text-sm font-semibold"
        onClick={handleCheckout}
      >
        {t("checkout")}
      </Button>

      <p className="mt-3 text-center font-sans text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
        {t("secureCheckout")}
      </p>
    </div>
  );
}

export { CartSummary };
