"use server";

import { getAdminSession } from "@/lib/auth/get-admin-session";
import { submitPlantToIndexNow } from "@/lib/indexnow";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

function isValidSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_SLUG_LENGTH &&
    SLUG_PATTERN.test(value)
  );
}

/**
 * Fire-and-forget ping after an admin plant mutation. Server Actions are
 * public POST endpoints, so the slug is treated as untrusted and the admin
 * session is re-verified here. Rejections and IndexNow failures are logged
 * and never thrown back to the UI so a search ping cannot block catalog edits.
 *
 * Blog posts have no in-app editor; scripts/CI should call
 * `submitBlogPostToIndexNow` from `@/lib/indexnow` directly.
 */
export async function notifyPlantToIndexNow(slug: unknown): Promise<void> {
  if (!isValidSlug(slug)) {
    console.warn("[IndexNow] rejected invalid plant slug");
    return;
  }

  const admin = await getAdminSession();
  if (!admin) {
    console.warn("[IndexNow] rejected unauthorized plant notify", slug);
    return;
  }

  try {
    await submitPlantToIndexNow(slug);
  } catch (error) {
    console.error("[IndexNow] plant notify failed", slug, error);
  }
}
