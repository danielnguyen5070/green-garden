/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAdminPlantDetail,
  useCreatePlantImage,
} from "@/app/admin/_hooks/use-admin-plants";
import { queryKeys } from "@/lib/query/keys";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/tests/unit/hooks/test-utils";
import type { AdminPlant, AdminPlantImage } from "@/types/admin-plant";

const getPlant = vi.fn();
const createPlantImage = vi.fn();

vi.mock("@/lib/api/plants", () => ({
  getPlant: (...args: unknown[]) => getPlant(...args),
  listPlants: vi.fn(),
  createPlant: vi.fn(),
  updatePlant: vi.fn(),
  updatePlantStatus: vi.fn(),
  createPlantImage: (...args: unknown[]) => createPlantImage(...args),
  updatePlantImage: vi.fn(),
  deletePlantImage: vi.fn(),
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function plant(overrides: Partial<AdminPlant> = {}): AdminPlant {
  return {
    id: "p1",
    category_id: "c1",
    category: {
      id: "c1",
      name: "Fruit",
      name_vi: null,
      slug: "fruit",
    },
    name: "Mango",
    name_vi: "Xoài",
    slug: "mango",
    description: "desc",
    description_vi: "mô tả",
    long_description: null,
    long_description_vi: null,
    price: "100000",
    price_vi: null,
    stock: 5,
    sku: "MANGO-1",
    og_image_url: null,
    is_featured: false,
    is_active: true,
    plant_type: null,
    difficulty: null,
    growth_rate: null,
    sunlight: null,
    watering: null,
    space_requirement: null,
    indoor_suitable: null,
    outdoor_suitable: null,
    pet_safe: null,
    beginner_friendly: null,
    images: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("fetchAdminPlantDetail", () => {
  beforeEach(() => {
    getPlant.mockReset();
  });

  it("fetches via the admin plant detail query key and caches the result", async () => {
    const detail = plant({ name_vi: "Xoài", description_vi: "Mô tả" });
    getPlant.mockResolvedValue(detail);

    const client = createTestQueryClient();
    const result = await fetchAdminPlantDetail(client, "p1");

    expect(result).toEqual(detail);
    expect(getPlant).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(client.getQueryData(queryKeys.admin.plants.detail("p1"))).toEqual(
      detail
    );
  });

  it("reuses a cached detail without refetching when still fresh", async () => {
    const detail = plant();
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.admin.plants.detail("p1"), detail);

    const result = await fetchAdminPlantDetail(client, "p1");

    expect(result).toEqual(detail);
    expect(getPlant).not.toHaveBeenCalled();
  });
});

describe("useCreatePlantImage", () => {
  beforeEach(() => {
    createPlantImage.mockReset();
  });

  it("calls createPlantImage and invalidates plant detail and list keys", async () => {
    const created = {
      id: "img1",
      plant_id: "p1",
      url: "https://cdn.example.com/a.jpg",
      type: "image",
      alt_text: null,
      sort_order: 0,
      created_at: "2026-01-01T00:00:00Z",
    } satisfies AdminPlantImage;
    createPlantImage.mockResolvedValue(created);

    const client = createTestQueryClient();
    client.setQueryData(queryKeys.admin.plants.detail("p1"), plant());
    client.setQueryData(queryKeys.admin.admins.list({ page: 1 }), {
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useCreatePlantImage(), {
      wrapper: createQueryWrapper(client),
    });

    await result.current.mutateAsync({
      plantId: "p1",
      data: {
        url: created.url,
        type: "image",
        alt_text: null,
        sort_order: 0,
      },
    });

    expect(createPlantImage).toHaveBeenCalledWith("p1", {
      url: created.url,
      type: "image",
      alt_text: null,
      sort_order: 0,
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.admin.plants.detail("p1"));
    expect(keys).toContainEqual(queryKeys.admin.plants.all);
    expect(keys).not.toContainEqual(queryKeys.admin.admins.all);
  });
});
