export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthReactions, linkedGunthPosts } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest, notify } from "@/lib/api-utils";
import { VALID_REACTIONS, REACTION_ICONS, type Reaction } from "@/lib/linked-gunth-constants";

// POST /api/linked-gunth/reactions  { postId, reaction }
// Toggles: if same reaction exists, removes it; if different, replaces it
export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { postId?: number; reaction?: string };
  const { postId, reaction } = body;

  if (!postId || !reaction || !(VALID_REACTIONS as readonly string[]).includes(reaction)) {
    return badRequest("Paramètres invalides");
  }

  const post = db()
    .select({ id: linkedGunthPosts.id, authorId: linkedGunthPosts.authorId })
    .from(linkedGunthPosts)
    .where(eq(linkedGunthPosts.id, postId))
    .get();
  if (!post) return notFound("Post introuvable");

  const existing = db()
    .select()
    .from(linkedGunthReactions)
    .where(and(eq(linkedGunthReactions.postId, postId), eq(linkedGunthReactions.userId, session.user.id)))
    .get();

  if (existing) {
    if (existing.reaction === reaction) {
      db().delete(linkedGunthReactions).where(eq(linkedGunthReactions.id, existing.id)).run();
      return NextResponse.json({ action: "removed" });
    }
    db().update(linkedGunthReactions)
      .set({ reaction: reaction as Reaction })
      .where(eq(linkedGunthReactions.id, existing.id))
      .run();
    return NextResponse.json({ action: "updated" });
  }

  db().insert(linkedGunthReactions).values({ postId, userId: session.user.id, reaction: reaction as Reaction }).run();

  if (post.authorId && post.authorId !== session.user.id) {
    notify(post.authorId, `${session.user.name} a réagi "${reaction}" à votre post`, REACTION_ICONS[reaction] ?? "💡");
  }

  return NextResponse.json({ action: "added" });
}
