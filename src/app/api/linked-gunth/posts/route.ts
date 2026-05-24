export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthPosts, linkedGunthReactions, linkedGunthComments, user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { BOT_SEED_POSTS, BOT_PERIODIC_POSTS } from "@/lib/bot-posts";
import { unauthorized, badRequest } from "@/lib/api-utils";
import { MIN_BOT_POST_INTERVAL_MS, MAX_POSTS_LIMIT } from "@/lib/linked-gunth-constants";

// ── Seed ───────────────────────────────────────────────────────────────────────

function getBotContentSet(): Set<string> {
  return new Set(
    db()
      .select({ content: linkedGunthPosts.content })
      .from(linkedGunthPosts)
      .where(isNotNull(linkedGunthPosts.botName))
      .all()
      .map((r) => r.content)
  );
}

function seedBotsIfEmpty() {
  const existingContents = getBotContentSet();
  const now = new Date();
  for (const p of BOT_SEED_POSTS) {
    if (existingContents.has(p.content)) continue;
    const postDate = new Date(now.getTime() - p.ageMinutes * 60 * 1000);
    db().insert(linkedGunthPosts).values({
      botName: p.botName,
      botTitle: p.botTitle,
      botAvatar: p.botAvatar,
      content: p.content,
      botReactionCounts: JSON.stringify(p.botReactionCounts),
      createdAt: postDate,
    }).run();
  }
}

function maybeInjectBotPost() {
  const lastBot = db()
    .select({ createdAt: linkedGunthPosts.createdAt })
    .from(linkedGunthPosts)
    .where(isNotNull(linkedGunthPosts.botName))
    .orderBy(desc(linkedGunthPosts.createdAt))
    .limit(1)
    .get();

  if (lastBot && Date.now() - new Date(lastBot.createdAt).getTime() < MIN_BOT_POST_INTERVAL_MS) return;

  const existingContents = getBotContentSet();
  const available = BOT_PERIODIC_POSTS.filter((p) => !existingContents.has(p.content));
  // Once all periodic posts have been shown, reset (allow repeats)
  const pool = available.length > 0 ? available : BOT_PERIODIC_POSTS;
  const template = pool[Math.floor(Math.random() * pool.length)]!;

  db().insert(linkedGunthPosts).values({
    botName: template.botName,
    botTitle: template.botTitle,
    botAvatar: template.botAvatar,
    content: template.content,
    botReactionCounts: JSON.stringify(template.botReactionCounts),
  }).run();
}

// ── GET /api/linked-gunth/posts ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const myId = session?.user?.id ?? null;

  seedBotsIfEmpty();
  maybeInjectBotPost();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), MAX_POSTS_LIMIT);
  const offset = Number(searchParams.get("offset") ?? "0");

  const posts = db()
    .select({
      id: linkedGunthPosts.id,
      authorId: linkedGunthPosts.authorId,
      botName: linkedGunthPosts.botName,
      botTitle: linkedGunthPosts.botTitle,
      botAvatar: linkedGunthPosts.botAvatar,
      botReactionCounts: linkedGunthPosts.botReactionCounts,
      content: linkedGunthPosts.content,
      createdAt: linkedGunthPosts.createdAt,
      authorName: user.name,
      authorUsername: user.username,
      authorAvatar: user.avatarDataUrl,
    })
    .from(linkedGunthPosts)
    .leftJoin(user, eq(linkedGunthPosts.authorId, user.id))
    .orderBy(desc(linkedGunthPosts.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  if (!posts.length) return NextResponse.json({ posts: [] });

  const postIds = posts.map((p) => p.id);

  // Real user reactions aggregated
  const userReactions = db()
    .select({
      postId: linkedGunthReactions.postId,
      reaction: linkedGunthReactions.reaction,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(linkedGunthReactions)
    .where(inArray(linkedGunthReactions.postId, postIds))
    .groupBy(linkedGunthReactions.postId, linkedGunthReactions.reaction)
    .all();

  // My reactions
  const myReactions = myId
    ? db()
        .select({ postId: linkedGunthReactions.postId, reaction: linkedGunthReactions.reaction })
        .from(linkedGunthReactions)
        .where(eq(linkedGunthReactions.userId, myId))
        .all()
        .filter((r) => postIds.includes(r.postId))
    : [];

  const userReactionMap = new Map<number, Record<string, number>>();
  for (const r of userReactions) {
    const m = userReactionMap.get(r.postId) ?? {};
    m[r.reaction] = (m[r.reaction] ?? 0) + r.count;
    userReactionMap.set(r.postId, m);
  }
  const myReactionMap = new Map<number, string>(myReactions.map((r) => [r.postId, r.reaction]));

  // Comment counts per post
  const commentCounts = db()
    .select({
      postId: linkedGunthComments.postId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(linkedGunthComments)
    .where(inArray(linkedGunthComments.postId, postIds))
    .groupBy(linkedGunthComments.postId)
    .all();
  const commentCountMap = new Map<number, number>(commentCounts.map((r) => [r.postId, r.count]));

  const enriched = posts.map((p) => {
    const botCounts: Record<string, number> = p.botReactionCounts ? JSON.parse(p.botReactionCounts) : {};
    const userCounts = userReactionMap.get(p.id) ?? {};
    const reactions: Record<string, number> = { ...botCounts };
    for (const [k, v] of Object.entries(userCounts)) {
      reactions[k] = (reactions[k] ?? 0) + v;
    }
    return {
      id: p.id,
      authorId: p.authorId,
      botName: p.botName,
      botTitle: p.botTitle,
      botAvatar: p.botAvatar,
      content: p.content,
      createdAt: p.createdAt,
      authorName: p.authorName,
      authorUsername: p.authorUsername,
      authorAvatar: p.authorAvatar,
      reactions,
      myReaction: (myReactionMap.get(p.id) ?? null) as string | null,
      commentCount: commentCountMap.get(p.id) ?? 0,
    };
  });

  return NextResponse.json({ posts: enriched });
}

// ── POST /api/linked-gunth/posts (user post) ───────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { content?: string };
  const content = body.content?.trim() ?? "";
  if (!content || content.length > 1000) return badRequest("Contenu invalide (1–1000 caractères)");

  const post = db()
    .insert(linkedGunthPosts)
    .values({ authorId: session.user.id, content })
    .returning()
    .get();

  return NextResponse.json({ post }, { status: 201 });
}
