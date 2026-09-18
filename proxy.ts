import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { hasAuthCookies } from "./lib/auth-cookies";

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
