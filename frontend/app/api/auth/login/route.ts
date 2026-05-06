import { NextResponse } from "next/server";
import crypto from "crypto";
import { shouldUseSecureCookie } from "@/lib/cookie-secure";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function GET(request: Request) {
  const authMode = (process.env.NEXT_PUBLIC_AUTH_MODE || "local").toLowerCase();
  if (authMode !== "auth0") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const url = new URL(request.url);
  const auth0Domain = required("AUTH0_DOMAIN");
  const clientId = required("AUTH0_CLIENT_ID");
  const baseUrl = required("APP_BASE_URL");
  const audience = process.env.AUTH0_AUDIENCE;
  const scope = process.env.AUTH0_SCOPE || "openid profile email";
  const returnTo = url.searchParams.get("returnTo") || "/";
  const state = crypto.randomBytes(24).toString("hex");
  const nonce = crypto.randomBytes(24).toString("hex");

  const authorizeUrl = new URL(`https://${auth0Domain}/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/callback`);
  authorizeUrl.searchParams.set("scope", scope);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("nonce", nonce);
  if (audience) authorizeUrl.searchParams.set("audience", audience);

  const response = NextResponse.redirect(authorizeUrl);
  const secure = shouldUseSecureCookie();
  response.cookies.set("buildos_oauth_state", state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set("buildos_post_login_redirect", returnTo, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}

type LoginBody = { username?: string; password?: string };

export async function POST(request: Request) {
  const authMode = (process.env.NEXT_PUBLIC_AUTH_MODE || "local").toLowerCase();
  if (authMode !== "local") {
    return NextResponse.json({ success: false, message: "Local login disabled" }, { status: 400 });
  }
  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";
  const backend = process.env.BUILDOS_BACKEND_URL || "http://localhost:8012";
  const tokenRes = await fetch(`${backend}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!tokenRes.ok) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }
  const tokenJson = (await tokenRes.json()) as { data?: { access_token?: string } };
  const token = tokenJson.data?.access_token;
  if (!token) return NextResponse.json({ success: false, message: "No token returned" }, { status: 500 });

  const response = NextResponse.json({ success: true });
  const secure = shouldUseSecureCookie();
  response.cookies.set("buildos_access_token", token, {
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
  return response;
}
