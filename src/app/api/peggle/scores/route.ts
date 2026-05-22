export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { peggleScores, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/peggle/scores — top 10 leaderboard (best score per user)
export async function GET() {
  try {
    const rows = db()
      .select({
        userId: peggleScores.userId,
        username: user.username,
        displayUsername: user.displayUsername,
        name: user.name,
        score: peggleScores.score,
        won: peggleScores.won,
        createdAt: peggleScores.createdAt,
      })
      .from(peggleScores)
      .innerJoin(user, eq(peggleScores.userId, user.id))
      .orderBy(desc(peggleScores.score))
      .limit(50)
      .all();

    // Keep only best score per user
    const seen = new Set<string>();
    const leaderboard = rows
      .filter((r) => {
        if (seen.has(r.userId)) return false;
        seen.add(r.userId);
        return true;
      })
      .slice(0, 10);

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error("peggle GET scores error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/peggle/scores — submit a score (auth required)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json() as { score: number; won: boolean };
    const score = Number(body.score);
    const won = Boolean(body.won);

    if (!Number.isInteger(score) || score < 0 || score > 999999) {
      return NextResponse.json({ error: "Score invalide" }, { status: 400 });
    }

    db().insert(peggleScores).values({
      userId: session.user.id,
      score,
      won,
    }).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("peggle POST scores error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
