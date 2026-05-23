export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupConversations, groupMembers, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/groups — liste les groupes dont l'utilisateur est membre
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const myId = session.user.id;

  const memberships = db()
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, myId))
    .all();

  if (memberships.length === 0) return NextResponse.json({ groups: [] });

  const groupIds = memberships.map(m => m.groupId);

  const groups = db()
    .select()
    .from(groupConversations)
    .where(inArray(groupConversations.id, groupIds))
    .all();

  // Pour chaque groupe, récupérer les membres
  const allMembers = db()
    .select({
      groupId: groupMembers.groupId,
      userId: groupMembers.userId,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      avatarDataUrl: user.avatarDataUrl,
      onlineStatus: user.onlineStatus,
    })
    .from(groupMembers)
    .innerJoin(user, eq(groupMembers.userId, user.id))
    .where(inArray(groupMembers.groupId, groupIds))
    .all();

  const result = groups.map(g => ({
    ...g,
    members: allMembers.filter(m => m.groupId === g.id),
  }));

  return NextResponse.json({ groups: result });
}

// POST /api/groups — créer un groupe
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { name, memberIds } = body as { name: string; memberIds: string[] };

  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return NextResponse.json({ error: "Au moins un membre requis" }, { status: 400 });
  }

  const myId = session.user.id;
  const allMemberIds = Array.from(new Set([myId, ...memberIds]));

  const group = db()
    .insert(groupConversations)
    .values({ name: name.trim(), createdById: myId })
    .returning()
    .get();

  db().insert(groupMembers).values(
    allMemberIds.map(userId => ({ groupId: group.id, userId }))
  ).run();

  const members = db()
    .select({
      groupId: groupMembers.groupId,
      userId: groupMembers.userId,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      avatarDataUrl: user.avatarDataUrl,
      onlineStatus: user.onlineStatus,
    })
    .from(groupMembers)
    .innerJoin(user, eq(groupMembers.userId, user.id))
    .where(eq(groupMembers.groupId, group.id))
    .all();

  return NextResponse.json({ group: { ...group, members } });
}
