export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groupMessageReads } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { groupId } = await req.json() as { groupId: unknown };
  if (!Number.isInteger(groupId) || (groupId as number) <= 0) return NextResponse.json({ error: "groupId invalide" }, { status: 400 });
  const groupIdNum = groupId as number;

  const myId = session.user.id;

  const existing = db()
    .select()
    .from(groupMessageReads)
    .where(and(eq(groupMessageReads.userId, myId), eq(groupMessageReads.groupId, groupIdNum)))
    .get();

  if (existing) {
    db()
      .update(groupMessageReads)
      .set({ readAt: new Date() })
      .where(and(eq(groupMessageReads.userId, myId), eq(groupMessageReads.groupId, groupIdNum)))
      .run();
  } else {
    db().insert(groupMessageReads).values({ userId: myId, groupId: groupIdNum }).run();
  }

  return NextResponse.json({ ok: true });
}
