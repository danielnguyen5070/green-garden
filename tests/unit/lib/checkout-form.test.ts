import { describe, expect, it } from "vitest";
import { toCheckoutFormErrors } from "@/lib/checkout-form";

describe("toCheckoutFormErrors", () => {
  it("maps API payload fields to form fields with localized keys", () => {
    expect(
      toCheckoutFormErrors({
        "customer.phone": "value is not a valid phone number",
        "customer.name": "String should have at least 2 characters",
        shipping_address: "Field required",
        note: "String should have at most 1000 characters",
      })
    ).toEqual({
      phone: "phoneInvalid",
      name: "nameInvalid",
      address: "addressInvalid",
      note: "noteInvalid",
    });
  });

  it("ignores fields the form does not edit", () => {
    expect(
      toCheckoutFormErrors({ "items.0.quantity": "Input should be greater than 0" })
    ).toEqual({});
  });
});
