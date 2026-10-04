import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { hasAuthCookies } from "./lib/auth-cookies";
import { parseLegacyCatalogPage } from "./lib/storefront/catalog";

const intlMiddleware = createMiddleware(routing);

function handleAdminAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  // UX-only gate: FastAPI remains the real security boundary.
  const authenticated = hasAuthCookies(request.cookies);

  if (!authenticated && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";

    if (pathname !== "/admin") {
      loginUrl.searchParams.set("redirect", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && isLoginPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

/** Case-insensitive so next-intl can still fix the casing of `/VI/...`. */
const LOCALE_PREFIX = new RegExp(`^/(?:${routing.locales.join("|")})(?:/|$)`, "i");

const LEGACY_CATALOG_PATH = /^(\/[a-z]{2}\/(?:plants|categories\/[^/]+))\/?$/;

/**
 * Unprefixed paths (`/`, `/plants/x`) belong to the default locale. next-intl
 * redirects them with a temporary 307, which leaves Google treating the bare
 * domain as its own URL; a permanent redirect hands its signals to `/vi`.
 */
function withLocalePrefix(pathname: string): string {
  if (LOCALE_PREFIX.test(pathname)) return pathname;
  return pathname === "/"
    ? `/${routing.defaultLocale}`
    : `/${routing.defaultLocale}${pathname}`;
}

/**
 * Catalog pages moved from `?page=N` to `/page/N`; 308 old links (and any
 * invalid `?page=` value, to the first page) so indexed URLs keep ranking.
 */
function redirectLegacyCatalogPage(request: NextRequest, pathname: string) {
  const { searchParams } = request.nextUrl;
  if (!searchParams.has("page")) return null;

  const match = LEGACY_CATALOG_PATH.exec(pathname);
  if (!match) return null;

  const page = parseLegacyCatalogPage(searchParams.get("page"));
  const url = request.nextUrl.clone();
  url.pathname = page && page > 1 ? `${match[1]}/page/${page}` : match[1];
  url.searchParams.delete("page");
  return NextResponse.redirect(url, 308);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Technical routes must never go through next-intl locale rewriting.
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request);
  }

  // One hop to the final URL, even for an unprefixed legacy `?page=` link.
  const localizedPathname = withLocalePrefix(pathname);

  const legacyRedirect = redirectLegacyCatalogPage(request, localizedPathname);
  if (legacyRedirect) {
    return legacyRedirect;
  }

  if (localizedPathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPathname;
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Run proxy on app routes only. Skip:
     * - /api/*, /trpc/*, /_next/*, /_vercel/*
     * - /sitemap.xml, /robots.txt, /favicon.ico
     * - any path with a file extension (images, IndexNow key .txt, etc.)
     */
    "/((?!api|trpc|_next|_vercel|sitemap\\.xml|robots\\.txt|favicon\\.ico|.*\\..*).*)",
  ],
};
