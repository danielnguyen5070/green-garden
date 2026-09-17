import type { CartItem } from "@/types/cart";
import type { CreateStorefrontOrderRequest } from "@/types/storefront";

export type CheckoutFormField = "phone" | "name" | "address" | "note";

export type CheckoutFormValues = Record<CheckoutFormField, string>;

/** Message keys under `checkout.shippingDetails.errors`. */
export type CheckoutFormErrors = Partial<Record<CheckoutFormField, string>>;

export const CHECKOUT_FORM_FIELDS: CheckoutFormField[] = [
  "phone",
  "name",
  "address",
  "note",
];

export const EMPTY_CHECKOUT_FORM: CheckoutFormValues = {
  phone: "",
  name: "",
  address: "",
  note: "",
};

/** Vietnamese mobile numbers: 0 or +84, a 3/5/7/8/9 prefix, then 8 digits. */
const VN_PHONE_PATTERN = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;

const MIN_NAME_LENGTH = 2;
const MIN_ADDRESS_LENGTH = 8;

/** Strips the separators people type into phone numbers, e.g. "038 656 9374". */
export function normalizePhone(value: string) {
  return value.replace(/[\s.()\-]/g, "");
}

export function validateCheckoutField(
  field: CheckoutFormField,
  values: CheckoutFormValues,
): string | undefined {
  const value = values[field].trim();

  switch (field) {
    case "phone":
      if (!value) return "phoneRequired";
      return VN_PHONE_PATTERN.test(normalizePhone(value))
        ? undefined
        : "phoneInvalid";
    case "name":
      if (!value) return "nameRequired";
      return value.length < MIN_NAME_LENGTH ? "nameTooShort" : undefined;
    case "address":
      if (!value) return "addressRequired";
      return value.length < MIN_ADDRESS_LENGTH ? "addressTooShort" : undefined;
    case "note":
      return undefined;
  }
}

export function validateCheckoutForm(values: CheckoutFormValues) {
  const errors: CheckoutFormErrors = {};

  for (const field of CHECKOUT_FORM_FIELDS) {
    const error = validateCheckoutField(field, values);
    if (error) errors[field] = error;
  }

  return errors;
}

export function isCheckoutFormValid(values: CheckoutFormValues) {
  return Object.keys(validateCheckoutForm(values)).length === 0;
}

/**
 * Builds the order payload from the form and the cart. Prices and totals are
 * deliberately left out — the backend prices the order from the catalogue.
 */
export function toStorefrontOrderPayload(
  values: CheckoutFormValues,
  items: CartItem[],
): CreateStorefrontOrderRequest {
  const note = values.note.trim();

  return {
    customer: {
      name: values.name.trim(),
      phone: normalizePhone(values.phone.trim()),
    },
    shipping_address: values.address.trim(),
    ...(note ? { note } : {}),
    items: items.map((item) => ({
      plant_id: item.plantId,
      quantity: item.quantity,
      pot_size: item.potSizeLabel ?? null,
    })),
  };
}
