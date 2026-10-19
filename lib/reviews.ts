import { z } from "zod";
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

const finiteCount = z.number().finite();

const ratingDistributionRecordSchema = z
  .object({
    1: finiteCount.optional(),
    2: finiteCount.optional(),
    3: finiteCount.optional(),
    4: finiteCount.optional(),
    5: finiteCount.optional(),
  })
  .passthrough()
  .refine(
    (record) =>
      [1, 2, 3, 4, 5].every((star) => {
        const count =
          record[star as 1 | 2 | 3 | 4 | 5] ??
          (record as Record<string, unknown>)[String(star)];
        return typeof count === "number" && Number.isFinite(count);
      }),
    { error: "incomplete_distribution" }
  );

const ratingDistributionArraySchema = z.array(z.number()).length(5);

/** Accepts a 5-length array `[count1, count2, …]` or a `{1..5}` map. */
export function normalizeRatingDistribution(
  value: StorefrontReviewListResponse["rating_distribution"]
): StorefrontRatingDistribution | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const arrayResult = ratingDistributionArraySchema.safeParse(value);
    if (!arrayResult.success) return null;
    return {
      1: arrayResult.data[0] ?? 0,
      2: arrayResult.data[1] ?? 0,
      3: arrayResult.data[2] ?? 0,
      4: arrayResult.data[3] ?? 0,
      5: arrayResult.data[4] ?? 0,
    };
  }

  const recordResult = ratingDistributionRecordSchema.safeParse(value);
  if (!recordResult.success) return null;

  const record = recordResult.data as Record<string, unknown>;
  return {
    1: Number(record[1] ?? record["1"] ?? 0),
    2: Number(record[2] ?? record["2"] ?? 0),
    3: Number(record[3] ?? record["3"] ?? 0),
    4: Number(record[4] ?? record["4"] ?? 0),
    5: Number(record[5] ?? record["5"] ?? 0),
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

export type PlantReviewsData = {
  reviews: StorefrontReview[];
  total: number;
  summary: StorefrontReviewSummary;
};

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
