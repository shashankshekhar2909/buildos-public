import { NextResponse } from "next/server";
import { headers } from "next/headers";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";
  const requestUrl = new URL(request.url);
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host") || h.get("host") || requestUrl.host;
  const forwardedProto = h.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const hostOnly = forwardedHost.split(":")[0];
  const fallbackHost =
    hostOnly === "0.0.0.0" || hostOnly === "localhost" || hostOnly === "127.0.0.1"
      ? "172.17.0.1"
      : hostOnly;
  const backend =
    process.env.BUILDOS_BACKEND_URL ||
    `${forwardedProto}://${fallbackHost}:8012`;
  const authRes = await fetch(`${backend}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!authRes.ok) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

  const response = NextResponse.json({ success: true, data: { username } });
  response.cookies.set("buildos_session", username, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
