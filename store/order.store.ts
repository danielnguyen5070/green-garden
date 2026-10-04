"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StorefrontOrderResponse } from "@/types/storefront";

/** The backend confirmation is the only source of the amounts shown. */
export type PlacedOrder = {
  order: StorefrontOrderResponse;
};

/**
 * Holds the confirmation returned by the checkout POST so the success page can
 * show it. Session storage keeps it across a refresh without outliving the tab,
 * and nothing here identifies the customer beyond the order they just placed.
 */
type LastOrderState = {
  order: PlacedOrder | null;
  hasHydrated: boolean;
  setOrder: (order: PlacedOrder) => void;
  clearOrder: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useLastOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({
      order: null,
      hasHydrated: false,

      setOrder: (order) => set({ order }),
      clearOrder: () => set({ order: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "green-garden-last-order",
      // Version 0 carried a client-side total with no subtotal or shipping;
      // version 1 had no payment method or bank-transfer details.
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ order: state.order }),
      migrate: () => ({ order: null }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
