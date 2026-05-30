export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appMeta } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const CLIENT_ID = "064v7k0pvgi3glsje5mkm3b8x5qeu7";
const CLIENT_SECRET = "qwza7uzglo1zmsvxcz032e5x6xcjjr";

async function getAccessToken(): Promise<string | null> {
  try {
    const row = db().select({ value: appMeta.value }).from(appMeta).where(eq(appMeta.key, "igdb_access_token")).get();
    const expRow = db().select({ value: appMeta.value }).from(appMeta).where(eq(appMeta.key, "igdb_token_expires_at")).get();
    if (row && expRow) {
      const expiresAt = parseInt(expRow.value, 10);
      if (Date.now() < expiresAt - 60_000) return row.value;
    }

    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json() as { access_token: string; expires_in: number };
    const token = data.access_token;
    const expiresAt = Date.now() + data.expires_in * 1000;

    db().insert(appMeta).values({ key: "igdb_access_token", value: token }).onConflictDoUpdate({ target: appMeta.key, set: { value: token, updatedAt: new Date() } }).run();
    db().insert(appMeta).values({ key: "igdb_token_expires_at", value: String(expiresAt) }).onConflictDoUpdate({ target: appMeta.key, set: { value: String(expiresAt), updatedAt: new Date() } }).run();

    return token;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json() as { query?: string };
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ offline: true, results: [] });
    }

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${query.trim()}"; fields name,slug,cover.url,platforms.name,genres.name,first_release_date,summary; limit 15;`,
    });

    if (!igdbRes.ok) {
      return NextResponse.json({ offline: true, results: [] });
    }

    const raw = await igdbRes.json() as Array<{
      id: number;
      name: string;
      slug?: string;
      cover?: { url: string };
      platforms?: Array<{ name: string }>;
      genres?: Array<{ name: string }>;
      first_release_date?: number;
      summary?: string;
    }>;

    const results = raw.map((g) => ({
      igdbId: g.id,
      name: g.name,
      slug: g.slug ?? null,
      coverUrl: g.cover?.url
        ? g.cover.url.replace(/^\/\//, "https://").replace("t_thumb", "t_cover_big")
        : null,
      platforms: g.platforms?.map((p) => p.name) ?? [],
      genres: g.genres?.map((g2) => g2.name) ?? [],
      releaseYear: g.first_release_date
        ? new Date(g.first_release_date * 1000).getFullYear()
        : null,
      summary: g.summary ?? null,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ offline: true, results: [] });
  }
}
