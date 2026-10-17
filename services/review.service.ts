import {
  STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
  STOREFRONT_REVIEWS_PAGE_SIZE,
  getAllStorefrontReviews,
  getStorefrontPlantReviews,
  getStorefrontReviews,
} from "@/lib/api/storefront";
import {
  resolveReviewSummary,
  type PlantReviewsData,
} from "@/lib/reviews";
import { withBuildFallback } from "@/lib/storefront/build-fallback";
import type {
  StorefrontReview,
  StorefrontReviewSummary,
} from "@/types/storefront-review";

export type { PlantReviewsData };

export type ReviewsPageData = {
  reviews: StorefrontReview[];
  total: number;
  summary: StorefrontReviewSummary;
};

async function fetchStorefrontReviewPreview(limit: number): Promise<{
  summary: StorefrontReviewSummary | null;
  reviews: StorefrontReview[];
}> {
  const page = await getStorefrontReviews({
    page: 1,
    page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
  });

  const hasApiSummary =
    typeof page.average_rating === "number" &&
    page.rating_distribution != null;

  const reviews = [...page.items]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);

  return {
    summary: hasApiSummary ? resolveReviewSummary(page) : null,
    reviews,
  };
}

/**
 * Summary plus the newest few reviews for the homepage section. Sends the same
 * first-page request as `/reviews`, so both pages share one cached response.
 * Never pages through all reviews: `summary` is null unless the API sends it.
 * Throws when the API is unreachable so a regenerating page keeps its cached
 * reviews; only an offline build gets null (do not invent ratings).
 */
function loadStorefrontReviewPreview(limit: number) {
  return withBuildFallback(fetchStorefrontReviewPreview(limit), null);
}

async function fetchPlantReviews(slug: string): Promise<PlantReviewsData> {
  const page = await getStorefrontPlantReviews(slug, {
    page: 1,
    page_size: STOREFRONT_PLANT_REVIEWS_PAGE_SIZE,
  });
  return {
    reviews: page.items,
    total: page.total,
    summary: resolveReviewSummary(page),
  };
}

/**
 * First page of a plant's approved reviews plus its rating summary.
 * Throws when the API is unreachable so a regenerating page keeps its cached
 * stars and structured-data rating. Only an offline build gets null, which hides
 * the section instead of showing invented ratings.
 */
function loadPlantReviews(
  slug: string
): Promise<PlantReviewsData | null> {
  return withBuildFallback(fetchPlantReviews(slug), null);
}

async function fetchReviewsPageData(): Promise<ReviewsPageData> {
  const page = await getStorefrontReviews({
    page: 1,
    page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
  });

  const hasApiSummary =
    typeof page.average_rating === "number" &&
    page.rating_distribution != null;

  const allForSummary = hasApiSummary
    ? null
    : await withBuildFallback(getAllStorefrontReviews(), page.items);

  const summary = resolveReviewSummary(page, allForSummary ?? page.items);

  return {
    reviews: page.items,
    total: page.total,
    summary,
  };
}

/**
 * First page of site-wide reviews plus summary for `/reviews`.
 * Uses the same page size as the homepage preview so both share one cached
 * response. Offline build → null.
 */
function loadReviewsPageData(): Promise<ReviewsPageData | null> {
  return withBuildFallback(fetchReviewsPageData(), null);
}

export {
  loadStorefrontReviewPreview,
  loadPlantReviews,
  loadReviewsPageData,
};
