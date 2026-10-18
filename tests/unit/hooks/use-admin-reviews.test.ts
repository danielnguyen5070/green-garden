/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useAdminReviewsList,
  useUpdateReviewStatus,
} from "@/hooks/use-admin-reviews";
import { queryKeys } from "@/lib/query/keys";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/tests/unit/hooks/test-utils";
import type { Review, ReviewListResponse } from "@/types/review";

const listReviews = vi.fn();
const updateReviewStatus = vi.fn();

vi.mock("@/lib/api/reviews", () => ({
  listReviews: (...args: unknown[]) => listReviews(...args),
  updateReviewStatus: (...args: unknown[]) => updateReviewStatus(...args),
  getReview: vi.fn(),
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function review(overrides: Partial<Review> = {}): Review {
  return {
    id: "r1",
    plant_id: null,
    plant: null,
    name: "Ann",
    rating: 5,
    content: "Great",
    status: "pending",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function listResponse(items: Review[]): ReviewListResponse {
  return { items, page: 1, page_size: 20, total: items.length };
}

describe("useUpdateReviewStatus", () => {
  beforeEach(() => {
    updateReviewStatus.mockReset();
    listReviews.mockReset();
  });

  it("patches the active list cache and invalidates overview", async () => {
    const listKey = queryKeys.admin.reviews.list({
      page: 1,
      search: "",
      status: "pending",
      scope: null,
    });
    const pending = review({ status: "pending" });
    const approved = review({ status: "approved" });
    updateReviewStatus.mockResolvedValue(approved);

    const client = createTestQueryClient();
    client.setQueryData(listKey, listResponse([pending]));
    client.setQueryData(queryKeys.admin.admins.list({ page: 1 }), {
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
    });

    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useUpdateReviewStatus(listKey), {
      wrapper: createQueryWrapper(client),
    });

    await result.current.mutateAsync({
      id: pending.id,
      data: { status: "approved" },
    });

    expect(updateReviewStatus).toHaveBeenCalledWith(pending.id, {
      status: "approved",
    });

    const cached = client.getQueryData<ReviewListResponse>(listKey);
    expect(cached?.items[0]?.status).toBe("approved");

    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.admin.overview);
    expect(keys).not.toContainEqual(queryKeys.admin.admins.all);
  });
});

describe("useAdminReviewsList", () => {
  beforeEach(() => {
    listReviews.mockReset();
  });

  it("loads filtered reviews", async () => {
    listReviews.mockResolvedValue(listResponse([review()]));

    const { result } = renderHook(
      () =>
        useAdminReviewsList({
          page: 1,
          search: "",
          status: "pending",
          scope: null,
        }),
      { wrapper: createQueryWrapper() }
    );

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(listReviews).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        scope: undefined,
      }),
      expect.anything()
    );
  });
});
