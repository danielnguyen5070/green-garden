"use server";

import { getAdminSession } from "@/lib/auth/get-admin-session";
import { submitPlantToIndexNow } from "@/lib/indexnow";
import { isStorefrontSlug } from "@/lib/storefront/slug";

/**
 * Fire-and-forget ping after an admin plant mutation. Server Actions are
 * public POST endpoints, so the slug is treated as untrusted and the admin
 * session is re-verified here. Rejections and IndexNow failures are logged
 * and never thrown back to the UI so a search ping cannot block catalog edits.
 *
 * `previousSlug` is the slug before a rename; an invalid value is dropped so
 * the new URLs are still submitted.
 *
 * Blog posts have no in-app editor; scripts/CI should call
 * `submitBlogPostToIndexNow` from `@/lib/indexnow` directly.
 */
export async function notifyPlantToIndexNow(
  slug: unknown,
  previousSlug?: unknown
): Promise<void> {
  if (!isStorefrontSlug(slug)) {
    console.warn("[IndexNow] rejected invalid plant slug");
    return;
  }

  const admin = await getAdminSession();
  if (!admin) {
    console.warn("[IndexNow] rejected unauthorized plant notify", slug);
    return;
  }

  const oldSlug =
    isStorefrontSlug(previousSlug) && previousSlug !== slug
      ? previousSlug
      : undefined;

  try {
    await submitPlantToIndexNow(slug, oldSlug);
  } catch (error) {
    console.error("[IndexNow] plant notify failed", slug, error);
  }
}
