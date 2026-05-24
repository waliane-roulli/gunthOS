export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthComments, linkedGunthCommentLikes, linkedGunthPosts, user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { and, eq, isNull, asc } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest, notify } from "@/lib/api-utils";
import { BOT_COMMENTERS, BOT_COMMENTS, BOT_REPLIES } from "@/lib/linked-gunth-constants";

function maybeAddBotComment(postId: number) {
  const botRows = db()
    .select({ botName: linkedGunthComments.botName })
    .from(linkedGunthComments)
    .where(and(eq(linkedGunthComments.postId, postId), isNull(linkedGunthComments.authorId)))
    .all();

  if (botRows.length >= 3 || Math.random() > 0.6) return;

  const usedBots = new Set(botRows.map((r) => r.botName));
  const available = BOT_COMMENTERS.filter((b) => !usedBots.has(b.name));
  if (!available.length) return;

  const bot = available[Math.floor(Math.random() * available.length)]!;
  const content = BOT_COMMENTS[Math.floor(Math.random() * BOT_COMMENTS.length)]!;
  db().insert(linkedGunthComments).values({
    postId,
    botName: bot.name,
    botAvatar: bot.avatar,
    content,
    likes: Math.floor(Math.random() * 12),
  }).run();
}

// GET /api/linked-gunth/comments?postId=X
export async function GET(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const myId = session?.user?.id ?? null;

  const { searchParams } = new URL(req.url);
  const postId = Number(searchParams.get("postId"));
  if (!postId) return badRequest("postId requis");

  const post = db().select({ id: linkedGunthPosts.id }).from(linkedGunthPosts).where(eq(linkedGunthPosts.id, postId)).get();
  if (!post) return notFound("Post introuvable");

  maybeAddBotComment(postId);

  const comments = db()
    .select({
      id: linkedGunthComments.id,
      postId: linkedGunthComments.postId,
      authorId: linkedGunthComments.authorId,
      botName: linkedGunthComments.botName,
      botAvatar: linkedGunthComments.botAvatar,
      content: linkedGunthComments.content,
      parentId: linkedGunthComments.parentId,
      likes: linkedGunthComments.likes,
      createdAt: linkedGunthComments.createdAt,
      authorName: user.name,
      authorAvatar: user.avatarDataUrl,
    })
    .from(linkedGunthComments)
    .leftJoin(user, eq(linkedGunthComments.authorId, user.id))
    .where(eq(linkedGunthComments.postId, postId))
    .orderBy(asc(linkedGunthComments.createdAt))
    .all();

  const myLikes = myId
    ? db()
        .select({ commentId: linkedGunthCommentLikes.commentId })
        .from(linkedGunthCommentLikes)
        .where(eq(linkedGunthCommentLikes.userId, myId))
        .all()
        .map((r) => r.commentId)
    : [];

  const myLikeSet = new Set(myLikes);
  return NextResponse.json({ comments: comments.map((c) => ({ ...c, iLiked: myLikeSet.has(c.id) })) });
}

// POST /api/linked-gunth/comments  { postId, content, parentId? }
export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { postId?: number; content?: string; parentId?: number | null };
  const { postId, content, parentId = null } = body;

  if (!postId || !content?.trim() || content.trim().length > 500) {
    return badRequest("Paramètres invalides");
  }

  const post = db()
    .select({ id: linkedGunthPosts.id, authorId: linkedGunthPosts.authorId })
    .from(linkedGunthPosts)
    .where(eq(linkedGunthPosts.id, postId))
    .get();
  if (!post) return notFound("Post introuvable");

  const comment = db()
    .insert(linkedGunthComments)
    .values({ postId, authorId: session.user.id, content: content.trim(), parentId: parentId ?? null })
    .returning()
    .get();

  if (post.authorId && post.authorId !== session.user.id) {
    notify(post.authorId, `${session.user.name} a commenté votre post`, "💬");
  }

  if (!parentId && Math.random() > 0.4) {
    const bot = BOT_COMMENTERS[Math.floor(Math.random() * BOT_COMMENTERS.length)]!;
    const replyContent = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]!;
    db().insert(linkedGunthComments).values({
      postId,
      botName: bot.name,
      botAvatar: bot.avatar,
      content: replyContent,
      parentId: comment.id,
      likes: Math.floor(Math.random() * 5),
    }).run();
  }

  return NextResponse.json({ comment }, { status: 201 });
}

// PATCH /api/linked-gunth/comments  { commentId }  — toggle like
export async function PATCH(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { commentId?: number };
  const { commentId } = body;
  if (!commentId) return badRequest("commentId requis");

  const comment = db()
    .select({ id: linkedGunthComments.id, likes: linkedGunthComments.likes })
    .from(linkedGunthComments)
    .where(eq(linkedGunthComments.id, commentId))
    .get();
  if (!comment) return notFound("Commentaire introuvable");

  const existing = db()
    .select({ id: linkedGunthCommentLikes.id })
    .from(linkedGunthCommentLikes)
    .where(and(eq(linkedGunthCommentLikes.commentId, commentId), eq(linkedGunthCommentLikes.userId, session.user.id)))
    .get();

  if (existing) {
    db().delete(linkedGunthCommentLikes).where(eq(linkedGunthCommentLikes.id, existing.id)).run();
    db().update(linkedGunthComments).set({ likes: Math.max(0, comment.likes - 1) }).where(eq(linkedGunthComments.id, commentId)).run();
    return NextResponse.json({ liked: false });
  }

  db().insert(linkedGunthCommentLikes).values({ commentId, userId: session.user.id }).run();
  db().update(linkedGunthComments).set({ likes: comment.likes + 1 }).where(eq(linkedGunthComments.id, commentId)).run();
  return NextResponse.json({ liked: true });
}
