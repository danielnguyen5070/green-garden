/**
 * Data Cache tags for storefront fetches. `lib/storefront/revalidate.ts` maps
 * catalog changes onto these, so the two must stay in sync.
 */
export const CACHE_TAGS = {
  /** Every plant list, search and detail response. */
  plants: "plants",
  plant: (slug: string) => `plant:${slug}`,
  categories: "categories",
  shippingPolicy: "shipping-policy",
  /** Every review list, site-wide and per plant. */
  reviews: "reviews",
  plantReviews: (slug: string) => `reviews:plant:${slug}`,
} as const;
