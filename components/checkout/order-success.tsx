"use client";

import { useTranslations } from "next-intl";
import { CheckIcon, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { formatCartMoney } from "@/lib/cart";
import { useLastOrderStore } from "@/store/order.store";

function OrderSuccess() {
  const t = useTranslations("orderSuccess");

  const placed = useLastOrderStore((state) => state.order);
  const hasHydrated = useLastOrderStore((state) => state.hasHydrated);

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-xl text-center">
        {!hasHydrated ? (
          <div className="space-y-4" aria-hidden="true">
            <Skeleton className="mx-auto size-14 rounded-full" />
            <Skeleton className="mx-auto h-8 w-2/3" />
            <Skeleton className="mx-auto h-4 w-5/6" />
            <Skeleton className="mx-auto h-32 w-full rounded-2xl" />
          </div>
        ) : !placed ? (
          <>
            <h1 className="font-heading text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[2.5rem]">
              {t("missingTitle")}
            </h1>
            <p className="mt-3 font-sans text-body text-muted-foreground">
              {t("missingDescription")}
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 rounded-xl px-6 font-sans text-sm font-semibold"
              render={<Link href="/" />}
              nativeButton={false}
            >
              {t("continueShopping")}
            </Button>
          </>
        ) : (
          <>
            <span
              className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <CheckIcon className="size-7 text-primary stroke-[2.5]" />
            </span>

            <h1 className="mt-5 font-heading text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[2.5rem]">
              {t("title")}
            </h1>
            <p className="mt-3 font-sans text-body text-muted-foreground">
              {t("description")}
            </p>

            <dl className="mt-8 space-y-3 rounded-2xl border border-border/80 bg-card p-5 text-left shadow-subtle sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <dt className="font-sans text-small text-muted-foreground">
                  {t("orderNumber")}
                </dt>
                <dd className="font-sans text-sm font-semibold tracking-tight text-foreground">
                  {placed.order.order_number}
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <dt className="font-sans text-small text-muted-foreground">
                  {t("status")}
                </dt>
                <dd className="font-sans text-sm font-semibold text-primary">
                  {t(`statuses.${placed.order.status}`)}
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-3">
                <dt className="font-sans text-sm font-semibold text-foreground">
                  {t("total")}
                </dt>
                <dd className="font-sans text-lg font-bold tabular-nums text-foreground">
                  {formatCartMoney(placed.total, placed.moneyLocale)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex gap-2.5 rounded-xl border border-primary/15 bg-secondary/60 px-3.5 py-3 text-left">
              <WalletIcon
                className="mt-0.5 size-4 shrink-0 text-primary stroke-[1.5]"
                aria-hidden="true"
              />
              <p className="font-sans text-[0.75rem] leading-relaxed text-muted-foreground">
                {t("codNotice")}
              </p>
            </div>

            <Button
              size="lg"
              className="mt-8 h-12 rounded-xl px-6 font-sans text-sm font-semibold"
              render={<Link href="/" />}
              nativeButton={false}
            >
              {t("continueShopping")}
            </Button>
          </>
        )}
      </div>
    </Container>
  );
}

export { OrderSuccess };
