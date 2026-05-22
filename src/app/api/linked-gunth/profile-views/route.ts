import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthProfileViews, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { badRequest, notify } from "@/lib/api-utils";
import { BOT_VISITORS, BOT_VIEW_INTERVAL_MS, PROFILE_VIEW_DEDUP_MS } from "@/lib/linked-gunth-constants";

// GET /api/linked-gunth/profile-views?userId=X  — récupère les visiteurs récents
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const isOwner = session?.user?.id === userId;

  const oneHourAgo = new Date(Date.now() - BOT_VIEW_INTERVAL_MS);
  const recentBotView = db()
    .select({ id: linkedGunthProfileViews.id })
    .from(linkedGunthProfileViews)
    .where(and(
      eq(linkedGunthProfileViews.profileUserId, userId),
      gte(linkedGunthProfileViews.viewedAt, oneHourAgo),
    ))
    .get();

  if (!recentBotView && Math.random() > 0.3) {
    const bot = BOT_VISITORS[Math.floor(Math.random() * BOT_VISITORS.length)]!;
    db().insert(linkedGunthProfileViews).values({
      profileUserId: userId,
      botName: bot.name,
      botTitle: bot.title,
      botEmoji: bot.emoji,
    }).run();
  }

  const views = db()
    .select({
      id: linkedGunthProfileViews.id,
      profileUserId: linkedGunthProfileViews.profileUserId,
      viewerUserId: linkedGunthProfileViews.viewerUserId,
      botName: linkedGunthProfileViews.botName,
      botTitle: linkedGunthProfileViews.botTitle,
      botEmoji: linkedGunthProfileViews.botEmoji,
      viewedAt: linkedGunthProfileViews.viewedAt,
      viewerName: user.name,
      viewerUsername: user.username,
    })
    .from(linkedGunthProfileViews)
    .leftJoin(user, eq(linkedGunthProfileViews.viewerUserId, user.id))
    .where(eq(linkedGunthProfileViews.profileUserId, userId))
    .orderBy(desc(linkedGunthProfileViews.viewedAt))
    .limit(20)
    .all();

  if (!isOwner) {
    return NextResponse.json({ total: views.length, preview: views.slice(0, 3) });
  }

  const viewsWithNames = views.map((v) => ({
    ...v,
    viewerName: v.viewerUserId ? (v.viewerName ?? "Utilisateur") : v.botName,
    viewerUsername: v.viewerUserId ? v.viewerUsername : null,
  }));

  return NextResponse.json({ total: views.length, views: viewsWithNames });
}

// POST /api/linked-gunth/profile-views  { profileUserId }  — enregistrer une visite (vrais users)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ ok: true });

  const body = await req.json() as { profileUserId?: string };
  if (!body.profileUserId || body.profileUserId === session.user.id) {
    return NextResponse.json({ ok: true });
  }

  const oneDayAgo = new Date(Date.now() - PROFILE_VIEW_DEDUP_MS);
  const alreadyViewed = db()
    .select({ id: linkedGunthProfileViews.id })
    .from(linkedGunthProfileViews)
    .where(and(
      eq(linkedGunthProfileViews.profileUserId, body.profileUserId),
      eq(linkedGunthProfileViews.viewerUserId, session.user.id),
      gte(linkedGunthProfileViews.viewedAt, oneDayAgo),
    ))
    .get();

  if (!alreadyViewed) {
    db().insert(linkedGunthProfileViews).values({
      profileUserId: body.profileUserId,
      viewerUserId: session.user.id,
    }).run();
    notify(body.profileUserId, "Quelqu'un a consulté votre profil", "👀");
  }

  return NextResponse.json({ ok: true });
}
