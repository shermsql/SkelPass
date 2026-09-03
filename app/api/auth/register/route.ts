import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { getFoldersCollection, getUsersCollection } from "@/lib/mongodb";
import { createSession, sessionCookieOptions } from "@/lib/auth";

import { DEFAULT_FOLDERS, type FolderDocument, type UserDocument } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Your master password must be at least 12 characters long." },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    const existing = await users.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    const newUser: UserDocument = {
      name,
      email,
      passwordHash,
      avatarDataUrl: null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await users.insertOne(newUser);
    const userId = result.insertedId.toString();

    const folders = await getFoldersCollection();
    const folderDocs: FolderDocument[] = DEFAULT_FOLDERS.map((folderName) => ({
      userId,
      name: folderName,
      createdAt: now,
    }));
    if (folderDocs.length > 0) {
      await folders.insertMany(folderDocs);
    }

    const { token } = await createSession(userId, email, request);

    const response = NextResponse.json({
      user: { id: userId, name, email, avatarDataUrl: null },
    });

    response.cookies.set(sessionCookieOptions.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionCookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your account." },
      { status: 500 }
    );
  }
}
