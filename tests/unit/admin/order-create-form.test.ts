import { describe, expect, it } from "vitest";
import { validateOrderCreateForm } from "@/app/admin/(dashboard)/orders/_lib/order-create-form";
import { adminCopy } from "@/app/admin/_lib/admin-copy";

const copy = adminCopy.orders;

describe("validateOrderCreateForm", () => {
  it("returns a payload for a valid draft", () => {
    const result = validateOrderCreateForm({
      name: "Lan",
      phone: "0386569374",
      email: "lan@example.com",
      shippingAddress: "123 Street",
      note: "",
      items: [{ plant_id: "plant-1", quantity: "2" }],
    });

    expect(result).toEqual({
      payload: {
        customer: {
          name: "Lan",
          phone: "0386569374",
          email: "lan@example.com",
        },
        shipping_address: "123 Street",
        note: null,
        items: [{ plant_id: "plant-1", quantity: 2 }],
      },
    });
  });

  it("requires at least one selected plant", () => {
    const result = validateOrderCreateForm({
      name: "Lan",
      phone: "0386569374",
      email: "",
      shippingAddress: "123 Street",
      note: "",
      items: [{ plant_id: "", quantity: "1" }],
    });

    expect(result).toEqual({ error: copy.items.required });
  });

  it("rejects a bad email when provided", () => {
    const result = validateOrderCreateForm({
      name: "Lan",
      phone: "0386569374",
      email: "not-email",
      shippingAddress: "123 Street",
      note: "",
      items: [{ plant_id: "plant-1", quantity: "1" }],
    });

    expect(result).toEqual({ error: copy.invalidEmail });
  });

  it("rejects a non-positive quantity", () => {
    const result = validateOrderCreateForm({
      name: "Lan",
      phone: "0386569374",
      email: "",
      shippingAddress: "123 Street",
      note: "",
      items: [{ plant_id: "plant-1", quantity: "0" }],
    });

    expect(result).toEqual({ error: copy.invalidQuantity });
  });
});
