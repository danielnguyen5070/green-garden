import type { CartItem } from "@/types/cart";

export type CheckoutShippingMethodId = "standard" | "express";

export type CheckoutShippingMethod = {
  id: CheckoutShippingMethodId;
  price: number;
  etaKey: "standardEta" | "expressEta";
  nameKey: "standard" | "express";
};

export const CHECKOUT_SHIPPING_METHODS: CheckoutShippingMethod[] = [
  {
    id: "standard",
    price: 0,
    nameKey: "standard",
    etaKey: "standardEta",
  },
  {
    id: "express",
    price: 12,
    nameKey: "express",
    etaKey: "expressEta",
  },
];

/** Visual mock line items matching the checkout reference. */
export const CHECKOUT_MOCK_ITEMS: CartItem[] = [
  {
    id: "mock-bird",
    plantId: "plant-011",
    name: "Bird of Paradise",
    slug: "bird-of-paradise",
    image: "/images/plants/placeholder.svg",
    price: 65,
    quantity: 1,
    description: "Tropical drama • Bright light",
    potSizeLabel: "Large",
    potColorLabel: "Ceramic Pot",
  },
  {
    id: "mock-monstera",
    plantId: "plant-004",
    name: "Monstera Deliciosa",
    slug: "monstera-deliciosa",
    image: "/images/plants/placeholder.svg",
    price: 45,
    quantity: 1,
    description: "Statement foliage • Fast growing",
    potSizeLabel: "Medium",
    potColorLabel: "Terracotta",
  },
];

export const CHECKOUT_TAX_RATE = 0.08;

export function getCheckoutSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCheckoutTax(subtotal: number) {
  return Math.round(subtotal * CHECKOUT_TAX_RATE * 100) / 100;
}

export function getCheckoutTotal(
  subtotal: number,
  shipping: number,
  tax: number,
) {
  return subtotal + shipping + tax;
}
