import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAge,
  getSafeAdminRedirect,
  verifyAdminSessionToken,
  type AdminUser,
} from "@/lib/auth-session";

/**
 * Admin authentication abstraction (server-only cookie helpers).
 *
 * Temporary development session: httpOnly signed cookie.
 * Replace `authenticateAdminCredentials` and session helpers with real
 * backend auth when available.
 */

export {
  ADMIN_SESSION_COOKIE,
  getSafeAdminRedirect,
  verifyAdminSessionToken,
  type AdminUser,
};

/**
 * Temporary credential check until the backend auth API is connected.
 * Defaults can be overridden with ADMIN_EMAIL / ADMIN_PASSWORD.
 */
export async function authenticateAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const expectedEmail =
    process.env.ADMIN_EMAIL ?? "danielnguyen5070@gmail.com";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "123321";

  if (email !== expectedEmail || password !== expectedPassword) {
    return null;
  }

  return {
    id: "admin",
    email: expectedEmail,
    name: "Admin",
  };
}

export async function createAdminSession(admin: AdminUser): Promise<void> {
  const token = await createAdminSessionToken(admin);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAdminSessionMaxAge(),
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function isAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}
