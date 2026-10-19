import { z } from "zod";
import type { BotSignals } from "@/types/bot-signals";
import type { CartItem } from "@/types/cart";
import type { PaymentMethod } from "@/types/order";
import type { CreateStorefrontOrderRequest } from "@/types/storefront";
import { firstIssueMessage, issuesByField } from "@/lib/validation/first-issue";

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

const checkoutFormSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, { error: "phoneRequired" })
    .refine((value) => VN_PHONE_PATTERN.test(normalizePhone(value)), {
      error: "phoneInvalid",
    }),
  name: z
    .string()
    .trim()
    .min(1, { error: "nameRequired" })
    .refine((value) => value.length >= MIN_NAME_LENGTH, {
      error: "nameTooShort",
    }),
  address: z
    .string()
    .trim()
    .min(1, { error: "addressRequired" })
    .refine((value) => value.length >= MIN_ADDRESS_LENGTH, {
      error: "addressTooShort",
    }),
  note: z.string(),
});

const checkoutFieldSchemas: Record<CheckoutFormField, z.ZodType> = {
  phone: checkoutFormSchema.shape.phone,
  name: checkoutFormSchema.shape.name,
  address: checkoutFormSchema.shape.address,
  note: checkoutFormSchema.shape.note,
};

export function validateCheckoutField(
  field: CheckoutFormField,
  values: CheckoutFormValues,
): string | undefined {
  const result = checkoutFieldSchemas[field].safeParse(values[field]);
  if (result.success) return undefined;
  return firstIssueMessage(result.error) ?? undefined;
}

export function validateCheckoutForm(values: CheckoutFormValues) {
  const result = checkoutFormSchema.safeParse(values);
  if (result.success) return {} as CheckoutFormErrors;
  return issuesByField(result.error, CHECKOUT_FORM_FIELDS);
}

export function isCheckoutFormValid(values: CheckoutFormValues) {
  return Object.keys(validateCheckoutForm(values)).length === 0;
}

/** Order payload fields, as the API names them in validation errors. */
const PAYLOAD_FIELD_TO_FORM_FIELD: Record<string, CheckoutFormField> = {
  "customer.phone": "phone",
  "customer.name": "name",
  shipping_address: "address",
  note: "note",
};

/**
 * Maps the API's field errors (see `getFieldErrors`) onto the form. The API's
 * English text is not shown; each field gets its own localized message key.
 */
export function toCheckoutFormErrors(
  fieldErrors: Record<string, string>,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  for (const name of Object.keys(fieldErrors)) {
    const field = PAYLOAD_FIELD_TO_FORM_FIELD[name];
    if (field) errors[field] = `${field}Invalid`;
  }

  return errors;
}

/**
 * Builds the order payload from the form and the cart. Prices and totals are
 * deliberately left out — the backend prices the order from the catalogue.
 */
export function toStorefrontOrderPayload(
  values: CheckoutFormValues,
  items: CartItem[],
  botSignals: BotSignals,
  paymentMethod: PaymentMethod = "cod",
): CreateStorefrontOrderRequest {
  const note = values.note.trim();

  return {
    ...botSignals,
    payment_method: paymentMethod,
    customer: {
      name: values.name.trim(),
      phone: normalizePhone(values.phone.trim()),
    },
    shipping_address: values.address.trim(),
    ...(note ? { note } : {}),
    items: items.map((item) => ({
      plant_id: item.plantId,
      quantity: item.quantity,
    })),
  };
}
