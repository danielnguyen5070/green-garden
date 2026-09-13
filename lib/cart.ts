import type { CartItem } from "@/types/cart";

/** Subtotal at or above this amount unlocks free shipping. */
export const FREE_SHIPPING_THRESHOLD = 50;

/** Flat shipping fee when the free-shipping threshold is not met. */
export const SHIPPING_FEE = 8;

export function getCartTotalItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartShipping(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function getCartTotal(subtotal: number, shipping: number) {
  return subtotal + shipping;
}

export function getAmountToFreeShipping(subtotal: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

export function hasFreeShipping(subtotal: number) {
  return subtotal > 0 && subtotal >= FREE_SHIPPING_THRESHOLD;
}

export function formatCartMoney(amount: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
