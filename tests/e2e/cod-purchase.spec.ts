import { expect, test } from "@playwright/test";
import { waitForApiAndResolvePlant } from "./helpers/api";
import { getCheckoutFixtures } from "./helpers/env";
import {
  clearStorefrontStorage,
  clearStorefrontStorageNow,
} from "./helpers/storage";

test.describe.configure({ mode: "serial" });

test.describe("COD purchase flow", () => {
  let plantSlug: string;

  test.beforeAll(async () => {
    const resolved = await waitForApiAndResolvePlant();
    plantSlug = resolved.plantSlug;
  });

  test.beforeEach(async ({ page }) => {
    await clearStorefrontStorage(page);
  });

  test.afterEach(async ({ page }) => {
    await clearStorefrontStorageNow(page).catch(() => {
      // Page may already be closed after a hard failure.
    });
  });

  test("browses plants, adds to cart, and completes COD checkout", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const checkout = getCheckoutFixtures();

    await page.goto("/vi/plants");
    await expect(page.locator('[data-slot="plant-card"]').first()).toBeVisible({
      timeout: 30_000,
    });

    await page.goto(`/vi/plants/${plantSlug}`);
    await expect(page.locator('[data-slot="plant-detail"]')).toBeVisible({
      timeout: 30_000,
    });

    const addToCart = page.getByTestId("add-to-cart");
    await expect(addToCart).toBeEnabled();
    await addToCart.click();

    const cartCheckout = page.getByTestId("cart-checkout");
    await expect(cartCheckout).toBeVisible({ timeout: 15_000 });
    // Quote must finish loading so checkout stays orderable.
    await expect(page.locator('[data-slot="cart-summary"]')).toBeVisible();
    await cartCheckout.click();

    await expect(page).toHaveURL(/\/vi\/checkout\/?$/);
    await expect(page.locator('[data-slot="checkout-page"]')).toBeVisible();

    // Bot protection rejects submissions faster than 3s (form_elapsed_ms).
    const checkoutReadyAt = Date.now();

    await page.locator("#checkout-phone").fill(checkout.phone);
    await page.locator("#checkout-name").fill(checkout.name);
    await page.locator("#checkout-address").fill(checkout.address);

    // COD is the default payment method; leave the honeypot empty.
    await expect(
      page.locator('input[name="payment-method"][value="cod"]'),
    ).toBeChecked();

    const placeOrder = page.getByTestId("place-order");
    await expect(placeOrder).toBeEnabled({ timeout: 30_000 });

    const remainingMs = 3_500 - (Date.now() - checkoutReadyAt);
    if (remainingMs > 0) {
      await page.waitForTimeout(remainingMs);
    }

    const orderResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/storefront/orders") &&
        response.request().method() === "POST",
    );
    await placeOrder.click();
    const created = await orderResponse;
    expect(
      created.ok(),
      `POST /storefront/orders failed: ${created.status()} ${await created.text()}`,
    ).toBeTruthy();

    await expect(page).toHaveURL(/\/vi\/order-success\/?$/, { timeout: 60_000 });
    await expect(
      page.getByRole("heading", { name: "Đặt hàng thành công!" }),
    ).toBeVisible();

    const orderNumber = page.getByTestId("order-number");
    await expect(orderNumber).toBeVisible();
    await expect(orderNumber).toHaveText(/\S+/);
  });
});
