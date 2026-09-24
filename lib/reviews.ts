import {
  STOREFRONT_REVIEWS_PAGE_SIZE,
  getAllStorefrontReviews,
  getStorefrontReviews,
} from "@/lib/api/storefront";
import type {
  StorefrontRatingDistribution,
  StorefrontReview,
  StorefrontReviewListResponse,
  StorefrontReviewSummary,
} from "@/types/storefront-review";

const EMPTY_DISTRIBUTION: StorefrontRatingDistribution = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

function emptySummary(total = 0): StorefrontReviewSummary {
  return {
    average_rating: 0,
    total_reviews: total,
    rating_distribution: { ...EMPTY_DISTRIBUTION },
  };
}

function isDistributionRecord(
  value: unknown
): value is StorefrontRatingDistribution {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return [1, 2, 3, 4, 5].every((star) => {
    const count = record[String(star)] ?? record[star as unknown as string];
    return typeof count === "number" && Number.isFinite(count);
  });
}

/** Accepts a 5-length array `[count1, count2, …]` or a `{1..5}` map. */
export function normalizeRatingDistribution(
  value: StorefrontReviewListResponse["rating_distribution"]
): StorefrontRatingDistribution | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    if (value.length !== 5) return null;
    return {
      1: value[0] ?? 0,
      2: value[1] ?? 0,
      3: value[2] ?? 0,
      4: value[3] ?? 0,
      5: value[4] ?? 0,
    };
  }

  if (!isDistributionRecord(value)) return null;

  return {
    1: Number(value[1] ?? 0),
    2: Number(value[2] ?? 0),
    3: Number(value[3] ?? 0),
    4: Number(value[4] ?? 0),
    5: Number(value[5] ?? 0),
  };
}

/** Build summary stats from approved review rows (fallback when API omits them). */
export function buildReviewSummaryFromItems(
  items: StorefrontReview[],
  totalReviews?: number
): StorefrontReviewSummary {
  const total = totalReviews ?? items.length;
  if (items.length === 0) return emptySummary(total);

  const distribution = { ...EMPTY_DISTRIBUTION };
  let sum = 0;

  for (const item of items) {
    const rating = Math.min(5, Math.max(1, Math.round(item.rating))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    distribution[rating] += 1;
    sum += item.rating;
  }

  return {
    average_rating: Math.round((sum / items.length) * 10) / 10,
    total_reviews: total,
    rating_distribution: distribution,
  };
}

/**
 * Prefer summary fields from the API when present; otherwise derive from items.
 */
export function resolveReviewSummary(
  response: StorefrontReviewListResponse,
  fallbackItems: StorefrontReview[] = response.items
): StorefrontReviewSummary {
  const distribution = normalizeRatingDistribution(
    response.rating_distribution
  );
  const total =
    typeof response.total_reviews === "number"
      ? response.total_reviews
      : response.total;

  if (
    typeof response.average_rating === "number" &&
    Number.isFinite(response.average_rating) &&
    distribution
  ) {
    return {
      average_rating: Math.round(response.average_rating * 10) / 10,
      total_reviews: total,
      rating_distribution: distribution,
    };
  }

  return buildReviewSummaryFromItems(fallbackItems, total);
}

/**
 * Same summary the reviews page UI uses — for homepage LocalBusiness JSON-LD.
 * Returns null when the API is unreachable (do not invent ratings).
 */
export async function loadStorefrontReviewSummary(): Promise<StorefrontReviewSummary | null> {
  try {
    const page = await getStorefrontReviews({
      page: 1,
      page_size: STOREFRONT_REVIEWS_PAGE_SIZE,
    });

    const hasApiSummary =
      typeof page.average_rating === "number" &&
      page.rating_distribution != null;

    const allForSummary = hasApiSummary
      ? null
      : await getAllStorefrontReviews().catch(() => page.items);

    return resolveReviewSummary(page, allForSummary ?? page.items);
  } catch {
    return null;
  }
}

export function formatRelativeReviewDate(
  iso: string,
  locale: string
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(locale === "vi" ? "vi" : "en", {
    numeric: "auto",
  });

  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 86_400 * 30) {
    return rtf.format(Math.round(diffSeconds / 86_400), "day");
  }
  if (abs < 86_400 * 365) {
    return rtf.format(Math.round(diffSeconds / (86_400 * 30)), "month");
  }
  return rtf.format(Math.round(diffSeconds / (86_400 * 365)), "year");
}

/**
 * First non-empty line becomes the card title when the review has a blank line
 * (or newline) separating a headline from the body.
 */
export function splitReviewContent(content: string): {
  title: string | null;
  body: string;
} {
  const trimmed = content.trim();
  if (!trimmed) return { title: null, body: "" };

  const parts = trimmed.split(/\n+/);
  if (parts.length < 2) {
    return { title: null, body: trimmed };
  }

  const title = parts[0]?.trim() || null;
  const body = parts.slice(1).join("\n\n").trim();
  if (!title || !body) {
    return { title: null, body: trimmed };
  }

  return { title, body };
}
