"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartPlantInput } from "@/types/cart";
import { getCartLineId } from "@/types/cart";
import {
  getAmountToFreeShipping,
  getCartShipping,
  getCartSubtotal,
  getCartTotal,
  getCartTotalItems,
  hasFreeShipping,
} from "@/lib/cart";

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
  subtotal: () => number;
  shipping: () => number;
  total: () => number;
  freeShippingUnlocked: () => boolean;
  amountToFreeShipping: () => number;
};

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
            plantId: plant.id,
            name: plant.name,
            slug: plant.slug,
            image: plant.image,
            price: plant.price,
            quantity,
            description: plant.description,
            potSizeId: plant.potSizeId,
            potSizeLabel: plant.potSizeLabel,
            potColorId: plant.potColorId,
            potColorLabel: plant.potColorLabel,
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
      subtotal: () => getCartSubtotal(get().items),
      shipping: () => getCartShipping(getCartSubtotal(get().items)),
      total: () => {
        const subtotal = getCartSubtotal(get().items);
        return getCartTotal(subtotal, getCartShipping(subtotal));
      },
      freeShippingUnlocked: () => hasFreeShipping(getCartSubtotal(get().items)),
      amountToFreeShipping: () =>
        getAmountToFreeShipping(getCartSubtotal(get().items)),
    }),
    {
      name: "green-garden-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
