import type { CartItem } from "@/types/cart";

/** Identifies a cart state; lines are priced in cart order. */
export function getCartQuoteKey(items: CartItem[]): string {
  return items.map((item) => `${item.id}:${item.quantity}`).join("|");
}
