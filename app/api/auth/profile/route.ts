import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { getCurrentSession } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AVATAR_LENGTH = 2_800_000;

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      update.name = name;
    }

    if (typeof body.email === "string") {
      const email = body.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      const users = await getUsersCollection();
      const existing = await users.findOne({ email });
      if (existing && existing._id.toString() !== session.userId) {
        return NextResponse.json(
          { error: "This email address is already in use." },
          { status: 409 }
        );
      }
      update.email = email;
    }

    if (body.avatarDataUrl === null) {
      update.avatarDataUrl = null;
    } else if (typeof body.avatarDataUrl === "string") {
      if (!body.avatarDataUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Invalid image data." },
          { status: 400 }
        );
      }
      if (body.avatarDataUrl.length > MAX_AVATAR_LENGTH) {
        return NextResponse.json(
          { error: "The selected image is too large. Please choose a smaller one." },
          { status: 400 }
        );
      }
      update.avatarDataUrl = body.avatarDataUrl;
    }

    const users = await getUsersCollection();
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(session.userId) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        name: result.name,
        email: result.email,
        avatarDataUrl: result.avatarDataUrl ?? null,
      },
    });
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json(
      { error: "An error occurred while updating your profile." },
      { status: 500 }
    );
  }
}
