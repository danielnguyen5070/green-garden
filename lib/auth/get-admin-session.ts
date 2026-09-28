import "server-only";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth-cookies";
import type { Admin } from "@/types/admin";

/**
 * Verifies the admin session for Server Actions and other server code.
 *
 * Cookie presence alone proves nothing (see `proxy.ts`), so the access token
 * is forwarded to FastAPI `GET /auth/me`, which validates the JWT and that the
 * admin is still active. Any failure returns null: callers must fail closed.
 */
export async function getAdminSession(): Promise<Admin | null> {
  const token = (await cookies()).get(AUTH_ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(getApiUrl("/auth/me"), {
      headers: {
        Accept: "application/json",
        Cookie: `${AUTH_ACCESS_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const admin = (await response.json()) as Admin | null;
    return admin?.is_active ? admin : null;
  } catch {
    return null;
  }
}
