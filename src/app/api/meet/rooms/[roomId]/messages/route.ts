import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { meetMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { broadcastToRoom } from "@/lib/meet-rooms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/meet/rooms/[roomId]/messages — last 100 messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await params;

  const msgs = await db()
    .select()
    .from(meetMessages)
    .where(eq(meetMessages.roomId, roomId))
    .orderBy(asc(meetMessages.createdAt))
    .limit(100);

  return NextResponse.json({
    messages: msgs.map((m) => ({
      ...m,
      createdAt: m.createdAt instanceof Date ? m.createdAt.getTime() : m.createdAt,
    })),
  });
}

// POST /api/meet/rooms/[roomId]/messages — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();

  if (!content) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Too long" }, { status: 400 });

  const id = nanoid();
  const userId = session.user.id;
  const displayName = session.user.name ?? session.user.email ?? userId;
  const createdAt = new Date();

  await db().insert(meetMessages).values({ id, roomId, userId, displayName, content, createdAt });

  const message = { id, roomId, userId, displayName, content, createdAt: createdAt.getTime() };

  broadcastToRoom(roomId, { kind: "chat", message });

  return NextResponse.json({ message });
}
