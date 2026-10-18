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

  it("distinguishes admin plant list filters and pagination", () => {
    const base = {
      page: 1,
      search: "",
      categoryId: null as string | null,
      isActive: null as boolean | null,
      isFeatured: null as boolean | null,
      minPrice: "",
      maxPrice: "",
      sort: "created_at",
      order: "desc",
    };
    const a = queryKeys.admin.plants.list(base);
    const b = queryKeys.admin.plants.list({ ...base, page: 2 });
    const c = queryKeys.admin.plants.list({ ...base, search: "lan" });
    const d = queryKeys.admin.plants.list({ ...base, isActive: true });

    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
    expect(a).not.toEqual(d);
  });

  it("scopes admin plant and category detail by id", () => {
    expect(queryKeys.admin.plants.detail("p1")).not.toEqual(
      queryKeys.admin.plants.detail("p2")
    );
    expect(queryKeys.admin.categories.detail("c1")).not.toEqual(
      queryKeys.admin.categories.detail("c2")
    );
  });

  it("distinguishes admin order list date and status filters", () => {
    const base = {
      page: 1,
      search: "",
      status: null as string | null,
      dateFrom: "",
      dateTo: "",
    };
    expect(queryKeys.admin.orders.list(base)).not.toEqual(
      queryKeys.admin.orders.list({ ...base, status: "pending" })
    );
    expect(queryKeys.admin.orders.list(base)).not.toEqual(
      queryKeys.admin.orders.list({ ...base, dateFrom: "2026-01-01" })
    );
  });

  it("scopes admin customer orders by customer id", () => {
    expect(queryKeys.admin.orders.byCustomer("cust-1")).not.toEqual(
      queryKeys.admin.orders.byCustomer("cust-2")
    );
  });

  it("distinguishes admin review list status and scope", () => {
    const base = {
      page: 1,
      search: "",
      status: null as string | null,
      scope: null as string | null,
    };
    expect(queryKeys.admin.reviews.list(base)).not.toEqual(
      queryKeys.admin.reviews.list({ ...base, status: "pending" })
    );
    expect(queryKeys.admin.reviews.list(base)).not.toEqual(
      queryKeys.admin.reviews.list({ ...base, scope: "plant" })
    );
  });

  it("keys admin admins list by page", () => {
    expect(queryKeys.admin.admins.list({ page: 1 })).not.toEqual(
      queryKeys.admin.admins.list({ page: 2 })
    );
  });
});
