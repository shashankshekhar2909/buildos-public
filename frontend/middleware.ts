import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const session = request.cookies.get("buildos_session")?.value;
  const accessToken = request.cookies.get("buildos_access_token")?.value;
  if (!session || !accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
