import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/query/keys";

describe("queryKeys", () => {
  it("distinguishes plant list params including start page and sort option", () => {
    const a = queryKeys.plants.list({
      categoryId: "cat-1",
      sortOption: "featured",
      startPage: 1,
    });
    const b = queryKeys.plants.list({
      categoryId: "cat-1",
      sortOption: "featured",
      startPage: 2,
    });
    const c = queryKeys.plants.list({
      categoryId: "cat-1",
      sortOption: "newest",
      startPage: 1,
    });

    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("distinguishes plant search query strings", () => {
    const a = queryKeys.plants.search({
      sortOption: "featured",
      q: "lan",
    });
    const b = queryKeys.plants.search({
      sortOption: "featured",
      q: "lan ho",
    });
    expect(a).not.toEqual(b);
  });

  it("scopes plant reviews by slug", () => {
    const a = queryKeys.reviews.plant("mango", { pageSize: 6 });
    const b = queryKeys.reviews.plant("guava", { pageSize: 6 });
    expect(a).not.toEqual(b);
  });

  it("keys cart quotes by cart contents", () => {
    expect(queryKeys.cart.quote("a:1")).not.toEqual(
      queryKeys.cart.quote("a:2")
    );
  });

  it("keys payment status by order id", () => {
    expect(queryKeys.payment.status("ord-1")).not.toEqual(
      queryKeys.payment.status("ord-2")
    );
  });
});
