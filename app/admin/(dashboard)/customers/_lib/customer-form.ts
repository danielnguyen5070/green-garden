import { z } from "zod";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { firstIssueMessage } from "@/lib/validation/first-issue";
import { isValidEmail } from "@/lib/validation/primitives";

const copy = adminCopy.customers;

export type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
};

export function readForm(form: HTMLFormElement): CustomerFormValues {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  };
}

const customerFormSchema = z.object({
  name: z
    .string()
    .min(1, { error: copy.invalidName })
    .max(255, { error: copy.invalidName }),
  phone: z
    .string()
    .min(1, { error: copy.invalidPhone })
    .max(32, { error: copy.invalidPhone }),
  email: z.string().refine(
    (value) => value === "" || isValidEmail(value),
    { error: copy.invalidEmail }
  ),
});

/** Client-side guardrails; the backend stays the source of truth. */
export function validateForm(values: CustomerFormValues): string | null {
  const result = customerFormSchema.safeParse(values);
  if (result.success) return null;
  return firstIssueMessage(result.error);
}
