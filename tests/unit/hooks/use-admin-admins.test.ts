/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useAdminAdminsList,
  useCreateAdmin,
} from "@/hooks/use-admin-admins";
import { queryKeys } from "@/lib/query/keys";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/tests/unit/hooks/test-utils";
import type { Admin, AdminListResponse } from "@/types/admin";
import { ApiError } from "@/lib/api/errors";

const listAdmins = vi.fn();
const createAdmin = vi.fn();

vi.mock("@/lib/api/admins", () => ({
  listAdmins: (...args: unknown[]) => listAdmins(...args),
  createAdmin: (...args: unknown[]) => createAdmin(...args),
  updateAdmin: vi.fn(),
  updateAdminPassword: vi.fn(),
  updateAdminStatus: vi.fn(),
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function admin(overrides: Partial<Admin> = {}): Admin {
  return {
    id: "a1",
    name: "Root",
    email: "root@example.com",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function listResponse(
  items: Admin[],
  total = items.length
): AdminListResponse {
  return { items, page: 1, page_size: 20, total };
}

describe("useAdminAdminsList", () => {
  beforeEach(() => {
    listAdmins.mockReset();
  });

  it("loads admins successfully", async () => {
    listAdmins.mockResolvedValue(listResponse([admin()]));

    const { result } = renderHook(() => useAdminAdminsList({ page: 1 }), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.email).toBe("root@example.com");
    expect(result.current.total).toBe(1);
    expect(listAdmins).toHaveBeenCalledWith(
      { page: 1, page_size: 20 },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("handles an empty list", async () => {
    listAdmins.mockResolvedValue(listResponse([]));

    const { result } = renderHook(() => useAdminAdminsList({ page: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("surfaces list errors without clearing prior filter keys", async () => {
    listAdmins.mockRejectedValue(new ApiError(500, "boom"));

    const { result } = renderHook(() => useAdminAdminsList({ page: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.items).toEqual([]);
  });

  it("fetches separately for different pages", async () => {
    listAdmins
      .mockResolvedValueOnce(listResponse([admin({ id: "p1" })]))
      .mockResolvedValueOnce(listResponse([admin({ id: "p2" })]));

    const client = createTestQueryClient();
    const wrapper = createQueryWrapper(client);

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useAdminAdminsList({ page }),
      { wrapper, initialProps: { page: 1 } }
    );

    await waitFor(() => expect(result.current.items[0]?.id).toBe("p1"));

    rerender({ page: 2 });

    await waitFor(() => expect(result.current.items[0]?.id).toBe("p2"));

    expect(listAdmins).toHaveBeenCalledTimes(2);
    expect(
      client.getQueryData(queryKeys.admin.admins.list({ page: 1 }))
    ).toEqual(listResponse([admin({ id: "p1" })]));
  });
});

describe("useCreateAdmin", () => {
  beforeEach(() => {
    createAdmin.mockReset();
    listAdmins.mockReset();
  });

  it("calls createAdmin and invalidates only admin list keys", async () => {
    createAdmin.mockResolvedValue(admin({ id: "new" }));

    const client = createTestQueryClient();
    client.setQueryData(queryKeys.admin.admins.list({ page: 1 }), listResponse([]));
    client.setQueryData(queryKeys.admin.overview, { total_orders: 1 });
    client.setQueryData(queryKeys.admin.notifications, { items: [], unreadCount: 0 });

    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useCreateAdmin(), {
      wrapper: createQueryWrapper(client),
    });

    await result.current.mutateAsync({
      name: "New",
      email: "new@example.com",
      password: "password12",
    });

    expect(createAdmin).toHaveBeenCalledWith({
      name: "New",
      email: "new@example.com",
      password: "password12",
    });

    const invalidated = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidated).toContainEqual(queryKeys.admin.admins.all);
    expect(invalidated).not.toContainEqual(queryKeys.admin.overview);
    expect(invalidated).not.toContainEqual(queryKeys.admin.notifications);

    // Unrelated caches stay intact until their own invalidation.
    expect(client.getQueryData(queryKeys.admin.overview)).toEqual({
      total_orders: 1,
    });
  });

  it("does not invalidate on failure", async () => {
    createAdmin.mockRejectedValue(new ApiError(400, "bad"));

    const client = createTestQueryClient();
    const cached = listResponse([admin()]);
    client.setQueryData(queryKeys.admin.admins.list({ page: 1 }), cached);

    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useCreateAdmin(), {
      wrapper: createQueryWrapper(client),
    });

    await expect(
      result.current.mutateAsync({
        name: "New",
        email: "bad",
        password: "short",
      })
    ).rejects.toBeTruthy();

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(client.getQueryData(queryKeys.admin.admins.list({ page: 1 }))).toEqual(
      cached
    );
  });
});
