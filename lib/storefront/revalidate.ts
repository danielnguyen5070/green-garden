import { CACHE_TAGS } from "@/lib/storefront/cache-tags";

/**
 * A catalog change, as reported by the admin UI or a FastAPI webhook. Both
 * are untrusted input, so `parseStorefrontChange` validates it before it is
 * mapped onto cache tags.
 */
export type StorefrontChange = {
  entity: StorefrontEntity;
  /** Affected plant slugs, including the slug before a rename. */
  slugs?: string[];
};

export const STOREFRONT_ENTITIES = [
  "plants",
  "categories",
  "reviews",
  "shipping_policy",
] as const;

export type StorefrontEntity = (typeof STOREFRONT_ENTITIES)[number];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;
const MAX_SLUGS = 100;

function isEntity(value: unknown): value is StorefrontEntity {
  return (
    typeof value === "string" &&
    (STOREFRONT_ENTITIES as readonly string[]).includes(value)
  );
}

function isSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_SLUG_LENGTH &&
    SLUG_PATTERN.test(value)
  );
}

/** Returns null when `value` is not a well-formed change. */
export function parseStorefrontChange(value: unknown): StorefrontChange | null {
  if (typeof value !== "object" || value === null) return null;

  const { entity, slugs } = value as Record<string, unknown>;
  if (!isEntity(entity)) return null;

  if (slugs === undefined || slugs === null) return { entity };
  if (!Array.isArray(slugs) || slugs.length > MAX_SLUGS) return null;
  if (!slugs.every(isSlug)) return null;

  return { entity, slugs: [...new Set(slugs)] };
}

/**
 * Tags to invalidate for a change. Plant edits always drop `plants` too:
 * lists, search, related plants and variant-slug detail pages all read it.
 */
export function getStorefrontChangeTags({
  entity,
  slugs = [],
}: StorefrontChange): string[] {
  switch (entity) {
    case "plants":
      return [CACHE_TAGS.plants, ...slugs.map(CACHE_TAGS.plant)];
    case "categories":
      // Plant responses embed their category's name and slug.
      return [CACHE_TAGS.categories, CACHE_TAGS.plants];
    case "reviews":
      return [CACHE_TAGS.reviews, ...slugs.map(CACHE_TAGS.plantReviews)];
    case "shipping_policy":
      return [CACHE_TAGS.shippingPolicy];
  }
}
