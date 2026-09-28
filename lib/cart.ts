import type { CartItem } from "@/types/cart";

/**
 * VND is the only transaction currency. Prices, shipping and totals come from
 * the backend (catalogue and cart quote); this module only formats them.
 */
export const CART_CURRENCY = "VND";

export function getCartTotalItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Money is carried as decimal strings and only parsed at the display edge. */
export function parseMoney(value: string | number | null | undefined): number {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * Always VND, with no decimals. `locale` only picks the digit grouping and
 * symbol placement: "350.000 ₫" on `/vi`, "₫350,000" on `/en`.
 */
export function formatVnd(
  amount: string | number,
  locale: string = "vi-VN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CART_CURRENCY,
    maximumFractionDigits: 0,
  }).format(parseMoney(amount));
}
