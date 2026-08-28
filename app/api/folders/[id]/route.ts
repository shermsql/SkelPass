import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { getCurrentSession } from "@/lib/auth";
import { getFoldersCollection, getVaultItemsCollection } from "@/lib/mongodb";

import type { FolderDocument } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid folder id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
    }

    const folders = await getFoldersCollection();
    const current = (await folders.findOne({
      _id: new ObjectId(id),
      userId: session.userId,
    })) as FolderDocument | null;

    if (!current) {
      return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    }

    await folders.updateOne({ _id: new ObjectId(id) }, { $set: { name } });

    const items = await getVaultItemsCollection();
    await items.updateMany(
      { userId: session.userId, folder: current.name },
      { $set: { folder: name, updatedAt: new Date() } }
    );

    return NextResponse.json({ folder: { id, name } });
  } catch (error) {
    console.error("Folder rename error", error);
    return NextResponse.json(
      { error: "An error occurred while renaming the folder." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid folder id." }, { status: 400 });
  }

  const folders = await getFoldersCollection();
  const current = (await folders.findOne({
    _id: new ObjectId(id),
    userId: session.userId,
  })) as FolderDocument | null;

  if (!current) {
    return NextResponse.json({ error: "Folder not found." }, { status: 404 });
  }

  await folders.deleteOne({ _id: new ObjectId(id) });

  const items = await getVaultItemsCollection();
  await items.updateMany(
    { userId: session.userId, folder: current.name },
    { $set: { folder: null, updatedAt: new Date() } }
  );

  return NextResponse.json({ ok: true });
}
