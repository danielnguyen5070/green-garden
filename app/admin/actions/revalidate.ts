"use server";

import { updateTag } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import {
  getStorefrontChangeTags,
  parseStorefrontChange,
} from "@/lib/storefront/revalidate";

/**
 * Expires the storefront's cached catalog data after an admin mutation, so
 * the admin sees their own edit on the next storefront load. FastAPI also
 * notifies `/api/revalidate`; this covers the gap until that arrives.
 *
 * Server Actions are public POST endpoints, so the change is treated as
 * untrusted and the admin session is re-verified here. Failures are logged
 * and never thrown back to the UI so a cache refresh cannot block an edit.
 */
export async function refreshStorefront(change: unknown): Promise<void> {
  const parsed = parseStorefrontChange(change);
  if (!parsed) {
    console.warn("[revalidate] rejected invalid storefront change");
    return;
  }

  const admin = await getAdminSession();
  if (!admin) {
    console.warn("[revalidate] rejected unauthorized storefront refresh");
    return;
  }

  try {
    for (const tag of getStorefrontChangeTags(parsed)) {
      updateTag(tag);
    }
  } catch (error) {
    console.error("[revalidate] storefront refresh failed", error);
  }
}
