/**
 * Edge-safe admin redirect helpers (usable from proxy and server pages).
 */

export const AUTH_ACCESS_COOKIE = "gg_access_token";
export const AUTH_REFRESH_COOKIE = "gg_refresh_token";

export function hasAuthCookies(
  cookies: { get(name: string): { value: string } | undefined }
): boolean {
  return Boolean(
    cookies.get(AUTH_ACCESS_COOKIE)?.value ||
      cookies.get(AUTH_REFRESH_COOKIE)?.value
  );
}

export function getSafeAdminRedirect(
  redirect: string | null | undefined
): string {
  if (!redirect) return "/admin";
  if (!redirect.startsWith("/admin")) return "/admin";
  if (redirect.startsWith("//")) return "/admin";
  if (redirect.includes("://")) return "/admin";
  if (redirect === "/admin/login" || redirect.startsWith("/admin/login?")) {
    return "/admin";
  }
  return redirect;
}
