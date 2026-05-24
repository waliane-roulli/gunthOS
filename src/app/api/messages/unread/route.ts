export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, messageReads } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { and, eq, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/messages/unread
// Counts unread messages per sender using server-side read receipts
export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const myId = session.user.id;

  // Single query: for each sender, count messages newer than our read receipt
  // Uses a LEFT JOIN so senders with no receipt get read_at = 0 (epoch)
  const rows = db().all<{ from_user_id: string; unread: number }>(sql`
    SELECT
      m.from_user_id,
      COUNT(*) AS unread
    FROM messages m
    LEFT JOIN message_reads r
      ON r.user_id = ${myId}
      AND r.contact_id = m.from_user_id
    WHERE
      m.to_user_id = ${myId}
      AND m.created_at > COALESCE(r.read_at, 0)
    GROUP BY m.from_user_id
    HAVING COUNT(*) > 0
  `);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.from_user_id] = row.unread;
  }

  return NextResponse.json({ counts });
}
