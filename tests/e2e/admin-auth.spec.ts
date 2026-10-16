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

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login\/?(\?.*)?$/);
    await expect(page.getByText("Admin sign in")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();

    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 });
    await expect(page.locator('[data-slot="admin-shell"]')).toBeVisible();
    await expect(page.locator('[data-slot="admin-topbar"]')).toContainText(
      "Overview",
    );
    await expect(
      page.getByRole("region", { name: "Overview" }),
    ).toBeVisible({ timeout: 30_000 });

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

    await page.getByRole("button", { name: "Admin profile" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/admin\/login\/?$/, { timeout: 30_000 });
    await expect(page.getByText("Admin sign in")).toBeVisible();

    await context.clearCookies();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login\/?(\?.*)?$/);
    await expect(page.getByText("Admin sign in")).toBeVisible();
  });
});
