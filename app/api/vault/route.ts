import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { getCurrentSession } from "@/lib/auth";
import { getFoldersCollection, getVaultItemsCollection } from "@/lib/mongodb";
import { decryptSecret, encryptSecret, estimatePasswordStrength } from "@/lib/crypto";

import type { VaultItemDocument, VaultItemListDto } from "@/lib/types";

function toListDto(
  doc: VaultItemDocument & { _id: ObjectId }
): VaultItemListDto {
  return {
    id: doc._id.toString(),
    service: doc.service,
    website: doc.website,
    username: doc.username,
    folder: doc.folder,
    favorite: doc.favorite,
    hasNote: doc.noteEncrypted !== null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    passwordStrength: doc.passwordStrength,
  };
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const items = await getVaultItemsCollection();
  const docs = await items
    .find({ userId: session.userId })
    .sort({ updatedAt: -1 })
    .toArray();

  const list = docs.map((doc) =>
    toListDto(doc as VaultItemDocument & { _id: ObjectId })
  );

  return NextResponse.json({ items: list });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const service = typeof body.service === "string" ? body.service.trim() : "";
    const website = typeof body.website === "string" ? body.website.trim() : "";
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const requestedFolder =
      typeof body.folder === "string" && body.folder.trim() ? body.folder.trim() : null;

    if (!service || !password) {
      return NextResponse.json(
        { error: "Service name and password are required." },
        { status: 400 }
      );
    }

    let folder: string | null = null;
    if (requestedFolder) {
      const folders = await getFoldersCollection();
      const match = await folders.findOne({
        userId: session.userId,
        name: requestedFolder,
      });
      folder = match ? match.name : null;
    }

    const now = new Date();
    const doc: VaultItemDocument = {
      userId: session.userId,
      service,
      website: website || null,
      username: username || null,
      passwordEncrypted: encryptSecret(password),
      noteEncrypted: note ? encryptSecret(note) : null,
      passwordStrength: estimatePasswordStrength(password),
      folder,
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };

    const items = await getVaultItemsCollection();
    const result = await items.insertOne(doc);

    return NextResponse.json({
      item: {
        id: result.insertedId.toString(),
        service: doc.service,
        website: doc.website,
        username: doc.username,
        folder: doc.folder,
        favorite: doc.favorite,
        hasNote: doc.noteEncrypted !== null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        passwordStrength: doc.passwordStrength,
        note: doc.noteEncrypted ? decryptSecret(doc.noteEncrypted) : null,
      },
    });
  } catch (error) {
    console.error("Vault create error", error);
    return NextResponse.json(
      { error: "An error occurred while creating the entry." },
      { status: 500 }
    );
  }
}
