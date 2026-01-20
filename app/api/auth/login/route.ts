import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "../../../lib/auth";
import { hitRateLimit } from "../../../lib/rate-limit";
import { getSessionCookieName, signSession } from "../../../lib/session";

const getClientIp = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limiter = hitRateLimit(`login:${ip}`);
  if (!limiter.allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username ?? "";
  const password = body.password ?? "";

  const isValid = await validateCredentials(username, password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signSession({
    username,
    issuedAt: Date.now(),
    nonce: crypto.randomUUID()
  });

  const cookieName = getSessionCookieName();

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  return response;
}
