import { NextResponse } from "next/server";
import { shouldUseSecureCookie } from "@/lib/cookie-secure";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const auth0Domain = required("AUTH0_DOMAIN");
  const clientId = required("AUTH0_CLIENT_ID");
  const clientSecret = required("AUTH0_CLIENT_SECRET");
  const baseUrl = required("APP_BASE_URL");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=missing_code", baseUrl));
  }

  const stateCookie = request.headers.get("cookie")?.match(/(?:^|;\s*)buildos_oauth_state=([^;]+)/)?.[1];
  if (!stateCookie || decodeURIComponent(stateCookie) !== state) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", baseUrl));
  }

  const tokenRes = await fetch(`https://${auth0Domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${baseUrl}/api/auth/callback`,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=token_exchange_failed", baseUrl));
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    return NextResponse.redirect(new URL("/login?error=no_access_token", baseUrl));
  }

  const returnToCookie = request.headers.get("cookie")?.match(/(?:^|;\s*)buildos_post_login_redirect=([^;]+)/)?.[1];
  const returnTo = returnToCookie ? decodeURIComponent(returnToCookie) : "/";
  const response = NextResponse.redirect(new URL(returnTo.startsWith("/") ? returnTo : "/", baseUrl));
  const secure = shouldUseSecureCookie();
  response.cookies.set("buildos_access_token", tokenJson.access_token, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("buildos_session", "1", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("buildos_oauth_state", "", { path: "/", maxAge: 0 });
  response.cookies.set("buildos_post_login_redirect", "", { path: "/", maxAge: 0 });
  return response;
}
