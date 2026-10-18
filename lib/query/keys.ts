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

export type AdminPlantListKeyParams = {
  page: number;
  search: string;
  categoryId: string | null;
  isActive: boolean | null;
  isFeatured: boolean | null;
  minPrice: string;
  maxPrice: string;
  sort: string;
  order: string;
};

export type AdminCategoryListKeyParams = {
  page: number;
  search: string;
  isActive: boolean | null;
};

export type AdminOrderListKeyParams = {
  page: number;
  search: string;
  status: string | null;
  dateFrom: string;
  dateTo: string;
};

export type AdminCustomerListKeyParams = {
  page: number;
  search: string;
  isActive: boolean | null;
};

export type AdminReviewListKeyParams = {
  page: number;
  search: string;
  status: string | null;
  scope: string | null;
};

export type AdminAdminsListKeyParams = {
  page: number;
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
    plants: {
      all: ["admin", "plants"] as const,
      list: (params: AdminPlantListKeyParams) =>
        [
          "admin",
          "plants",
          "list",
          params.page,
          params.search,
          params.categoryId,
          params.isActive,
          params.isFeatured,
          params.minPrice,
          params.maxPrice,
          params.sort,
          params.order,
        ] as const,
      detail: (id: string) => ["admin", "plants", "detail", id] as const,
      picker: ["admin", "plants", "picker"] as const,
    },
    categories: {
      all: ["admin", "categories"] as const,
      list: (params: AdminCategoryListKeyParams) =>
        [
          "admin",
          "categories",
          "list",
          params.page,
          params.search,
          params.isActive,
        ] as const,
      detail: (id: string) => ["admin", "categories", "detail", id] as const,
      options: ["admin", "categories", "options"] as const,
    },
    orders: {
      all: ["admin", "orders"] as const,
      list: (params: AdminOrderListKeyParams) =>
        [
          "admin",
          "orders",
          "list",
          params.page,
          params.search,
          params.status,
          params.dateFrom,
          params.dateTo,
        ] as const,
      detail: (id: string) => ["admin", "orders", "detail", id] as const,
      byCustomer: (customerId: string) =>
        ["admin", "orders", "byCustomer", customerId] as const,
    },
    customers: {
      all: ["admin", "customers"] as const,
      list: (params: AdminCustomerListKeyParams) =>
        [
          "admin",
          "customers",
          "list",
          params.page,
          params.search,
          params.isActive,
        ] as const,
      detail: (id: string) => ["admin", "customers", "detail", id] as const,
    },
    reviews: {
      all: ["admin", "reviews"] as const,
      list: (params: AdminReviewListKeyParams) =>
        [
          "admin",
          "reviews",
          "list",
          params.page,
          params.search,
          params.status,
          params.scope,
        ] as const,
    },
    admins: {
      all: ["admin", "admins"] as const,
      list: (params: AdminAdminsListKeyParams) =>
        ["admin", "admins", "list", params.page] as const,
    },
  },
};
