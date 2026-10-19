import { describe, expect, it } from "vitest";
import { parseStorefrontChange } from "@/lib/storefront/revalidate";

describe("parseStorefrontChange", () => {
  it("accepts a bare entity", () => {
    expect(parseStorefrontChange({ entity: "plants" })).toEqual({
      entity: "plants",
    });
  });

  it("dedupes valid slugs", () => {
    expect(
      parseStorefrontChange({
        entity: "reviews",
        slugs: ["monstera", "monstera", "snake-plant"],
      })
    ).toEqual({
      entity: "reviews",
      slugs: ["monstera", "snake-plant"],
    });
  });

  it("rejects unknown entities and bad slugs", () => {
    expect(parseStorefrontChange({ entity: "orders" })).toBeNull();
    expect(
      parseStorefrontChange({ entity: "plants", slugs: ["Bad_Slug"] })
    ).toBeNull();
    expect(parseStorefrontChange(null)).toBeNull();
    expect(parseStorefrontChange({ entity: "plants", slugs: "x" })).toBeNull();
  });

  it("rejects more than 100 slugs", () => {
    const slugs = Array.from({ length: 101 }, (_, i) => `slug-${i}`);
    expect(parseStorefrontChange({ entity: "plants", slugs })).toBeNull();
  });
});
