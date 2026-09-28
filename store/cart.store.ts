"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartPlantInput } from "@/types/cart";
import { getCartLineId } from "@/types/cart";
import { getCartTotalItems } from "@/lib/cart";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  addItem: (plant: CartPlantInput) => void;
  removeItem: (lineId: string) => void;
  increaseQuantity: (lineId: string) => void;
  decreaseQuantity: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setHasHydrated: (value: boolean) => void;
  totalItems: () => number;
};

const CART_STORAGE_VERSION = 1;

/**
 * Version 0 lines also stored a name, image and a bare `price` in whichever
 * currency the locale showed. Only the selection survives; lines that end up
 * identical are merged.
 */
function migrateCartItems(persisted: unknown): CartItem[] {
  const rawItems =
    persisted && typeof persisted === "object" && "items" in persisted
      ? (persisted as { items: unknown }).items
      : [];
  if (!Array.isArray(rawItems)) return [];

  const merged = new Map<string, CartItem>();
  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const { plantId, potSizeId, quantity } = raw as Record<string, unknown>;
    if (typeof plantId !== "string" || !plantId) continue;

    const line = {
      plantId,
      potSizeId: typeof potSizeId === "string" && potSizeId ? potSizeId : undefined,
    };
    const id = getCartLineId(line);
    const count = Math.max(1, Math.floor(Number(quantity) || 1));
    const existing = merged.get(id);
    merged.set(id, {
      id,
      ...line,
      quantity: (existing?.quantity ?? 0) + count,
    });
  }
  return [...merged.values()];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (plant) => {
        const quantity = Math.max(1, Math.floor(plant.quantity ?? 1));
        const lineId = getCartLineId(plant);

        set((state) => {
          const existing = state.items.find((item) => item.id === lineId);

          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((item) =>
                item.id === lineId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          const nextItem: CartItem = {
            id: lineId,
            plantId: plant.plantId,
            potSizeId: plant.potSizeId,
            quantity,
          };

          return {
            isOpen: true,
            items: [...state.items, nextItem],
          };
        });
      },

      removeItem: (lineId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== lineId),
        }));
      },

      increaseQuantity: (lineId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === lineId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }));
      },

      decreaseQuantity: (lineId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== lineId) return item;
            return { ...item, quantity: Math.max(1, item.quantity - 1) };
          }),
        }));
      },

      updateQuantity: (lineId, quantity) => {
        const nextQuantity = Math.floor(quantity);

        if (nextQuantity < 1) {
          get().removeItem(lineId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === lineId ? { ...item, quantity: nextQuantity } : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),

      totalItems: () => getCartTotalItems(get().items),
    }),
    {
      name: "green-garden-cart",
      version: CART_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted) => ({ items: migrateCartItems(persisted) }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
