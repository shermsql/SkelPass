import { NextResponse } from "next/server";

import { getCurrentSession, listSessions, revokeOtherSessions } from "@/lib/auth";

export async function GET() {
	const session = await getCurrentSession();
	if (!session) {
		return NextResponse.json({ error: "No active session found." }, { status: 401 });
	}

	const sessions = await listSessions(session.userId, session.sessionId);
	return NextResponse.json({ sessions });
}

export async function DELETE() {
	const session = await getCurrentSession();
	if (!session) {
		return NextResponse.json({ error: "No active session found." }, { status: 401 });
	}

	const revoked = await revokeOtherSessions(session.userId, session.sessionId);
	return NextResponse.json({ ok: true, revoked });
}
