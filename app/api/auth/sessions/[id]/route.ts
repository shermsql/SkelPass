import { NextResponse } from "next/server";

import { getCurrentSession, revokeSession, sessionCookieOptions } from "@/lib/auth";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
	const session = await getCurrentSession();
	if (!session) {
		return NextResponse.json({ error: "No active session found." }, { status: 401 });
	}

	const { id } = await params;
	const revoked = await revokeSession(session.userId, id);

	if (!revoked) {
		return NextResponse.json({ error: "Session not found." }, { status: 404 });
	}

	const response = NextResponse.json({ ok: true });

	if (id === session.sessionId) {
		response.cookies.set(sessionCookieOptions.name, "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 0,
		});
	}

	return response;
}
