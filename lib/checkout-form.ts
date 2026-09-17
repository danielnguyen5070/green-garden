export type CheckoutFormField = "phone" | "name" | "address";

export type CheckoutFormValues = Record<CheckoutFormField, string>;

/** Message keys under `checkout.shippingDetails.errors`. */
export type CheckoutFormErrors = Partial<Record<CheckoutFormField, string>>;

export const CHECKOUT_FORM_FIELDS: CheckoutFormField[] = [
  "phone",
  "name",
  "address",
];

export const EMPTY_CHECKOUT_FORM: CheckoutFormValues = {
  phone: "",
  name: "",
  address: "",
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

  if (field === "phone") {
    if (!value) return "phoneRequired";
    return VN_PHONE_PATTERN.test(normalizePhone(value))
      ? undefined
      : "phoneInvalid";
  }

  // Name and address are optional, but a half-typed value is still worth flagging.
  if (!value) return undefined;

  switch (field) {
    case "name":
      return value.length < MIN_NAME_LENGTH ? "nameTooShort" : undefined;
    case "address":
      return value.length < MIN_ADDRESS_LENGTH ? "addressTooShort" : undefined;
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
