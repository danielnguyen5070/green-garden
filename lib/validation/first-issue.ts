import type { ZodError } from "zod";

/** First Zod issue message (admin forms: single English string). */
export function firstIssueMessage(error: ZodError): string | null {
  return error.issues[0]?.message ?? null;
}

/**
 * Maps each issue's top-level path segment to its message. Later issues for
 * the same field are ignored (first wins), matching checkout/review UX.
 */
export function issuesByField<T extends string>(
  error: ZodError,
  fields: readonly T[]
): Partial<Record<T, string>> {
  const allowed = new Set<string>(fields);
  const out: Partial<Record<T, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || !allowed.has(key)) continue;
    const field = key as T;
    if (out[field] == null) out[field] = issue.message;
  }

  return out;
}
