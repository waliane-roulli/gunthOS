import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

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
      .where(eq(user.id, session.user.id))
      .get();

    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("user/me GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
