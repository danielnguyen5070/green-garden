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

    await page.goto("/vi/plants");
    await expect(page).toHaveURL(/\/vi\/plants\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cây giống");
    await expect(page.getByRole("navigation", { name: "Primary" })).toContainText(
      "Cây giống",
    );
    await expect(page.getByRole("button", { name: "Ngôn ngữ" })).toContainText(
      "VI",
    );

    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/plants\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plants");
    await expect(page.getByRole("navigation", { name: "Primary" })).toContainText(
      "Plants",
    );
    await expect(page.getByRole("button", { name: "Language" })).toContainText(
      "EN",
    );

    await switchLocale(page, "VI");
    await expect(page).toHaveURL(/\/vi\/plants\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cây giống");
    await expect(page.getByRole("button", { name: "Ngôn ngữ" })).toContainText(
      "VI",
    );
  });

  test("keeps the same plant slug when switching locale on the PDP", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.goto(`/vi/plants/${plant.plantSlug}`);
    await expect(page.locator('[data-slot="plant-detail"]')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      plant.nameVi,
    );

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

  test("redirects unprefixed /plants to /vi/plants", async ({ page }) => {
    await page.goto("/plants");
    await expect(page).toHaveURL(/\/vi\/plants\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cây giống");
  });

  test("keeps admin login unprefixed", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/login\/?$/);
    expect(page.url()).not.toMatch(/\/(vi|en)\//);
    await expect(page.getByText("Admin sign in")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
  });
});
