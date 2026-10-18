import { adminCopy } from "@/app/admin/_lib/admin-copy";

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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Client-side guardrails; the backend stays the source of truth. */
export function validateForm(values: CustomerFormValues): string | null {
  if (!values.name || values.name.length > 255) return copy.invalidName;
  if (!values.phone || values.phone.length > 32) return copy.invalidPhone;
  // Email is optional, but must be well-formed when provided.
  if (values.email && !isValidEmail(values.email)) return copy.invalidEmail;
  return null;
}
