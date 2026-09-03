import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { getUsersCollection } from "@/lib/mongodb";
import { createSession, sessionCookieOptions } from "@/lib/auth";

import type { UserDocument } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const remember = Boolean(body.remember);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    const user = (await users.findOne({ email })) as UserDocument | null;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const userId = user._id!.toString();
    const { token } = await createSession(userId, user.email, request);

    const response = NextResponse.json({
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        avatarDataUrl: user.avatarDataUrl ?? null,
      },
    });

    response.cookies.set(sessionCookieOptions.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: sessionCookieOptions.maxAge } : {}),
    });

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while signing in." },
      { status: 500 }
    );
  }
}
