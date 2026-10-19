import { z } from "zod";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import type { OrderCreateRequest, OrderItemCreateRequest } from "@/types/order";
import { firstIssueMessage } from "@/lib/validation/first-issue";
import { isValidEmail } from "@/lib/validation/primitives";

const copy = adminCopy.orders;

export type OrderCreateDraftItem = {
  plant_id: string;
  quantity: string;
};

export type OrderCreateFormValues = {
  name: string;
  phone: string;
  email: string;
  shippingAddress: string;
  note: string;
  items: OrderCreateDraftItem[];
};

const orderItemSchema = z.object({
  plant_id: z.string().min(1),
  quantity: z.string().refine(
    (value) => {
      const quantity = Number(value);
      return Number.isInteger(quantity) && quantity >= 1;
    },
    { error: copy.invalidQuantity }
  ),
});

const orderCreateFormSchema = z
  .object({
    name: z
      .string()
      .min(1, { error: copy.invalidCustomerName })
      .max(255, { error: copy.invalidCustomerName }),
    phone: z
      .string()
      .min(1, { error: copy.invalidCustomerPhone })
      .max(32, { error: copy.invalidCustomerPhone }),
    email: z.string().refine(
      (value) => value === "" || isValidEmail(value),
      { error: copy.invalidEmail }
    ),
    shippingAddress: z
      .string()
      .min(1, { error: copy.invalidShippingAddress }),
    note: z.string(),
    items: z.array(orderItemSchema).min(1, { error: copy.items.required }),
  });

/**
 * Validates draft order fields and selected line items. Returns a single
 * adminCopy message on failure, or the API payload on success.
 */
export function validateOrderCreateForm(
  values: OrderCreateFormValues
): { error: string } | { payload: OrderCreateRequest } {
  const selected = values.items.filter((item) => item.plant_id !== "");
  const result = orderCreateFormSchema.safeParse({
    ...values,
    items: selected,
  });

  if (!result.success) {
    return { error: firstIssueMessage(result.error) ?? copy.items.required };
  }

  const payloadItems: OrderItemCreateRequest[] = result.data.items.map(
    (item) => ({
      plant_id: item.plant_id,
      quantity: Number(item.quantity),
    })
  );

  return {
    payload: {
      customer: {
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email || null,
      },
      shipping_address: result.data.shippingAddress,
      note: result.data.note || null,
      items: payloadItems,
    },
  };
}
