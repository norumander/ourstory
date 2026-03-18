import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware that checks for an auth session cookie.
 * Redirects unauthenticated users to login for protected page routes.
 * API route auth is handled in each route handler via auth().
 */
export function middleware(request: NextRequest) {
  // Auth.js v5 uses different cookie prefixes depending on environment
  // HTTP: authjs.session-token
  // HTTPS: __Secure-authjs.session-token
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.includes("session-token") && c.value
  );

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/fundraiser/new",
    "/fundraiser/:id/edit",
    "/fundraiser/:id/donate",
    "/admin/:path*",
  ],
};
