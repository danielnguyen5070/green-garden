"use server";

import { redirect } from "next/navigation";
import {
  authenticateAdminCredentials,
  createAdminSession,
  clearAdminSession,
  getSafeAdminRedirect,
} from "@/lib/auth";
import { adminCopy } from "@/lib/admin-copy";

export type AdminLoginState = {
  error?: string;
} | null;

export async function loginAdminAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeAdminRedirect(
    String(formData.get("redirect") ?? "/admin")
  );

  const admin = await authenticateAdminCredentials(email, password);
  if (!admin) {
    return { error: adminCopy.login.error };
  }

  await createAdminSession(admin);
  redirect(redirectTo);
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
