export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/fundraiser/new",
    "/admin/:path*",
    "/api/fundraisers",
    "/api/fundraisers/:id/donate",
    "/api/communities/:slug/follow",
    "/api/profiles/:username/follow",
    "/api/profiles/:username/insights",
    "/api/metrics",
  ],
};
