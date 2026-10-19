import { describe, expect, it } from "vitest";
import {
  isCheckoutFormValid,
  toCheckoutFormErrors,
  validateCheckoutField,
  validateCheckoutForm,
} from "@/lib/checkout-form";

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

describe("validateCheckoutField", () => {
  it("accepts a Vietnamese mobile number with separators", () => {
    expect(
      validateCheckoutField("phone", {
        phone: "038 656 9374",
        name: "",
        address: "",
        note: "",
      })
    ).toBeUndefined();
  });

  it("rejects an empty phone", () => {
    expect(
      validateCheckoutField("phone", {
        phone: "  ",
        name: "",
        address: "",
        note: "",
      })
    ).toBe("phoneRequired");
  });

  it("rejects an invalid phone", () => {
    expect(
      validateCheckoutField("phone", {
        phone: "0123456789",
        name: "",
        address: "",
        note: "",
      })
    ).toBe("phoneInvalid");
  });

  it("enforces name and address minimum lengths", () => {
    expect(
      validateCheckoutField("name", {
        phone: "",
        name: "A",
        address: "",
        note: "",
      })
    ).toBe("nameTooShort");
    expect(
      validateCheckoutField("address", {
        phone: "",
        name: "",
        address: "short",
        note: "",
      })
    ).toBe("addressTooShort");
  });

  it("always accepts note", () => {
    expect(
      validateCheckoutField("note", {
        phone: "",
        name: "",
        address: "",
        note: "",
      })
    ).toBeUndefined();
  });
});

describe("validateCheckoutForm", () => {
  it("returns all field errors for an empty form", () => {
    expect(
      validateCheckoutForm({
        phone: "",
        name: "",
        address: "",
        note: "",
      })
    ).toEqual({
      phone: "phoneRequired",
      name: "nameRequired",
      address: "addressRequired",
    });
  });

  it("is valid for well-formed shipping details", () => {
    const values = {
      phone: "+84386569374",
      name: "An",
      address: "123 Garden Street",
      note: "Leave at gate",
    };
    expect(validateCheckoutForm(values)).toEqual({});
    expect(isCheckoutFormValid(values)).toBe(true);
  });
});
