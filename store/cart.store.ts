"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartPlantInput } from "@/types/cart";
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
  removeItem: (plantId: string) => void;
  increaseQuantity: (plantId: string) => void;
  decreaseQuantity: (plantId: string) => void;
  updateQuantity: (plantId: string, quantity: number) => void;
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
        set((state) => {
          const existing = state.items.find(
            (item) => item.plantId === plant.id,
          );

          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((item) =>
                item.plantId === plant.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          const nextItem: CartItem = {
            id: plant.id,
            plantId: plant.id,
            name: plant.name,
            slug: plant.slug,
            image: plant.image,
            price: plant.price,
            quantity: 1,
            description: plant.description,
          };

          return {
            isOpen: true,
            items: [...state.items, nextItem],
          };
        });
      },

      removeItem: (plantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.plantId !== plantId),
        }));
      },

      increaseQuantity: (plantId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.plantId === plantId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }));
      },

      decreaseQuantity: (plantId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.plantId !== plantId) return item;
            return { ...item, quantity: Math.max(1, item.quantity - 1) };
          }),
        }));
      },

      updateQuantity: (plantId, quantity) => {
        const nextQuantity = Math.floor(quantity);

        if (nextQuantity < 1) {
          get().removeItem(plantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.plantId === plantId
              ? { ...item, quantity: nextQuantity }
              : item,
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
