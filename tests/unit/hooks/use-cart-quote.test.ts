/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { createQueryWrapper } from "@/tests/unit/hooks/test-utils";
import type { CartItem } from "@/types/cart";
import type { StorefrontQuoteResponse } from "@/types/storefront";

const quoteStorefrontCart = vi.fn();

vi.mock("@/lib/api/storefront", () => ({
  quoteStorefrontCart: (...args: unknown[]) => quoteStorefrontCart(...args),
}));

const cartState = {
  items: [] as CartItem[],
  hasHydrated: true,
};

vi.mock("@/store/cart.store", () => ({
  useCartStore: (selector: (state: typeof cartState) => unknown) =>
    selector(cartState),
}));

function quoteResponse(): StorefrontQuoteResponse {
  return {
    currency: "VND",
    subtotal_amount: "100000",
    shipping_fee: "0",
    total_amount: "100000",
    free_shipping_above: "500000",
    amount_to_free_shipping: "400000",
    lines: [
      {
        plant_id: "p1",
        quantity: 1,
        unit_price: "100000",
        line_total: "100000",
        available: true,
        max_quantity: 10,
        name: "Mango",
        name_vi: "Xoài",
        slug: "mango",
        image_url: null,
      },
    ],
  };
}

describe("useCartQuote", () => {
  beforeEach(() => {
    quoteStorefrontCart.mockReset();
    cartState.items = [];
    cartState.hasHydrated = true;
  });

  it("stays idle when the cart is empty", () => {
    const { result } = renderHook(() => useCartQuote(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.quote).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(quoteStorefrontCart).not.toHaveBeenCalled();
  });

  it("loads a quote for the hydrated cart", async () => {
    cartState.items = [
      {
        id: "line-1",
        plantId: "p1",
        quantity: 1,
      },
    ];
    quoteStorefrontCart.mockResolvedValue(quoteResponse());

    const { result } = renderHook(() => useCartQuote(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.quote?.total_amount).toBe("100000");
    });

    expect(result.current.isOrderable).toBe(true);
    expect(result.current.lineFor("line-1")?.line_total).toBe("100000");
  });

  it("surfaces errors from the quote API", async () => {
    cartState.items = [
      {
        id: "line-1",
        plantId: "p1",
        quantity: 1,
      },
    ];
    quoteStorefrontCart.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useCartQuote(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasError).toBe(true);
    });
  });
});
