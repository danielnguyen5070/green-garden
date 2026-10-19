import { z } from "zod";

/** Same permissive pattern used by admin customer / order forms. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isNonNegativeAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

/** Required non-empty email. */
export const emailSchema = z
  .string()
  .refine(isValidEmail, { error: "invalid_email" });

/** Optional email: empty string passes; non-empty must be well-formed. */
export const optionalEmailSchema = z.string().refine(
  (value) => value === "" || isValidEmail(value),
  { error: "invalid_email" }
);

/** Required http(s) URL. */
export const httpUrlSchema = z
  .string()
  .refine(isValidHttpUrl, { error: "invalid_url" });

/** Optional http(s) URL: empty passes. */
export const optionalHttpUrlSchema = z.string().refine(
  (value) => value === "" || isValidHttpUrl(value),
  { error: "invalid_url" }
);

/** Non-empty string that parses to a finite number ≥ 0. */
export const nonNegativeAmountSchema = z
  .string()
  .min(1)
  .refine(isNonNegativeAmount, { error: "invalid_amount" });

/** Empty or non-negative amount string. */
export const optionalNonNegativeAmountSchema = z.string().refine(
  (value) => value === "" || isNonNegativeAmount(value),
  { error: "invalid_amount" }
);

/** Non-empty string that parses to a non-negative integer. */
export const nonNegativeIntStringSchema = z.string().refine(
  (value) => {
    if (value.length === 0) return false;
    const n = Number(value);
    return Number.isInteger(n) && n >= 0;
  },
  { error: "invalid_int" }
);

/** Positive integer string (≥ 1). */
export const positiveIntStringSchema = z.string().refine(
  (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1;
  },
  { error: "invalid_quantity" }
);
