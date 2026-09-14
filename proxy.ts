import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "./lib/auth-session";

const intlMiddleware = createMiddleware(routing);

async function handleAdminAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const admin = await verifyAdminSessionToken(token);
  const authenticated = admin !== null;

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
