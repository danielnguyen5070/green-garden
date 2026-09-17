import type { CartItem } from "@/types/cart";

export type CartCurrency = "USD" | "VND";

/**
 * Cart amounts are already in the locale's currency (see `formatCartMoney`),
 * so the free-shipping rule has to be expressed per currency rather than as a
 * single number.
 */
export const SHIPPING_RULES: Record<
  CartCurrency,
  {
    /** Subtotal at or above this unlocks free shipping. */
    threshold: number;
    /** Flat fee charged below the threshold. */
    fee: number;
  }
> = {
  USD: { threshold: 20, fee: 8 },
  VND: { threshold: 500_000, fee: 50_000 },
};

export function getCartCurrency(locale = "en-US"): CartCurrency {
  return locale.startsWith("vi") ? "VND" : "USD";
}

export function getFreeShippingThreshold(locale?: string) {
  return SHIPPING_RULES[getCartCurrency(locale)].threshold;
}

export function getCartTotalItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartShipping(subtotal: number, locale?: string) {
  if (subtotal <= 0) return 0;
  const { threshold, fee } = SHIPPING_RULES[getCartCurrency(locale)];
  return subtotal >= threshold ? 0 : fee;
}

export function getCartTotal(subtotal: number, shipping: number) {
  return subtotal + shipping;
}

export function getAmountToFreeShipping(subtotal: number, locale?: string) {
  return Math.max(0, getFreeShippingThreshold(locale) - subtotal);
}

export function hasFreeShipping(subtotal: number, locale?: string) {
  return subtotal > 0 && subtotal >= getFreeShippingThreshold(locale);
}

/**
 * Prices are stored in the currency the backend sends for the active locale
 * (`price` is USD, `price_vi` is VND), so the currency follows the locale
 * rather than being converted here.
 */
export function formatCartMoney(amount: number, locale = "en-US") {
  const currency = getCartCurrency(locale);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}
