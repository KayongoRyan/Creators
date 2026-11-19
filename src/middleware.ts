import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SCOPE = ".next-admin";

export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_PORTAL_SCOPE !== ADMIN_SCOPE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const publicPaths = ["/join", "/login", "/register", "/verify"];
  if (
    publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  const portalPrefixes = ["/admin", "/brand", "/creator", "/apply"];
  const isPortalRoute = portalPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (
    !isPortalRoute &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/platform-event-hub") &&
    !pathname.includes(".")
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};