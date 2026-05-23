export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupConversations, groupMembers, groupMessages, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, gt, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { publish } from "@/lib/sse-bus";

// GET /api/groups/messages?groupId=<id>&since=<timestamp>
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupIdStr = searchParams.get("groupId");
  const since = searchParams.get("since");

  if (!groupIdStr) return NextResponse.json({ error: "Paramètre 'groupId' manquant" }, { status: 400 });

  const groupId = parseInt(groupIdStr, 10);
  const myId = session.user.id;

  // Vérifier que l'utilisateur est membre du groupe
  const membership = db()
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, myId)))
    .get();

  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const sinceDate = since ? new Date(Number(since)) : new Date(0);

  const rows = db()
    .select({
      id: groupMessages.id,
      groupId: groupMessages.groupId,
      fromUserId: groupMessages.fromUserId,
      fromName: user.name,
      fromDisplayUsername: user.displayUsername,
      fromAvatarDataUrl: user.avatarDataUrl,
      content: groupMessages.content,
      createdAt: groupMessages.createdAt,
    })
    .from(groupMessages)
    .innerJoin(user, eq(groupMessages.fromUserId, user.id))
    .where(and(eq(groupMessages.groupId, groupId), gt(groupMessages.createdAt, sinceDate)))
    .orderBy(desc(groupMessages.createdAt))
    .limit(100)
    .all();

  return NextResponse.json({ messages: rows.reverse() });
}

// POST /api/groups/messages
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { groupId, content } = body as { groupId: number; content: string };

  if (!groupId || !content?.trim()) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  if (content.length > 500) return NextResponse.json({ error: "Message trop long (max 500 caractères)" }, { status: 400 });

  const myId = session.user.id;

  // Vérifier membership
  const membership = db()
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, myId)))
    .get();

  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const group = db().select().from(groupConversations).where(eq(groupConversations.id, groupId)).get();
  if (!group) return NextResponse.json({ error: "Groupe introuvable" }, { status: 404 });

  const msg = db()
    .insert(groupMessages)
    .values({ groupId, fromUserId: myId, content: content.trim() })
    .returning()
    .get();

  // Envoyer SSE à tous les membres sauf l'expéditeur
  const members = db()
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))
    .all();

  for (const member of members) {
    if (member.userId === myId) continue;
    publish(member.userId, {
      type: "group_message",
      groupId,
      groupName: group.name,
      fromUserId: myId,
      fromName: session.user.name,
      messageId: msg.id,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    });
  }

  return NextResponse.json({ message: msg });
}
