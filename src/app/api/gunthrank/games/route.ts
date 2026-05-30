export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gunthrankGames } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { eq, like } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (q && q.length >= 2) {
    const results = db()
      .select()
      .from(gunthrankGames)
      .where(like(gunthrankGames.name, `%${q}%`))
      .limit(20)
      .all();
    return NextResponse.json({ games: results });
  }
  const all = db().select().from(gunthrankGames).all();
  return NextResponse.json({ games: all });
}

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as {
    igdbId?: number | null;
    name: string;
    slug?: string | null;
    coverUrl?: string | null;
    platforms?: string[] | null;
    genres?: string[] | null;
    releaseDate?: number | null;
    summary?: string | null;
  };

  // Check for existing game by igdbId or name
  if (body.igdbId) {
    const existing = db().select().from(gunthrankGames).where(eq(gunthrankGames.igdbId, body.igdbId)).get();
    if (existing) return NextResponse.json({ game: existing });
  }
  const byName = db().select().from(gunthrankGames).where(eq(gunthrankGames.name, body.name)).get();
  if (byName) return NextResponse.json({ game: byName });

  const inserted = db()
    .insert(gunthrankGames)
    .values({
      igdbId: body.igdbId ?? null,
      name: body.name,
      slug: body.slug ?? null,
      coverUrl: body.coverUrl ?? null,
      platforms: body.platforms ? JSON.stringify(body.platforms) : null,
      genres: body.genres ? JSON.stringify(body.genres) : null,
      releaseDate: body.releaseDate ?? null,
      summary: body.summary ?? null,
    })
    .returning()
    .get();

  return NextResponse.json({ game: inserted });
}
