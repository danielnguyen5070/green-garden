import { adminCopy } from "@/app/admin/_lib/admin-copy";

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

/** Client-side guardrails; the backend stays the source of truth. */
export function validateForm(values: CategoryFormValues): string | null {
  if (!values.name || values.name.length > 255) {
    return adminCopy.categories.invalidName;
  }
  // Vietnamese name is optional; only its length is constrained.
  if (values.name_vi.length > 255) {
    return adminCopy.categories.invalidNameVi;
  }
  if (!values.slug || values.slug.length > 255) {
    return adminCopy.categories.invalidSlug;
  }

  const sortOrder = Number(values.sort_order);
  if (
    !Number.isInteger(sortOrder) ||
    sortOrder < 0 ||
    values.sort_order.length === 0
  ) {
    return adminCopy.categories.invalidSortOrder;
  }

  if (values.image_url) {
    try {
      const url = new URL(values.image_url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return adminCopy.categories.invalidImageUrl;
      }
    } catch {
      return adminCopy.categories.invalidImageUrl;
    }
  }

  return null;
}
