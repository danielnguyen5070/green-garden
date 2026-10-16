import { expect, test } from "@playwright/test";
import { assertSafeE2eApiUrl, getAdminCredentials } from "./helpers/env";

test.describe.configure({ mode: "serial" });

test.describe("Admin authentication", () => {
  test.beforeAll(() => {
    assertSafeE2eApiUrl();
    getAdminCredentials();
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("logs in, opens orders, and logs out", async ({ page, context }) => {
    test.setTimeout(60_000);
    const { email, password } = getAdminCredentials();

    await test.step("1. Visit /admin without authentication", async () => {
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/admin\/login\/?(\?.*)?$/);
      await expect(page.getByText("Admin sign in")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Sign in with admin credentials", async () => {
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
    });

    await test.step("3. Verify dashboard overview renders", async () => {
      await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 });
      await expect(page.locator('[data-slot="admin-shell"]')).toBeVisible();
      await expect(page.locator('[data-slot="admin-topbar"]')).toContainText(
        "Overview",
      );
      await expect(
        page.getByRole("region", { name: "Overview" }),
      ).toBeVisible({ timeout: 30_000 });
    });

    await test.step("4. Open admin orders page", async () => {
      await page.goto("/admin/orders");
      await expect(page).toHaveURL(/\/admin\/orders\/?$/);
      await expect(page.locator('[data-slot="admin-topbar"]')).toContainText(
        "Orders",
      );
      await expect(
        page.getByText("Track and process customer orders."),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Create order" }),
      ).toBeVisible();
    });

    await test.step("5. Sign out via profile menu", async () => {
      await page.getByRole("button", { name: "Admin profile" }).click();
      await page.getByRole("menuitem", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/admin\/login\/?$/, { timeout: 30_000 });
      await expect(page.getByText("Admin sign in")).toBeVisible();
    });

    await test.step("6. Confirm /admin still redirects to login", async () => {
      await context.clearCookies();
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/admin\/login\/?(\?.*)?$/);
      await expect(page.getByText("Admin sign in")).toBeVisible();
    });
  });
});
