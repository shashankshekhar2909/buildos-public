import { NextResponse } from "next/server";
import { shouldUseSecureCookie } from "@/lib/cookie-secure";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const secure = shouldUseSecureCookie();
  const authMode = (process.env.NEXT_PUBLIC_AUTH_MODE || "local").toLowerCase();
  response.cookies.set("buildos_session", "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set("buildos_access_token", "", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set("buildos_oauth_state", "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set("buildos_post_login_redirect", "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  if (authMode === "auth0" && process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID && process.env.APP_BASE_URL) {
    const logout = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
    logout.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID);
    logout.searchParams.set("returnTo", `${process.env.APP_BASE_URL}/login`);
    return NextResponse.json({ success: true, logout_url: logout.toString() });
  }
  return response;
}
