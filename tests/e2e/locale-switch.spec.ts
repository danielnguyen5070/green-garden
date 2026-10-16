import { expect, type Page, test } from "@playwright/test";
import {
  waitForApiAndResolvePlant,
  type E2ePlant,
} from "./helpers/api";

test.describe.configure({ mode: "serial" });

async function switchLocale(page: Page, next: "VI" | "EN") {
  await page.getByRole("button", { name: /Ngôn ngữ|Language/ }).click();
  await page.getByRole("menuitem", { name: next, exact: true }).click();
}

test.describe("Locale switching", () => {
  let plant: E2ePlant;

  test.beforeAll(async () => {
    plant = await waitForApiAndResolvePlant();
  });

  test("switches plants catalog between vi and en", async ({ page }) => {
    test.setTimeout(60_000);

    await test.step("1. Open Vietnamese plant catalog", async () => {
      await page.goto("/vi/plants");
      await expect(page).toHaveURL(/\/vi\/plants\/?$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Cây giống",
      );
      await expect(
        page.getByRole("navigation", { name: "Primary" }),
      ).toContainText("Cây giống");
      await expect(page.getByRole("button", { name: "Ngôn ngữ" })).toContainText(
        "VI",
      );
    });

    await test.step("2. Switch locale to English", async () => {
      await switchLocale(page, "EN");
      await expect(page).toHaveURL(/\/en\/plants\/?$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plants");
      await expect(
        page.getByRole("navigation", { name: "Primary" }),
      ).toContainText("Plants");
      await expect(page.getByRole("button", { name: "Language" })).toContainText(
        "EN",
      );
    });

    await test.step("3. Switch locale back to Vietnamese", async () => {
      await switchLocale(page, "VI");
      await expect(page).toHaveURL(/\/vi\/plants\/?$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Cây giống",
      );
      await expect(page.getByRole("button", { name: "Ngôn ngữ" })).toContainText(
        "VI",
      );
    });
  });

  test("keeps the same plant slug when switching locale on the PDP", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await test.step("1. Open product detail in Vietnamese", async () => {
      await page.goto(`/vi/plants/${plant.plantSlug}`);
      await expect(page.locator('[data-slot="plant-detail"]')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        plant.nameVi,
      );
    });

    await test.step("2. Switch to English product page", async () => {
      await switchLocale(page, "EN");
      await expect(page).toHaveURL(
        new RegExp(`/en/plants/${plant.plantSlug}/?$`),
      );
      await expect(page.locator('[data-slot="plant-detail"]')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        plant.nameEn,
      );
    });
  });

  test("redirects unprefixed /plants to /vi/plants", async ({ page }) => {
    await test.step("1. Open unprefixed /plants", async () => {
      await page.goto("/plants");
    });

    await test.step("2. Verify redirect to Vietnamese catalog", async () => {
      await expect(page).toHaveURL(/\/vi\/plants\/?$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Cây giống",
      );
    });
  });

  test("keeps admin login unprefixed", async ({ page }) => {
    await test.step("1. Open /admin/login", async () => {
      await page.goto("/admin/login");
    });

    await test.step("2. Verify admin URL stays without locale prefix", async () => {
      await expect(page).toHaveURL(/\/admin\/login\/?$/);
      expect(page.url()).not.toMatch(/\/(vi|en)\//);
      await expect(page.getByText("Admin sign in")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
    });
  });
});
