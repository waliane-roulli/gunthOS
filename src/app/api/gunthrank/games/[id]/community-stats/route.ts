export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gunthrankRankings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) {
    return NextResponse.json({ avgNote: null, count: 0 });
  }

  const rows = db()
    .select({
      avgNote: sql<number | null>`ROUND(AVG(${gunthrankRankings.objectiveNote}), 1)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(gunthrankRankings)
    .where(eq(gunthrankRankings.gameId, gameId))
    .all();

  const row = rows[0];
  return NextResponse.json({ avgNote: row?.avgNote ?? null, count: row?.count ?? 0 });
}
