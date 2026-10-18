import type { Page } from "@playwright/test";

import {
  CART_STORAGE_KEY,
  LAST_ORDER_STORAGE_KEY,
} from "@/lib/constants/storage";

export { CART_STORAGE_KEY, LAST_ORDER_STORAGE_KEY };

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
