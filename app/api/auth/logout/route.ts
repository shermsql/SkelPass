import { NextResponse } from "next/server";

import { getCurrentSession, revokeSession, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const session = await getCurrentSession();
  if (session) {
    await revokeSession(session.userId, session.sessionId);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieOptions.name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
