import { assertSafeE2eApiUrl, getE2eApiUrl } from "./env";

type StorefrontPlantListItem = {
  slug: string;
  stock: number;
  price_vi: string | null;
  default_pot_size?: { id: string } | null;
};

type StorefrontPlantListResponse = {
  items: StorefrontPlantListItem[];
};

function apiV1Base(apiUrl: string): string {
  return `${apiUrl.replace(/\/$/, "")}/api/v1`;
}

/** Matches catalogue cards: in stock with a VND price (pot size optional). */
function isOrderableListItem(plant: StorefrontPlantListItem): boolean {
  return plant.stock > 0 && Boolean(plant.price_vi?.trim());
}

/**
 * Poll the storefront plants list until the API answers, then return an
 * orderable plant slug (from E2E_PLANT_SLUG or the first matching list item).
 */
export async function waitForApiAndResolvePlant(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<{ apiUrl: string; plantSlug: string }> {
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
          } else {
            // Prefer the configured slug even if it is not on page 1; the PDP
            // will fail clearly if the plant is missing.
            return { apiUrl, plantSlug: preferredSlug };
          }
        } else {
          const orderable = items.find(isOrderableListItem);
          if (orderable) {
            return { apiUrl, plantSlug: orderable.slug };
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
