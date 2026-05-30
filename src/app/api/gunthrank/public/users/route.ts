export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gunthrankRankings, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const users = db()
    .selectDistinct({ id: user.id, name: user.name, username: user.username })
    .from(user)
    .innerJoin(gunthrankRankings, eq(user.id, gunthrankRankings.userId))
    .all();

  return NextResponse.json({ users });
}
