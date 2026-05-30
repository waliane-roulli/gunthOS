export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gunthrankRankings } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as {
    updates: Array<{ id: number; tier: string; sortOrder: number; playedOn?: string | null }>;
  };

  if (!body.updates?.length) return NextResponse.json({ ok: true });

  for (const upd of body.updates) {
    const setData: Record<string, unknown> = { tier: upd.tier, sortOrder: upd.sortOrder, updatedAt: new Date() };
    if (upd.playedOn !== undefined) setData.playedOn = upd.playedOn;
    db()
      .update(gunthrankRankings)
      .set(setData as typeof gunthrankRankings.$inferInsert)
      .where(and(eq(gunthrankRankings.id, upd.id), eq(gunthrankRankings.userId, session.user.id)))
      .run();
  }

  return NextResponse.json({ ok: true });
}
