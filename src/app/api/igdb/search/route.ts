export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = "064v7k0pvgi3glsje5mkm3b8x5qeu7";
const CLIENT_SECRET = "qwza7uzglo1zmsvxcz032e5x6xcjjr";

let cachedToken: string | null = null;
let cachedExpiresAt = 0;

async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 500));
      }
    }
  }
  throw lastErr;
}

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedExpiresAt - 60_000) return cachedToken;

  try {
    const res = await fetchWithRetry("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });
    if (!res.ok) {
      console.error("Twitch OAuth failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json() as { access_token: string; expires_in: number };
    cachedToken = data.access_token;
    cachedExpiresAt = Date.now() + data.expires_in * 1000;
    console.log("IGDB: token refreshed, expires in", data.expires_in, "s");
    return cachedToken;
  } catch (err) {
    console.error("Twitch OAuth exception:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { query?: string; genre?: string; platform?: string; limit?: number };
  const { query, genre, platform } = body;
  const limit = body.limit ?? 20;
  const hasQuery = query && query.trim().length >= 2;

  if (!hasQuery && !genre && !platform) {
    return NextResponse.json({ results: [] });
  }

  const token = await getAccessToken();
  if (!token) {
    console.error("IGDB: no token");
    return NextResponse.json({ offline: true, results: [] });
  }

  // Build IGDB query
  const parts: string[] = [];
  if (hasQuery) parts.push(`search "${query!.trim()}"`);
  const wheres: string[] = [];
  if (genre) wheres.push(`genres.name = "${genre}"`);
  if (platform) wheres.push(`platforms.name = "${platform}"`);
  if (!hasQuery) wheres.push("total_rating_count > 5");

  let bodyStr = parts.join(" ");
  if (wheres.length > 0) bodyStr += ` where ${wheres.join(" & ")}`;
  bodyStr += `; sort total_rating_count desc; fields name,slug,cover.url,platforms.name,genres.name,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,first_release_date,summary; limit ${limit};`;

  console.log("IGDB query:", bodyStr.substring(0, 200));

  try {
    const igdbRes = await fetchWithRetry("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: bodyStr,
    });

    if (!igdbRes.ok) {
      console.error("IGDB API error", igdbRes.status, await igdbRes.text().catch(() => ""));
      return NextResponse.json({ offline: true, results: [] });
    }

    const raw = await igdbRes.json() as Array<{
      id: number; name: string; slug?: string;
      cover?: { url: string };
      platforms?: Array<{ name: string }>;
      genres?: Array<{ name: string }>;
      involved_companies?: Array<{ developer: boolean; publisher: boolean; company: { name: string } }>;
      first_release_date?: number; summary?: string;
    }>;

    const results = raw.map((g) => ({
      igdbId: g.id,
      name: g.name,
      slug: g.slug ?? null,
      coverUrl: g.cover?.url
        ? `https:${g.cover.url}`.replace("t_thumb", "t_cover_big")
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
  } catch (err) {
    console.error("IGDB exception:", err);
    return NextResponse.json({ offline: true, results: [] });
  }
}
