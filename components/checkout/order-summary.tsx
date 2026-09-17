"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { formatCartMoney } from "@/lib/cart";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/lib/utils";

function OrderSummary({ className }: { className?: string }) {
  const t = useTranslations("checkout.orderSummary");
  const locale = useLocale();
  const moneyLocale = locale === "vi" ? "vi-VN" : "en-US";

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const shipping = useCartStore((state) => state.shipping(moneyLocale));
  const total = useCartStore((state) => state.total(moneyLocale));

  return (
    <aside
      data-slot="order-summary"
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 shadow-subtle sm:p-6",
        className,
      )}
    >
      <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
        {t("title")}
      </h2>

      {!hasHydrated ? (
        <div className="mt-5 space-y-5" aria-hidden="true">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-3.5">
              <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="font-sans text-sm font-semibold text-foreground">
            {t("empty")}
          </p>
          <Link
            href="/"
            className="mt-2 inline-block font-sans text-small font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("shopPlants")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-5">
            {items.map((item) => {
              const variant = [item.potSizeLabel, item.potColorLabel]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={item.id} className="flex gap-3.5">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-16">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-semibold text-foreground">
                          {item.name}
                        </p>
                        {variant ? (
                          <p className="mt-0.5 font-sans text-small text-muted-foreground">
                            {variant}
                          </p>
                        ) : null}
                        <p className="mt-1 font-sans text-small text-muted-foreground">
                          {t("qty", { count: item.quantity })}
                        </p>
                      </div>
                      <p className="shrink-0 font-sans text-sm font-semibold text-primary">
                        {formatCartMoney(item.price * item.quantity, moneyLocale)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 space-y-2.5 border-t border-border pt-5 font-sans text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t("subtotal")}</dt>
              <dd className="tabular-nums text-foreground">
                {formatCartMoney(subtotal, moneyLocale)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t("shipping")}</dt>
              <dd
                className={
                  shipping === 0
                    ? "font-medium text-primary"
                    : "tabular-nums text-foreground"
                }
              >
                {shipping === 0
                  ? t("free")
                  : formatCartMoney(shipping, moneyLocale)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <dt className="text-base font-semibold text-foreground">
                {t("total")}
              </dt>
              <dd className="text-lg font-bold tabular-nums text-foreground">
                {formatCartMoney(total, moneyLocale)}
              </dd>
            </div>
          </dl>
        </>
      )}

      <div className="mt-5 flex gap-2.5 rounded-xl border border-primary/15 bg-secondary/60 px-3.5 py-3">
        <ShieldCheckIcon
          className="mt-0.5 size-4 shrink-0 text-primary stroke-[1.5]"
          aria-hidden="true"
        />
        <p className="font-sans text-[0.75rem] leading-relaxed text-muted-foreground">
          {t("secureNotice")}
        </p>
      </div>
    </aside>
  );
}

export { OrderSummary };
