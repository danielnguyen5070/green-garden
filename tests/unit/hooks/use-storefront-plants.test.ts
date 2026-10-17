/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStorefrontPlants } from "@/hooks/use-storefront-plants";
import { createQueryWrapper } from "@/tests/unit/hooks/test-utils";
import type { StorefrontPlantListItem, StorefrontPlantListResponse } from "@/types/storefront";

const getStorefrontPlants = vi.fn();

vi.mock("@/lib/api/storefront", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/storefront")>(
    "@/lib/api/storefront"
  );
  return {
    ...actual,
    getStorefrontPlants: (...args: unknown[]) => getStorefrontPlants(...args),
  };
});

function listResponse(
  items: StorefrontPlantListItem[],
  total = items.length
): StorefrontPlantListResponse {
  return {
    items,
    total,
    page: 1,
    page_size: 12,
  };
}

const plantA = {
  id: "1",
  slug: "mango",
  name: "Mango",
  name_vi: "Xoài",
  description: null,
  description_vi: null,
  is_featured: true,
  price: "100000",
  price_vi: null,
  stock: 5,
  category: null,
  images: [],
  updated_at: "2024-01-01T00:00:00Z",
} satisfies StorefrontPlantListItem;

const plantB = {
  ...plantA,
  id: "2",
  slug: "guava",
  name: "Guava",
  name_vi: "Ổi",
  is_featured: false,
} satisfies StorefrontPlantListItem;

describe("useStorefrontPlants", () => {
  beforeEach(() => {
    getStorefrontPlants.mockReset();
  });

  it("reuses SSR initial data for the default browse view", () => {
    const initial = listResponse([plantA], 1);

    const { result } = renderHook(
      () => useStorefrontPlants({ initial, initialPage: 1 }),
      { wrapper: createQueryWrapper() }
    );

    expect(result.current.plants).toHaveLength(1);
    expect(result.current.plants[0]?.slug).toBe("mango");
    expect(getStorefrontPlants).not.toHaveBeenCalled();
  });

  it("fetches when the sort option changes", async () => {
    const initial = listResponse([plantA], 1);
    getStorefrontPlants.mockResolvedValue(listResponse([plantB], 1));

    const { result } = renderHook(
      () => useStorefrontPlants({ initial, initialPage: 1 }),
      { wrapper: createQueryWrapper() }
    );

    act(() => {
      result.current.setSortOption("newest");
    });

    await waitFor(() => {
      expect(getStorefrontPlants).toHaveBeenCalled();
    });
  });

  it("loads matching plants after search debounce", async () => {
    const initial = listResponse([plantA, plantB], 2);
    getStorefrontPlants.mockResolvedValue(listResponse([plantA, plantB], 2));

    const { result } = renderHook(
      () => useStorefrontPlants({ initial, initialPage: 1 }),
      { wrapper: createQueryWrapper() }
    );

    act(() => {
      result.current.setSearchInput("guava");
    });

    await waitFor(
      () => {
        expect(result.current.isSearching).toBe(true);
        expect(
          result.current.plants.some((plant) => plant.slug === "guava")
        ).toBe(true);
      },
      { timeout: 2000 }
    );
  });
});
