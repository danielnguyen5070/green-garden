"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCartQuoteKey } from "@/lib/cart-quote";
import { quoteStorefrontCart } from "@/lib/api/storefront";
import { queryKeys } from "@/lib/query/keys";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/types/cart";
import type { StorefrontQuoteLine, StorefrontQuoteResponse } from "@/types/storefront";

/** Quantity taps settle before the cart is re-priced. */
const QUOTE_DEBOUNCE_MS = 250;

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

type QuoteResult = {
  quote: StorefrontQuoteResponse;
  lineIds: string[];
  key: string;
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

  const [debounced, setDebounced] = useState<{
    key: string;
    items: CartItem[];
  }>(() => ({ key, items }));

  useEffect(() => {
    if (!hasHydrated || items.length === 0) return;
    if (debounced.key === key) return;

    const timer = setTimeout(() => {
      setDebounced({ key, items });
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [hasHydrated, key, items, debounced.key]);

  const query = useQuery({
    queryKey: queryKeys.cart.quote(debounced.key),
    queryFn: async ({ signal }): Promise<QuoteResult> => {
      const quote = await quoteStorefrontCart(
        {
          items: debounced.items.map((item) => ({
            plant_id: item.plantId,
            quantity: item.quantity,
          })),
        },
        { signal }
      );
      return {
        quote,
        lineIds: debounced.items.map((item) => item.id),
        key: debounced.key,
      };
    },
    enabled:
      hasHydrated && items.length > 0 && debounced.key.length > 0,
    placeholderData: keepPreviousData,
  });

  const quoteResult = query.data;
  const quote = quoteResult?.quote ?? null;
  const quoteKey = quoteResult?.key ?? null;

  const linesById = useMemo(() => {
    const map = new Map<string, StorefrontQuoteLine>();
    const lineIds = quoteResult?.lineIds ?? [];
    quote?.lines.forEach((line, index) => {
      const lineId = lineIds[index];
      if (lineId) map.set(lineId, line);
    });
    return map;
  }, [quote, quoteResult?.lineIds]);

  const lineFor = useCallback(
    (lineId: string) => linesById.get(lineId),
    [linesById]
  );

  const retry = useCallback(() => {
    void query.refetch();
  }, [query]);

  const isEmpty = items.length === 0;
  const isStale = !isEmpty && quoteKey !== key;
  const hasError = !isEmpty && debounced.key === key && query.isError;
  const isLoading =
    !isEmpty &&
    (!hasHydrated ||
      (isStale && !hasError) ||
      (query.isFetching && quoteKey !== key));

  const isOrderable =
    !isEmpty &&
    !isStale &&
    quote !== null &&
    quote.lines.every(
      (line) => line.available && line.quantity <= line.max_quantity
    );

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

export { getCartQuoteKey };
