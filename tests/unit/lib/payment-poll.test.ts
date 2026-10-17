import { describe, expect, it } from "vitest";
import {
  PAYMENT_MAX_POLL_DURATION_MS,
  PAYMENT_POLL_INTERVAL_MS,
  getPaymentRefetchInterval,
} from "@/lib/payment-poll";

describe("getPaymentRefetchInterval", () => {
  it("stops when payment is paid", () => {
    expect(getPaymentRefetchInterval("paid", Date.now())).toBe(false);
  });

  it("stops after the max poll duration", () => {
    const startedAt = 1_000;
    expect(
      getPaymentRefetchInterval(
        "pending",
        startedAt,
        startedAt + PAYMENT_MAX_POLL_DURATION_MS
      )
    ).toBe(false);
  });

  it("continues polling while pending within the window", () => {
    const startedAt = 1_000;
    expect(
      getPaymentRefetchInterval(
        "pending",
        startedAt,
        startedAt + PAYMENT_POLL_INTERVAL_MS
      )
    ).toBe(PAYMENT_POLL_INTERVAL_MS);
  });
});
