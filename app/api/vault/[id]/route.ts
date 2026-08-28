import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { getCurrentSession } from "@/lib/auth";

import { getFoldersCollection, getVaultItemsCollection } from "@/lib/mongodb";
import { decryptSecret, encryptSecret, estimatePasswordStrength } from "@/lib/crypto";

import type { VaultItemDocument } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
  }

  const items = await getVaultItemsCollection();
  const doc = (await items.findOne({
    _id: new ObjectId(id),
    userId: session.userId,
  })) as VaultItemDocument | null;

  if (!doc) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  const password = decryptSecret(doc.passwordEncrypted);

  return NextResponse.json({
    item: {
      id,
      service: doc.service,
      website: doc.website,
      username: doc.username,
      folder: doc.folder,
      favorite: doc.favorite,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      password,
      passwordStrength: doc.passwordStrength,
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const update: Partial<VaultItemDocument> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (typeof body.service === "string" && body.service.trim()) {
      update.service = body.service.trim();
    }
    if (typeof body.website === "string") {
      update.website = body.website.trim() || null;
    }
    if (typeof body.username === "string") {
      update.username = body.username.trim() || null;
    }
    if (typeof body.folder === "string") {
      const requestedFolder = body.folder.trim();
      if (!requestedFolder) {
        update.folder = null;
      } else {
        const folders = await getFoldersCollection();
        const match = await folders.findOne({
          userId: session.userId,
          name: requestedFolder,
        });
        update.folder = match ? match.name : null;
      }
    }
    if (typeof body.favorite === "boolean") {
      update.favorite = body.favorite;
    }
    if (typeof body.password === "string" && body.password) {
      update.passwordEncrypted = encryptSecret(body.password);
      update.passwordStrength = estimatePasswordStrength(body.password);
    }

    const items = await getVaultItemsCollection();
    const result = await items.findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.userId },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id,
        service: result.service,
        website: result.website,
        username: result.username,
        folder: result.folder,
        favorite: result.favorite,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        passwordStrength: result.passwordStrength,
      },
    });
  } catch (error) {
    console.error("Vault update error", error);
    return NextResponse.json(
      { error: "An error occurred while updating the entry." },
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
    return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
  }

  const items = await getVaultItemsCollection();
  const result = await items.deleteOne({
    _id: new ObjectId(id),
    userId: session.userId,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
