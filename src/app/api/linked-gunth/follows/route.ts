import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthFollows, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, count } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest, notify } from "@/lib/api-utils";

// GET /api/linked-gunth/follows?userId=X  — état follow + compteurs
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const myId = session?.user?.id ?? null;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const [followersRow] = db()
    .select({ count: count() })
    .from(linkedGunthFollows)
    .where(eq(linkedGunthFollows.followedId, userId))
    .all();

  const [followingRow] = db()
    .select({ count: count() })
    .from(linkedGunthFollows)
    .where(eq(linkedGunthFollows.followerId, userId))
    .all();

  const isFollowing = myId
    ? !!db()
        .select({ id: linkedGunthFollows.id })
        .from(linkedGunthFollows)
        .where(and(eq(linkedGunthFollows.followerId, myId), eq(linkedGunthFollows.followedId, userId)))
        .get()
    : false;

  return NextResponse.json({
    followers: followersRow?.count ?? 0,
    following: followingRow?.count ?? 0,
    isFollowing,
  });
}

// POST /api/linked-gunth/follows  { followedId }  — toggle follow
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { followedId?: string };
  const { followedId } = body;
  if (!followedId || followedId === session.user.id) return badRequest("Paramètres invalides");

  const target = db().select({ id: user.id }).from(user).where(eq(user.id, followedId)).get();
  if (!target) return notFound("Utilisateur introuvable");

  const existing = db()
    .select({ id: linkedGunthFollows.id })
    .from(linkedGunthFollows)
    .where(and(eq(linkedGunthFollows.followerId, session.user.id), eq(linkedGunthFollows.followedId, followedId)))
    .get();

  if (existing) {
    db().delete(linkedGunthFollows).where(eq(linkedGunthFollows.id, existing.id)).run();
    return NextResponse.json({ action: "unfollowed" });
  }

  db().insert(linkedGunthFollows).values({ followerId: session.user.id, followedId }).run();
  notify(followedId, `${session.user.name} a rejoint votre réseau`, "🤝");

  return NextResponse.json({ action: "followed" });
}
