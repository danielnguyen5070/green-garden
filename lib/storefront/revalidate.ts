import { z } from "zod";
import { CACHE_TAGS } from "@/lib/storefront/cache-tags";
import { storefrontSlugSchema } from "@/lib/storefront/slug";

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

const MAX_SLUGS = 100;

const storefrontChangeSchema = z.object({
  entity: z.enum(STOREFRONT_ENTITIES),
  slugs: z.array(storefrontSlugSchema).max(MAX_SLUGS).optional(),
});

/** Returns null when `value` is not a well-formed change. */
export function parseStorefrontChange(value: unknown): StorefrontChange | null {
  const result = storefrontChangeSchema.safeParse(value);
  if (!result.success) return null;

  const { entity, slugs } = result.data;
  if (slugs === undefined) return { entity };
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
