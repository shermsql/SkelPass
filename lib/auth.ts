import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";

import { cookies } from "next/headers";

import { getSessionsCollection, getUsersCollection } from "./mongodb";
import type { PublicUser, SessionDocument, SessionDto, UserDocument } from "./types";

const SESSION_COOKIE_NAME = "skelpass-session";
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
  sessionId: string;
}

function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: "desktop" | "mobile" | "tablet";
} {
  const ua = userAgent || "";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let device: "desktop" | "mobile" | "tablet" = "desktop";
  if (/ipad|tablet/i.test(ua)) device = "tablet";
  else if (/mobi|android.*mobile/i.test(ua)) device = "mobile";

  return { browser, os, device };
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
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.sessionId === "string"
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        sessionId: payload.sessionId,
      };
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

export async function createSession(
  userId: string,
  email: string,
  request: Request
): Promise<{ token: string; sessionId: string }> {
  const sessionId = randomUUID();
  const userAgent = request.headers.get("user-agent") || "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const { browser, os, device } = parseUserAgent(userAgent);

  const now = new Date();
  const sessions = await getSessionsCollection();

  const doc: SessionDocument = {
    userId,
    sessionId,
    userAgent,
    ip,
    browser,
    os,
    device,
    createdAt: now,
    lastActiveAt: now,
    revokedAt: null,
  };
  await sessions.insertOne(doc);

  const token = await createSessionToken({ userId, email, sessionId });
  return { token, sessionId };
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const sessions = await getSessionsCollection();
  const sessionDoc = (await sessions.findOne({
    sessionId: payload.sessionId,
    userId: payload.userId,
  })) as SessionDocument | null;

  if (!sessionDoc || sessionDoc.revokedAt) {
    return null;
  }

  sessions
    .updateOne(
      { sessionId: payload.sessionId },
      { $set: { lastActiveAt: new Date() } }
    )
    .catch(() => { });

  return payload;
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

export async function listSessions(
  userId: string,
  currentSessionId: string
): Promise<SessionDto[]> {
  const sessions = await getSessionsCollection();
  const docs = (await sessions
    .find({ userId, revokedAt: null })
    .sort({ lastActiveAt: -1 })
    .toArray()) as SessionDocument[];

  return docs.map((doc) => ({
    id: doc.sessionId,
    browser: doc.browser,
    os: doc.os,
    device: doc.device,
    ip: doc.ip,
    createdAt: doc.createdAt.toISOString(),
    lastActiveAt: doc.lastActiveAt.toISOString(),
    current: doc.sessionId === currentSessionId,
  }));
}

export async function revokeSession(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const sessions = await getSessionsCollection();
  const result = await sessions.updateOne(
    { userId, sessionId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string
): Promise<number> {
  const sessions = await getSessionsCollection();
  const result = await sessions.updateMany(
    { userId, sessionId: { $ne: currentSessionId }, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  return result.modifiedCount;
}

export { SESSION_COOKIE_NAME };
