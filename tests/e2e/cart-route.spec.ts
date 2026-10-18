import { expect, test } from "@playwright/test";

test.describe("Cart URL", () => {
  test("has no /cart page (cart UX is the drawer)", async ({ page }) => {
    const viResponse = await page.goto("/vi/cart");
    expect(viResponse?.status()).toBe(404);
    await expect(page).toHaveURL(/\/vi\/cart\/?$/);

    const enResponse = await page.goto("/en/cart");
    expect(enResponse?.status()).toBe(404);
    await expect(page).toHaveURL(/\/en\/cart\/?$/);
  });
});
