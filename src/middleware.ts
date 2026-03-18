import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware that checks for an auth session cookie.
 * Redirects unauthenticated users to login for protected page routes.
 * API route auth is handled in each route handler via auth().
 */
export function middleware(request: NextRequest) {
  // Check for session token cookie using exact names (both HTTP and HTTPS prefixes)
  // These cookies are httpOnly and can only be set by the server (NextAuth),
  // so they cannot be forged via document.cookie.
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
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
