export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { gunthrankRankings, gunthrankGames, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ user: null, rankings: [] });
  }

  const targetUser = db()
    .select({ id: user.id, name: user.name, username: user.username })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)
    .get();

  if (!targetUser) {
    return NextResponse.json({ user: null, rankings: [] });
  }

  const rankings = db()
    .select()
    .from(gunthrankRankings)
    .where(eq(gunthrankRankings.userId, targetUser.id))
    .all();

  const gameIds = [...new Set(rankings.map((r) => r.gameId))];
  const games = gameIds.length > 0
    ? db().select().from(gunthrankGames).all()
    : [];
  const gameMap = new Map(games.map((g) => [g.id, g]));

  const enriched = rankings.map((r) => ({
    ...r,
    game: gameMap.get(r.gameId) ?? null,
  }));

  return NextResponse.json({
    user: { id: targetUser.id, name: targetUser.name, username: targetUser.username },
    rankings: enriched,
  });
}
