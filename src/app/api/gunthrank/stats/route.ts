export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gunthrankRankings, gunthrankGames } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized } from "@/lib/api-utils";

export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const rankings = db().select().from(gunthrankRankings).where(eq(gunthrankRankings.userId, session.user.id)).all();
  const gameIds = [...new Set(rankings.map((r) => r.gameId))];
  const games = gameIds.length > 0 ? db().select().from(gunthrankGames).all() : [];
  const gameMap = new Map(games.map((g) => [g.id, g]));

  const platformCounts: Record<string, number> = {};
  const genreCounts: Record<string, number> = {};
  const tierCounts: Record<string, number> = { diamond: 0, gold: 0, silver: 0, bronze: 0, banger: 0, caca: 0 };
  let totalNotes = 0;
  let noteCount = 0;

  for (const r of rankings) {
    tierCounts[r.tier] = (tierCounts[r.tier] ?? 0) + 1;
    if (r.objectiveNote != null) {
      totalNotes += r.objectiveNote;
      noteCount++;
    }

    const game = gameMap.get(r.gameId);
    if (game) {
      const platforms: string[] = game.platforms ? JSON.parse(game.platforms) : [];
      for (const p of platforms) {
        platformCounts[p] = (platformCounts[p] ?? 0) + 1;
      }
      const genres: string[] = game.genres ? JSON.parse(game.genres) : [];
      for (const g of genres) {
        genreCounts[g] = (genreCounts[g] ?? 0) + 1;
      }
    }
  }

  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0] ?? null;
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0] ?? null;

  return NextResponse.json({
    totalGames: rankings.length,
    tierDistribution: tierCounts,
    topPlatform: topPlatform ? { name: topPlatform[0], count: topPlatform[1] } : null,
    topGenre: topGenre ? { name: topGenre[0], count: topGenre[1] } : null,
    averageNote: noteCount > 0 ? Math.round((totalNotes / noteCount) * 10) / 10 : null,
    platformCounts,
    genreCounts,
  });
}
