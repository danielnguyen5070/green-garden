/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useAdminCategoriesList,
  useCreateCategory,
} from "@/hooks/use-admin-categories";
import { queryKeys } from "@/lib/query/keys";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/tests/unit/hooks/test-utils";
import type { Category, CategoryListResponse } from "@/types/category";

const listCategories = vi.fn();
const createCategory = vi.fn();

vi.mock("@/lib/api/categories", () => ({
  listCategories: (...args: unknown[]) => listCategories(...args),
  createCategory: (...args: unknown[]) => createCategory(...args),
  getCategory: vi.fn(),
  updateCategory: vi.fn(),
  updateCategoryStatus: vi.fn(),
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function category(overrides: Partial<Category> = {}): Category {
  return {
    id: "c1",
    name: "Orchids",
    name_vi: "Lan",
    slug: "orchids",
    description: null,
    description_vi: null,
    image_url: null,
    sort_order: 0,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function listResponse(
  items: Category[],
  total = items.length
): CategoryListResponse {
  return { items, page: 1, page_size: 20, total };
}

describe("useAdminCategoriesList", () => {
  beforeEach(() => {
    listCategories.mockReset();
  });

  it("passes filters into the list API and query key", async () => {
    listCategories.mockResolvedValue(listResponse([category()]));

    const { result } = renderHook(
      () =>
        useAdminCategoriesList({
          page: 1,
          search: "lan",
          isActive: true,
        }),
      { wrapper: createQueryWrapper() }
    );

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    expect(listCategories).toHaveBeenCalledWith(
      {
        page: 1,
        page_size: 20,
        search: "lan",
        is_active: true,
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("refetches when search changes", async () => {
    listCategories
      .mockResolvedValueOnce(listResponse([category({ id: "a" })]))
      .mockResolvedValueOnce(listResponse([category({ id: "b" })]));

    const { result, rerender } = renderHook(
      (props: { search: string }) =>
        useAdminCategoriesList({
          page: 1,
          search: props.search,
          isActive: null,
        }),
      { wrapper: createQueryWrapper(), initialProps: { search: "" } }
    );

    await waitFor(() => expect(result.current.items[0]?.id).toBe("a"));

    rerender({ search: "rose" });

    await waitFor(() => expect(result.current.items[0]?.id).toBe("b"));
    expect(listCategories).toHaveBeenCalledTimes(2);
  });
});

describe("useCreateCategory", () => {
  beforeEach(() => {
    createCategory.mockReset();
  });

  it("invalidates category lists, options, and overview only", async () => {
    createCategory.mockResolvedValue(category({ id: "new" }));

    const client = createTestQueryClient();
    client.setQueryData(queryKeys.admin.plants.picker, { items: [] });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createQueryWrapper(client),
    });

    await result.current.mutateAsync({
      name: "Ferns",
      slug: "ferns",
      sort_order: 1,
      is_active: true,
    });

    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.admin.categories.all);
    expect(keys).toContainEqual(queryKeys.admin.categories.options);
    expect(keys).toContainEqual(queryKeys.admin.overview);
    expect(keys).not.toContainEqual(queryKeys.admin.plants.picker);
    expect(keys).not.toContainEqual(queryKeys.admin.admins.all);
  });
});
