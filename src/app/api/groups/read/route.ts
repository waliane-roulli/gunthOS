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

  const { groupId } = await req.json() as { groupId: number };
  if (!groupId) return NextResponse.json({ error: "groupId requis" }, { status: 400 });

  const myId = session.user.id;

  const existing = db()
    .select()
    .from(groupMessageReads)
    .where(and(eq(groupMessageReads.userId, myId), eq(groupMessageReads.groupId, groupId)))
    .get();

  if (existing) {
    db()
      .update(groupMessageReads)
      .set({ readAt: new Date() })
      .where(and(eq(groupMessageReads.userId, myId), eq(groupMessageReads.groupId, groupId)))
      .run();
  } else {
    db().insert(groupMessageReads).values({ userId: myId, groupId }).run();
  }

  return NextResponse.json({ ok: true });
}
