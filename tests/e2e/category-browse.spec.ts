import { expect, test } from "@playwright/test";
import {
  E2E_PLANTS_PAGE_SIZE,
  waitForApiAndResolveCategory,
  type E2eCatalogCategory,
} from "./helpers/api";

test.describe.configure({ mode: "serial" });

test.describe("Category browsing and pagination", () => {
  let category: E2eCatalogCategory;

  test.beforeAll(async () => {
    category = await waitForApiAndResolveCategory();
  });

  test("filters by category, sorts, paginates, and opens a plant", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await test.step("1. Open plant catalog", async () => {
      await page.goto("/vi/plants");
      await expect(page.locator('[data-slot="plant-card"]').first()).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('[data-slot="catalog-filters"]')).toBeVisible();
    });

    await test.step("2. Select a category chip", async () => {
      // Category chips use Button+Link; the a11y tree exposes them as buttons.
      await page
        .locator('[data-slot="catalog-filters"]')
        .getByRole("button", { name: category.label, exact: true })
        .click();

      await expect(page).toHaveURL(
        new RegExp(`/vi/categories/${category.slug}/?$`),
      );
      await expect(page.locator('[data-slot="plant-card"]').first()).toBeVisible({
        timeout: 30_000,
      });
      expect(await page.locator('[data-slot="plant-card"]').count()).toBeGreaterThan(
        0,
      );
    });

    const cards = page.locator('[data-slot="plant-card"]');

    await test.step("3. Change sort order to price ascending", async () => {
      const sortedList = page.waitForResponse(
        (response) =>
          response.url().includes("/storefront/plants") &&
          response.url().includes("sort=price") &&
          response.url().includes("order=asc") &&
          response.ok(),
      );

      await page.getByRole("combobox", { name: "Sắp xếp" }).click();
      await page.getByRole("option", { name: "Giá: Thấp đến cao" }).click();
      await sortedList;
      await expect(page.getByRole("combobox", { name: "Sắp xếp" })).toContainText(
        "Giá: Thấp đến cao",
      );
      await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    });

    await test.step("4. Load more results when available", async () => {
      const loadMore = page.getByRole("button", { name: "Xem thêm" });
      if (category.canPaginate) {
        await expect(loadMore).toBeVisible({ timeout: 15_000 });
        const countBeforeMore = await cards.count();
        await loadMore.click();
        await expect
          .poll(async () => cards.count(), { timeout: 30_000 })
          .toBeGreaterThan(countBeforeMore);
      } else {
        test.info().annotations.push({
          type: "note",
          description: `Skipped Load more: category "${category.slug}" has ${category.total} plants (page size ${E2E_PLANTS_PAGE_SIZE}). Seed more plants to exercise page 2.`,
        });
        await expect(loadMore).toHaveCount(0);
      }
    });

    await test.step("5. Open a product detail page", async () => {
      const productLink = cards.first().locator("h3 a");
      const plantName = (await productLink.innerText()).trim();
      const href = await productLink.getAttribute("href");
      expect(href).toMatch(/\/plants\/[^/]+/);
      await productLink.click();

      await expect(page).toHaveURL(/\/vi\/plants\/[^/]+\/?$/);
      await expect(page.locator('[data-slot="plant-detail"]')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        plantName,
      );
    });
  });
});
