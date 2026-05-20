import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, or, eq, gt, desc } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/messages?with=<userId>&since=<timestamp>
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");
  const since = searchParams.get("since");

  if (!withUserId) return NextResponse.json({ error: "Paramètre 'with' manquant" }, { status: 400 });

  const myId = session.user.id;
  const sinceDate = since ? new Date(Number(since)) : new Date(0);

  const rows = db()
    .select({
      id: messages.id,
      fromUserId: messages.fromUserId,
      toUserId: messages.toUserId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      and(
        or(
          and(eq(messages.fromUserId, myId), eq(messages.toUserId, withUserId)),
          and(eq(messages.fromUserId, withUserId), eq(messages.toUserId, myId))
        ),
        gt(messages.createdAt, sinceDate)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(100)
    .all();

  return NextResponse.json({ messages: rows.reverse() });
}

// POST /api/messages
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { toUserId, content } = body;

  if (!toUserId || !content?.trim()) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "Message trop long (max 500 caractères)" }, { status: 400 });
  }

  const recipient = db().select({ id: user.id }).from(user).where(eq(user.id, toUserId)).get();
  if (!recipient) return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });

  const msg = db()
    .insert(messages)
    .values({
      fromUserId: session.user.id,
      toUserId,
      content: content.trim(),
    })
    .returning()
    .get();

  return NextResponse.json({ message: msg });
}
