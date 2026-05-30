export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appMeta } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const CLIENT_ID = "064v7k0pvgi3glsje5mkm3b8x5qeu7";
const CLIENT_SECRET = "qwza7uzglo1zmsvxcz032e5x6xcjjr";

let cachedToken: string | null = null;
let cachedExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  // In-memory cache (survives within the serverless function lifetime)
  if (cachedToken && Date.now() < cachedExpiresAt - 60_000) return cachedToken;

  try {
    // Try DB cache
    const row = db().select({ value: appMeta.value }).from(appMeta).where(eq(appMeta.key, "igdb_access_token")).get();
    const expRow = db().select({ value: appMeta.value }).from(appMeta).where(eq(appMeta.key, "igdb_token_expires_at")).get();
    if (row && expRow) {
      const expiresAt = parseInt(expRow.value, 10);
      if (Date.now() < expiresAt - 60_000) {
        cachedToken = row.value;
        cachedExpiresAt = expiresAt;
        return row.value;
      }
    }
  } catch { /* DB unavailable, skip cache */ }

  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json() as { access_token: string; expires_in: number };
    const token = data.access_token;
    const expiresAt = Date.now() + data.expires_in * 1000;

    // In-memory cache
    cachedToken = token;
    cachedExpiresAt = expiresAt;

    // Try DB cache (best-effort)
    try {
      db().insert(appMeta).values({ key: "igdb_access_token", value: token }).onConflictDoUpdate({ target: appMeta.key, set: { value: token, updatedAt: new Date() } }).run();
      db().insert(appMeta).values({ key: "igdb_token_expires_at", value: String(expiresAt) }).onConflictDoUpdate({ target: appMeta.key, set: { value: String(expiresAt), updatedAt: new Date() } }).run();
    } catch { /* DB write failed, non-blocking */ }

    return token;
  } catch {
    return null;
  }
}

type IgdbGame = {
  id: number;
  name: string;
  slug?: string;
  cover?: { url: string };
  platforms?: Array<{ name: string }>;
  genres?: Array<{ name: string }>;
  involved_companies?: Array<{ developer: boolean; publisher: boolean; company: { name: string } }>;
  first_release_date?: number;
  summary?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { query?: string; genre?: string; platform?: string; limit?: number };
    const { query, genre, platform } = body;
    const limit = body.limit ?? 20;

    const hasQuery = query && query.trim().length >= 2;

    if (!hasQuery && !genre && !platform) {
      return NextResponse.json({ results: [] });
    }

    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ offline: true, results: [] });
    }

    // Build IGDB query
    const clauses: string[] = [];
    if (hasQuery) clauses.push(`search "${query!.trim()}"`);
    const wheres: string[] = [];
    if (genre) wheres.push(`genres.name = "${genre}"`);
    if (platform) wheres.push(`platforms.name = "${platform}"`);
    // If no search but filters, get top rated
    if (!hasQuery) wheres.push("total_rating_count > 5");

    let bodyStr = "";
    if (clauses.length > 0) bodyStr += clauses.join(" ");
    if (wheres.length > 0) bodyStr += ` where ${wheres.join(" & ")}`;
    bodyStr += " sort total_rating_count desc";
    bodyStr += ` fields name,slug,cover.url,platforms.name,genres.name,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,first_release_date,summary; limit ${limit};`;

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: bodyStr,
    });

    if (!igdbRes.ok) {
      return NextResponse.json({ offline: true, results: [] });
    }

    const raw = await igdbRes.json() as IgdbGame[];

    const results = raw.map((g) => ({
      igdbId: g.id,
      name: g.name,
      slug: g.slug ?? null,
      coverUrl: g.cover?.url
        ? g.cover.url.replace(/^\/\//, "https://").replace("t_thumb", "t_cover_big")
        : null,
      platforms: g.platforms?.map((p) => p.name) ?? [],
      genres: g.genres?.map((g2) => g2.name) ?? [],
      publishers: g.involved_companies
        ? [...new Set(g.involved_companies.filter((c) => c.publisher).map((c) => c.company.name))]
        : [],
      developers: g.involved_companies
        ? [...new Set(g.involved_companies.filter((c) => c.developer).map((c) => c.company.name))]
        : [],
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
