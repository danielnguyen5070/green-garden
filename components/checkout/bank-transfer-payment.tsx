"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2Icon, CopyIcon, LoaderCircleIcon } from "lucide-react";
import { getStorefrontOrderPayment } from "@/lib/api/storefront";
import {
  getPaymentRefetchInterval,
} from "@/lib/payment-poll";
import { queryKeys } from "@/lib/query/keys";
import { formatStorefrontPrice } from "@/lib/storefront";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/order";
import type { StorefrontBankTransferInfo } from "@/types/storefront";

function useLivePaymentStatus(orderId: string, initial: PaymentStatus) {
  const startedAtRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: queryKeys.payment.status(orderId),
    queryFn: async ({ signal }) => {
      const result = await getStorefrontOrderPayment(orderId, { signal });
      return result.payment_status;
    },
    initialData: initial,
    enabled: initial !== "paid" && orderId.length > 0,
    refetchInterval: (queryState) => {
      startedAtRef.current ??= Date.now();
      return getPaymentRefetchInterval(
        queryState.state.data ?? initial,
        startedAtRef.current
      );
    },
    refetchIntervalInBackground: false,
    retry: false,
  });

  return query.data ?? initial;
}

function CopyableRow({
  label,
  value,
  copyValue,
  emphasize,
}: {
  label: string;
  value: string;
  copyValue?: string;
  emphasize?: boolean;
}) {
  const t = useTranslations("orderSuccess.bankTransfer");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-sans text-small text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "truncate font-sans text-sm tabular-nums text-foreground",
            emphasize ? "font-bold" : "font-semibold",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("copy", { field: label })}
        >
          <CopyIcon className="size-3.5" aria-hidden="true" />
        </button>
      </dd>
    </div>
  );
}

function BankTransferPayment({
  orderId,
  payment,
  initialStatus,
  onPaid,
}: {
  orderId: string;
  payment: StorefrontBankTransferInfo;
  initialStatus: PaymentStatus;
  onPaid?: () => void;
}) {
  const t = useTranslations("orderSuccess.bankTransfer");
  const locale = useLocale();
  const status = useLivePaymentStatus(orderId, initialStatus);
  const amountDigits = String(Math.round(Number(payment.amount)));

  useEffect(() => {
    if (status === "paid") onPaid?.();
  }, [status, onPaid]);

  if (status === "paid") {
    return (
      <div
        className="mt-5 flex gap-2.5 rounded-xl border border-primary/30 bg-secondary/60 px-3.5 py-3 text-left"
        role="status"
      >
        <CheckCircle2Icon
          className="mt-0.5 size-4 shrink-0 text-primary stroke-[1.75]"
          aria-hidden="true"
        />
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">
            {t("paidTitle")}
          </p>
          <p className="mt-0.5 font-sans text-[0.75rem] leading-relaxed text-muted-foreground">
            {t("paidDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      data-slot="bank-transfer-payment"
      aria-labelledby="bank-transfer-heading"
      className="mt-5 rounded-2xl border border-border/80 bg-card p-5 text-left shadow-subtle sm:p-6"
    >
      <h2
        id="bank-transfer-heading"
        className="font-sans text-base font-semibold tracking-tight text-foreground"
      >
        {t("title")}
      </h2>
      <p className="mt-1 font-sans text-small text-muted-foreground">
        {t("description")}
      </p>

      <div className="mt-5 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- VietQR image is generated on demand by qr.sepay.vn, not a configured next/image host */}
        <img
          src={payment.qr_url}
          alt={t("qrAlt")}
          width={280}
          height={340}
          className="h-auto w-full max-w-[280px] rounded-xl border border-border bg-white"
        />
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-sans text-small text-muted-foreground">
            {t("bank")}
          </dt>
          <dd className="text-right font-sans text-sm font-semibold text-foreground">
            {payment.bank_name}
          </dd>
        </div>
        {payment.account_holder ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-sans text-small text-muted-foreground">
              {t("accountHolder")}
            </dt>
            <dd className="text-right font-sans text-sm font-semibold text-foreground">
              {payment.account_holder}
            </dd>
          </div>
        ) : null}
        <CopyableRow label={t("accountNumber")} value={payment.account_number} />
        <CopyableRow
          label={t("amount")}
          value={formatStorefrontPrice(payment.amount, locale)}
          copyValue={amountDigits}
          emphasize
        />
        <CopyableRow label={t("reference")} value={payment.reference} emphasize />
      </dl>

      <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 font-sans text-[0.75rem] leading-relaxed text-foreground">
        {t("referenceWarning", { reference: payment.reference })}
      </p>

      <p
        className="mt-4 flex items-center gap-2 font-sans text-small text-muted-foreground"
        role="status"
      >
        <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
        {t("waiting")}
      </p>
    </section>
  );
}

export { BankTransferPayment };
