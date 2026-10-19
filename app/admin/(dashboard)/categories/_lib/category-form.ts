import { z } from "zod";
import { adminCopy } from "@/app/admin/_lib/admin-copy";
import { firstIssueMessage } from "@/lib/validation/first-issue";
import { isValidHttpUrl } from "@/lib/validation/primitives";

export type CategoryFormValues = {
  name: string;
  name_vi: string;
  slug: string;
  description: string;
  description_vi: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
};

export function readForm(form: HTMLFormElement): CategoryFormValues {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") ?? "").trim(),
    name_vi: String(formData.get("name_vi") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    description_vi: String(formData.get("description_vi") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    sort_order: String(formData.get("sort_order") ?? "").trim(),
    is_active: formData.get("is_active") === "on",
  };
}

const copy = adminCopy.categories;

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, { error: copy.invalidName })
    .max(255, { error: copy.invalidName }),
  name_vi: z.string().max(255, { error: copy.invalidNameVi }),
  slug: z
    .string()
    .min(1, { error: copy.invalidSlug })
    .max(255, { error: copy.invalidSlug }),
  sort_order: z.string().refine(
    (value) => {
      const sortOrder = Number(value);
      return (
        value.length > 0 && Number.isInteger(sortOrder) && sortOrder >= 0
      );
    },
    { error: copy.invalidSortOrder }
  ),
  image_url: z.string().refine(
    (value) => value === "" || isValidHttpUrl(value),
    { error: copy.invalidImageUrl }
  ),
});

/** Client-side guardrails; the backend stays the source of truth. */
export function validateForm(values: CategoryFormValues): string | null {
  const result = categoryFormSchema.safeParse(values);
  if (result.success) return null;
  return firstIssueMessage(result.error);
}
