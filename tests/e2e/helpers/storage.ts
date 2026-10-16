import type { Page } from "@playwright/test";

/** Matches Zustand persist keys in cart.store / order.store. */
export const CART_STORAGE_KEY = "green-garden-cart";
export const LAST_ORDER_STORAGE_KEY = "green-garden-last-order";

/** Clear cart (localStorage) and last order (sessionStorage) before each run. */
export async function clearStorefrontStorage(page: Page) {
  await page.addInitScript(
    ({ cartKey, orderKey }) => {
      try {
        window.localStorage.removeItem(cartKey);
      } catch {
        // ignore
      }
      try {
        window.sessionStorage.removeItem(orderKey);
      } catch {
        // ignore
      }
    },
    { cartKey: CART_STORAGE_KEY, orderKey: LAST_ORDER_STORAGE_KEY },
  );
}

export async function clearStorefrontStorageNow(page: Page) {
  await page.evaluate(
    ({ cartKey, orderKey }) => {
      window.localStorage.removeItem(cartKey);
      window.sessionStorage.removeItem(orderKey);
    },
    { cartKey: CART_STORAGE_KEY, orderKey: LAST_ORDER_STORAGE_KEY },
  );
}
