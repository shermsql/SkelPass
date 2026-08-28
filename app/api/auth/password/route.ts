import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import bcrypt from "bcryptjs";

import { getCurrentSession } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";
import type { UserDocument } from "@/lib/types";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: "Your new master password must be at least 12 characters long." },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    const user = (await users.findOne({
      _id: new ObjectId(session.userId),
    })) as UserDocument | null;

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return NextResponse.json(
        { error: "Your current password is incorrect." },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await users.updateOne(
      { _id: new ObjectId(session.userId) },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password update error", error);
    return NextResponse.json(
      { error: "An error occurred while updating your password." },
      { status: 500 }
    );
  }
}
