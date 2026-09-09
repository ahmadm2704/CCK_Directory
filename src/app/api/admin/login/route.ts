import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE_SECONDS, createSessionToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
