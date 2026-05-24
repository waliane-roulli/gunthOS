export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupMembers } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { publish } from "@/lib/sse-bus";

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { groupId } = await req.json() as { groupId: unknown };
  if (!Number.isInteger(groupId) || (groupId as number) <= 0) return NextResponse.json({ error: "groupId invalide" }, { status: 400 });
  const groupIdNum = groupId as number;

  const myId = session.user.id;

  const membership = db()
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupIdNum), eq(groupMembers.userId, myId)))
    .get();

  if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const members = db()
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupIdNum))
    .all();

  for (const member of members) {
    if (member.userId === myId) continue;
    publish(member.userId, {
      type: "group_typing",
      groupId: groupIdNum,
      fromUserId: myId,
      fromName: session.user.name,
    });
  }

  return NextResponse.json({ ok: true });
}
