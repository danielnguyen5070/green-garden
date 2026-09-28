"use client";

import { useCallback, useEffect, useMemo } from "react";
import { getCartQuoteKey, useCartQuoteStore } from "@/store/cart-quote.store";
import { useCartStore } from "@/store/cart.store";
import type { StorefrontQuoteLine, StorefrontQuoteResponse } from "@/types/storefront";

export type UseCartQuoteResult = {
  /** Latest backend pricing; while re-pricing it may describe the previous cart. */
  quote: StorefrontQuoteResponse | null;
  /** Quote line for a cart line id, when the quote covers that line. */
  lineFor: (lineId: string) => StorefrontQuoteLine | undefined;
  /** `quote` does not match the current cart yet. */
  isStale: boolean;
  isLoading: boolean;
  hasError: boolean;
  /** Every line can be sold in the requested quantity. */
  isOrderable: boolean;
  retry: () => void;
};

/**
 * Prices the persisted cart through `POST /storefront/orders/quote`. The cart
 * holds only plant, pot size and quantity, so every name, image, price,
 * shipping fee and total shown next to it comes from here — the same numbers
 * checkout will charge.
 */
export function useCartQuote(): UseCartQuoteResult {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const key = useMemo(() => getCartQuoteKey(items), [items]);

  const request = useCartQuoteStore((state) => state.request);
  const retryQuote = useCartQuoteStore((state) => state.retry);
  const status = useCartQuoteStore((state) => state.status);
  const requestedKey = useCartQuoteStore((state) => state.requestedKey);
  const quote = useCartQuoteStore((state) => state.quote);
  const quoteKey = useCartQuoteStore((state) => state.quoteKey);
  const quoteLineIds = useCartQuoteStore((state) => state.quoteLineIds);

  useEffect(() => {
    if (!hasHydrated || items.length === 0) return;
    request(key, items);
    // `key` changes whenever the lines or quantities do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, key, request]);

  const linesById = useMemo(() => {
    const map = new Map<string, StorefrontQuoteLine>();
    quote?.lines.forEach((line, index) => {
      const lineId = quoteLineIds[index];
      if (lineId) map.set(lineId, line);
    });
    return map;
  }, [quote, quoteLineIds]);

  const lineFor = useCallback((lineId: string) => linesById.get(lineId), [linesById]);

  const retry = useCallback(() => retryQuote(key, items), [retryQuote, key, items]);

  const isEmpty = items.length === 0;
  const isStale = !isEmpty && quoteKey !== key;
  const isCurrentRequest = requestedKey === key;
  const hasError = !isEmpty && isCurrentRequest && status === "error";
  const isLoading = !isEmpty && (!hasHydrated || (isStale && !hasError));

  const isOrderable =
    !isEmpty &&
    !isStale &&
    quote !== null &&
    quote.lines.every((line) => line.available && line.quantity <= line.max_quantity);

  return {
    quote: isEmpty ? null : quote,
    lineFor,
    isStale,
    isLoading,
    hasError,
    isOrderable,
    retry,
  };
}
