/** Admin dashboard list tables, hooks, and notification feed. */
export const ADMIN_LIST_PAGE_SIZE = 10;

/** API hard cap for `page_size` (admin pickers + bulk storefront fetches). */
export const API_MAX_PAGE_SIZE = 100;

/** Cards per plants catalog page, and per "Load more" step. */
export const STOREFRONT_PLANTS_PAGE_SIZE = 8;

/** Bulk storefront fetches use the API max page size. */
export const STOREFRONT_PLANTS_MAX_PAGE_SIZE = API_MAX_PAGE_SIZE;

/** Approved reviews per Reviews page load / "Load more" step. */
export const STOREFRONT_REVIEWS_PAGE_SIZE = 8;

/** Approved reviews per plant detail page load / "Load more" step. */
export const STOREFRONT_PLANT_REVIEWS_PAGE_SIZE = 6;

/** Max plants returned by storefront search. */
export const STOREFRONT_PLANTS_SEARCH_LIMIT = 20;
