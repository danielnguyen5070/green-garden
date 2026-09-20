/** Public storefront review types from `GET|POST /api/v1/storefront/reviews`. */

export type StorefrontReview = {
  id: string;
  name: string;
  rating: number;
  content: string;
  created_at: string;
};

export type StorefrontRatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type StorefrontReviewSummary = {
  average_rating: number;
  total_reviews: number;
  rating_distribution: StorefrontRatingDistribution;
};

/**
 * List payload. Summary fields are optional — older API builds may omit them;
 * the UI derives a summary from loaded approved reviews in that case.
 */
export type StorefrontReviewListResponse = {
  items: StorefrontReview[];
  page: number;
  page_size: number;
  total: number;
  average_rating?: number;
  total_reviews?: number;
  rating_distribution?: StorefrontRatingDistribution | number[];
};

export type StorefrontReviewCreateRequest = {
  name: string;
  rating: number;
  content: string;
};

export const STOREFRONT_REVIEW_NAME_MAX = 255;
export const STOREFRONT_REVIEW_CONTENT_MAX = 5000;
export const STOREFRONT_REVIEW_RATING_MIN = 1;
export const STOREFRONT_REVIEW_RATING_MAX = 5;
