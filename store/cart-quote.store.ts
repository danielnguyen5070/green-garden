"use client";

import { create } from "zustand";
import { quoteStorefrontCart } from "@/lib/api/storefront";
import type { CartItem } from "@/types/cart";
import type { StorefrontQuoteResponse } from "@/types/storefront";

/** Quantity taps settle before the cart is re-priced. */
const QUOTE_DEBOUNCE_MS = 250;

export type CartQuoteStatus = "idle" | "loading" | "ready" | "error";

type CartQuoteState = {
  /** Cart the current request (or error) belongs to. */
  requestedKey: string | null;
  status: CartQuoteStatus;
  /** Last successful quote; may describe an older cart while re-pricing. */
  quote: StorefrontQuoteResponse | null;
  quoteKey: string | null;
  /** Cart line ids in the order the quote's lines were requested. */
  quoteLineIds: string[];
  request: (key: string, items: CartItem[]) => void;
  retry: (key: string, items: CartItem[]) => void;
};

/** Identifies a cart state; lines are priced in cart order. */
export function getCartQuoteKey(items: CartItem[]): string {
  return items.map((item) => `${item.id}:${item.quantity}`).join("|");
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: AbortController | null = null;

export const useCartQuoteStore = create<CartQuoteState>()((set, get) => {
  function schedule(key: string, items: CartItem[]) {
    if (debounceTimer) clearTimeout(debounceTimer);
    inFlight?.abort();
    set({ requestedKey: key, status: "loading" });

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const controller = new AbortController();
      inFlight = controller;

      quoteStorefrontCart(
        {
          items: items.map((item) => ({
            plant_id: item.plantId,
            quantity: item.quantity,
            pot_size_id: item.potSizeId ?? null,
          })),
        },
        { signal: controller.signal }
      )
        .then((quote) => {
          if (controller.signal.aborted || get().requestedKey !== key) return;
          set({
            status: "ready",
            quote,
            quoteKey: key,
            quoteLineIds: items.map((item) => item.id),
          });
        })
        .catch(() => {
          if (controller.signal.aborted || get().requestedKey !== key) return;
          set({ status: "error" });
        })
        .finally(() => {
          if (inFlight === controller) inFlight = null;
        });
    }, QUOTE_DEBOUNCE_MS);
  }

  return {
    requestedKey: null,
    status: "idle",
    quote: null,
    quoteKey: null,
    quoteLineIds: [],

    request: (key, items) => {
      const { requestedKey, status } = get();
      // Every component showing the cart asks; only a new cart state re-prices.
      if (requestedKey === key && status !== "error") return;
      schedule(key, items);
    },

    retry: (key, items) => schedule(key, items),
  };
});
