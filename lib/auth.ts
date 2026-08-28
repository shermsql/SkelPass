import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUsersCollection } from "./mongodb";

import type { PublicUser, UserDocument } from "./types";

const SESSION_COOKIE_NAME = "skelpass_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 Days

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (typeof payload.userId === "string" && typeof payload.email === "string") {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_DURATION_SECONDS,
};

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const users = await getUsersCollection();
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(session.userId)) return null;

  const user = (await users.findOne({
    _id: new ObjectId(session.userId),
  })) as UserDocument | null;

  if (!user) return null;

  return {
    id: session.userId,
    name: user.name,
    email: user.email,
    avatarDataUrl: user.avatarDataUrl ?? null,
  };
}

export { SESSION_COOKIE_NAME };
