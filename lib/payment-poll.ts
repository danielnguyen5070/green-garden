import type { PaymentStatus } from "@/types/order";

export const PAYMENT_POLL_INTERVAL_MS = 5000;
/** Stop asking once the customer has clearly left the page open and walked away. */
export const PAYMENT_MAX_POLL_DURATION_MS = 30 * 60 * 1000;

/**
 * Returns the next poll interval, or `false` to stop when paid or timed out.
 */
export function getPaymentRefetchInterval(
  status: PaymentStatus | undefined,
  startedAt: number,
  now = Date.now()
): number | false {
  if (status === "paid") return false;
  if (now - startedAt >= PAYMENT_MAX_POLL_DURATION_MS) return false;
  return PAYMENT_POLL_INTERVAL_MS;
}
