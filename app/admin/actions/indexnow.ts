"use server";

import {
  submitBlogPostToIndexNow,
  submitPlantToIndexNow,
} from "@/lib/indexnow";

/**
 * Fire-and-forget helpers for admin mutations. IndexNow failures are logged
 * and never thrown back to the UI so a search ping cannot block catalog edits.
 */
export async function notifyPlantToIndexNow(slug: string): Promise<void> {
  try {
    await submitPlantToIndexNow(slug);
  } catch (error) {
    console.error("[IndexNow] plant notify failed", slug, error);
  }
}

/**
 * Call after a blog MDX post is added or updated (manual/script/CI).
 * There is no in-app blog editor yet, so this is not wired to a UI event.
 */
export async function notifyBlogPostToIndexNow(slug: string): Promise<void> {
  try {
    await submitBlogPostToIndexNow(slug);
  } catch (error) {
    console.error("[IndexNow] blog notify failed", slug, error);
  }
}
