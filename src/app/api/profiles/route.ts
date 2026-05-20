import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/profiles?username=xxx — public profile lookup
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username requis" }, { status: 400 });

  const profile = db()
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      bio: user.bio,
      statusMessage: user.statusMessage,
      avatarDataUrl: user.avatarDataUrl,
      favoriteApp: user.favoriteApp,
      gunthosRank: user.gunthosRank,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.username, username))
    .get();

  if (!profile) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  return NextResponse.json({ profile });
}
