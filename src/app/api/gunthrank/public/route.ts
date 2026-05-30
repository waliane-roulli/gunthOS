export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gunthrankRankings, gunthrankGames, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const admin = db().select({ id: user.id, name: user.name, username: user.username }).from(user).where(eq(user.role, "admin")).limit(1).get();

  if (!admin) {
    return NextResponse.json({ gunthos: null, rankings: [] });
  }

  const rankings = db().select().from(gunthrankRankings).where(eq(gunthrankRankings.userId, admin.id)).all();
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
    gunthos: { id: admin.id, name: admin.name, username: admin.username },
    rankings: enriched,
  });
}
