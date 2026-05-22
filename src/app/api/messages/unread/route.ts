export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/messages/unread?since=<timestamp>
// Returns count of unread messages per sender since a given timestamp
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sinceRaw = searchParams.get("since");
  const sinceMs = sinceRaw ? Number(sinceRaw) : NaN;
  const sinceDate = Number.isFinite(sinceMs) && sinceMs > 0
    ? new Date(sinceMs)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const myId = session.user.id;

  const rows = db()
    .select({
      fromUserId: messages.fromUserId,
      id: messages.id,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      and(
        eq(messages.toUserId, myId),
        gt(messages.createdAt, sinceDate)
      )
    )
    .all();

  // Group by sender
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.fromUserId] = (counts[row.fromUserId] ?? 0) + 1;
  }

  return NextResponse.json({ counts });
}
