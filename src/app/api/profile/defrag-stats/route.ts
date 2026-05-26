import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defragStats } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/profile/defrag-stats — returns the current user's defrag stats
export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const d = db();
  const rows = await d
    .select()
    .from(defragStats)
    .where(eq(defragStats.userId, session.user.id))
    .orderBy(desc(defragStats.createdAt))
    .all();

  const total = rows.length;
  const wins = rows.filter((r) => r.won).length;
  const last = rows[0] ?? null;

  return NextResponse.json({
    total,
    wins,
    losses: total - wins,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    lastGame: last
      ? { won: last.won, score: last.score, date: last.createdAt }
      : null,
  });
}

// POST /api/profile/defrag-stats — records a game result
export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });

  let body: { won: boolean; score: number; timestamp: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (typeof body.won !== "boolean") {
    return NextResponse.json({ error: "Champ 'won' requis" }, { status: 400 });
  }

  const d = db();
  await d.insert(defragStats).values({
    userId: session?.user?.id ?? null,
    won: body.won,
    score: body.score ?? 0,
    createdAt: body.timestamp ? new Date(body.timestamp) : new Date(),
  });

  return NextResponse.json({ ok: true });
}
