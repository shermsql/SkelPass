import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { getCurrentSession } from "@/lib/auth";
import { getFoldersCollection } from "@/lib/mongodb";

import type { FolderDocument, FolderDto } from "@/lib/types";

function toDto(doc: FolderDocument & { _id: ObjectId }): FolderDto {
  return { id: doc._id.toString(), name: doc.name };
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const folders = await getFoldersCollection();
  const docs = await folders
    .find({ userId: session.userId })
    .sort({ name: 1 })
    .toArray();

  return NextResponse.json({
    folders: docs.map((doc) => toDto(doc as FolderDocument & { _id: ObjectId })),
  });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
    }
    if (name.length > 40) {
      return NextResponse.json(
        { error: "Folder name must be 40 characters or fewer." },
        { status: 400 }
      );
    }

    const folders = await getFoldersCollection();
    const existing = await folders.findOne({
      userId: session.userId,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A folder with this name already exists." },
        { status: 409 }
      );
    }

    const doc: FolderDocument = {
      userId: session.userId,
      name,
      createdAt: new Date(),
    };

    const result = await folders.insertOne(doc);

    return NextResponse.json({
      folder: { id: result.insertedId.toString(), name },
    });
  } catch (error) {
    console.error("Folder create error", error);
    return NextResponse.json(
      { error: "An error occurred while creating the folder." },
      { status: 500 }
    );
  }
}
