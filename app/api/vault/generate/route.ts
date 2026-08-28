import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { generateSecurePassword } from "@/lib/crypto";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "No active session found." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lengthParam = Number(searchParams.get("length"));
  const length =
    Number.isFinite(lengthParam) && lengthParam >= 8 && lengthParam <= 64
      ? lengthParam
      : 20;

  return NextResponse.json({ password: generateSecurePassword(length) });
}
