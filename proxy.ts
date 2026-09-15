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

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request);
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip API, Next internals, and static files
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
