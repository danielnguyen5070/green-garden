export type PlantListKeyParams = {
  categoryId?: string;
  /** UI sort option — featured and newest share API params but differ client-side. */
  sortOption: string;
  /** First catalogue page in this browse session (`/page/N` landings). */
  startPage: number;
};

export type PlantSearchKeyParams = {
  categoryId?: string;
  sortOption: string;
  q: string;
};

export type ReviewsKeyParams = {
  pageSize: number;
};

export const queryKeys = {
  plants: {
    all: ["plants"] as const,
    list: (params: PlantListKeyParams) =>
      [
        "plants",
        "list",
        params.categoryId ?? null,
        params.sortOption,
        params.startPage,
      ] as const,
    search: (params: PlantSearchKeyParams) =>
      [
        "plants",
        "search",
        params.categoryId ?? null,
        params.sortOption,
        params.q,
      ] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    storefront: (params: ReviewsKeyParams) =>
      ["reviews", "storefront", params.pageSize] as const,
    plant: (slug: string, params: ReviewsKeyParams) =>
      ["reviews", "plant", slug, params.pageSize] as const,
  },
  cart: {
    quote: (cartKey: string) => ["cart", "quote", cartKey] as const,
  },
  payment: {
    status: (orderId: string) => ["payment", "status", orderId] as const,
  },
  admin: {
    overview: ["admin", "overview"] as const,
    notifications: ["admin", "notifications"] as const,
  },
};
