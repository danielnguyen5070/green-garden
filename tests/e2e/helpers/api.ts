import { assertSafeE2eApiUrl, getE2eApiUrl } from "./env";

import { STOREFRONT_PLANTS_PAGE_SIZE } from "@/lib/constants/pagination";

/** Alias for storefront plants page size (used by e2e specs). */
export const E2E_PLANTS_PAGE_SIZE = STOREFRONT_PLANTS_PAGE_SIZE;

type StorefrontPlantListItem = {
  slug: string;
  name: string;
  name_vi: string | null;
  stock: number;
  price_vi: string | null;
};

type StorefrontPlantListResponse = {
  items: StorefrontPlantListItem[];
  total: number;
};

type StorefrontCategory = {
  id: string;
  slug: string;
  name: string;
  name_vi: string | null;
};

function apiV1Base(apiUrl: string): string {
  return `${apiUrl.replace(/\/$/, "")}/api/v1`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return (await response.json()) as T;
}

/** Matches catalogue cards: in stock with a VND price (pot size optional). */
function isOrderableListItem(plant: StorefrontPlantListItem): boolean {
  return plant.stock > 0 && Boolean(plant.price_vi?.trim());
}

/**
 * Poll the storefront plants list until the API answers, then return an
 * orderable plant slug (from E2E_PLANT_SLUG or the first matching list item).
 */
export type E2ePlant = {
  apiUrl: string;
  plantSlug: string;
  nameEn: string;
  nameVi: string;
};

function toE2ePlant(apiUrl: string, plant: StorefrontPlantListItem): E2ePlant {
  return {
    apiUrl,
    plantSlug: plant.slug,
    nameEn: plant.name,
    nameVi: plant.name_vi?.trim() || plant.name,
  };
}

export async function waitForApiAndResolvePlant(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<E2ePlant> {
  const apiUrl = assertSafeE2eApiUrl(getE2eApiUrl());
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const intervalMs = options?.intervalMs ?? 1_000;
  const preferredSlug = process.env.E2E_PLANT_SLUG?.trim();
  const listUrl = `${apiV1Base(apiUrl)}/storefront/plants?page=1&page_size=20`;
  const started = Date.now();
  let lastError: unknown;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(listUrl, {
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} from ${listUrl}`);
      } else {
        const body = (await response.json()) as StorefrontPlantListResponse;
        const items = Array.isArray(body.items) ? body.items : [];

        if (preferredSlug) {
          const preferred = items.find((item) => item.slug === preferredSlug);
          if (preferred && !isOrderableListItem(preferred)) {
            lastError = new Error(
              `E2E_PLANT_SLUG="${preferredSlug}" is not in stock with a VND price.`,
            );
          } else if (preferred) {
            return toE2ePlant(apiUrl, preferred);
          } else {
            // Prefer the configured slug even if it is not on page 1; fetch detail.
            const detail = await fetchJson<StorefrontPlantListItem>(
              `${apiV1Base(apiUrl)}/storefront/plants/${encodeURIComponent(preferredSlug)}`,
            );
            return toE2ePlant(apiUrl, detail);
          }
        } else {
          const orderable = items.find(isOrderableListItem);
          if (orderable) {
            return toE2ePlant(apiUrl, orderable);
          }

          lastError = new Error(
            "Storefront API is up but no in-stock priced plant was found on page 1. Seed the test database or set E2E_PLANT_SLUG.",
          );
        }
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  const detail =
    lastError instanceof Error ? lastError.message : String(lastError ?? "unknown error");
  throw new Error(
    `E2E API not ready at ${apiUrl} within ${timeoutMs}ms (${detail}). Start green-garden-api against a test/local database, then retry.`,
  );
}

export type E2eCatalogCategory = {
  apiUrl: string;
  slug: string;
  /** Vietnamese label shown on category chips when present. */
  label: string;
  total: number;
  canPaginate: boolean;
};

/**
 * Resolve a category with plants for browse/pagination E2E.
 * Prefers `E2E_CATEGORY_SLUG`, then the category with the most plants.
 */
export async function waitForApiAndResolveCategory(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<E2eCatalogCategory> {
  const apiUrl = assertSafeE2eApiUrl(getE2eApiUrl());
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const intervalMs = options?.intervalMs ?? 1_000;
  const preferredSlug = process.env.E2E_CATEGORY_SLUG?.trim();
  const categoriesUrl = `${apiV1Base(apiUrl)}/storefront/categories`;
  const started = Date.now();
  let lastError: unknown;

  while (Date.now() - started < timeoutMs) {
    try {
      const categoriesBody = await fetchJson<
        StorefrontCategory[] | { items: StorefrontCategory[] }
      >(categoriesUrl);
      const categories = Array.isArray(categoriesBody)
        ? categoriesBody
        : Array.isArray(categoriesBody.items)
          ? categoriesBody.items
          : [];

      if (categories.length === 0) {
        lastError = new Error("No storefront categories returned.");
      } else {
        const withTotals = await Promise.all(
          categories.map(async (category) => {
            const plants = await fetchJson<StorefrontPlantListResponse>(
              `${apiV1Base(apiUrl)}/storefront/plants?page=1&page_size=1&category_id=${encodeURIComponent(category.id)}`,
            );
            return {
              slug: category.slug,
              label: category.name_vi?.trim() || category.name,
              total: plants.total ?? 0,
            };
          }),
        );

        const preferred = preferredSlug
          ? withTotals.find((category) => category.slug === preferredSlug)
          : undefined;

        if (preferredSlug && !preferred) {
          lastError = new Error(
            `E2E_CATEGORY_SLUG="${preferredSlug}" was not found in the storefront categories list.`,
          );
        } else {
          const ranked = [...withTotals].sort((a, b) => b.total - a.total);
          const chosen =
            preferred ??
            ranked.find((category) => category.total > 0) ??
            null;

          if (!chosen) {
            lastError = new Error(
              "No category with plants was found. Seed the test database or set E2E_CATEGORY_SLUG.",
            );
          } else if (chosen.total === 0) {
            lastError = new Error(
              `Category "${chosen.slug}" has no plants. Seed the test database.`,
            );
          } else {
            return {
              apiUrl,
              slug: chosen.slug,
              label: chosen.label,
              total: chosen.total,
              canPaginate: chosen.total > E2E_PLANTS_PAGE_SIZE,
            };
          }
        }
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  const detail =
    lastError instanceof Error ? lastError.message : String(lastError ?? "unknown error");
  throw new Error(
    `E2E API not ready at ${apiUrl} within ${timeoutMs}ms (${detail}). Start green-garden-api against a test/local database, then retry.`,
  );
}
