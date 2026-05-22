export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guntherBoardReactions, guntherBoardTickets, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest } from "@/lib/api-utils";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🚀", "👀"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticketId = Number(id);

  const ticket = db().select().from(guntherBoardTickets).where(eq(guntherBoardTickets.id, ticketId)).get();
  if (!ticket) return notFound("Ticket introuvable");

  const rows = db()
    .select({
      id: guntherBoardReactions.id,
      emoji: guntherBoardReactions.emoji,
      userId: guntherBoardReactions.userId,
      userName: user.name,
      userUsername: user.username,
    })
    .from(guntherBoardReactions)
    .leftJoin(user, eq(guntherBoardReactions.userId, user.id))
    .where(eq(guntherBoardReactions.ticketId, ticketId))
    .all();

  // Group by emoji: { "👍": { count, userIds } }
  const grouped: Record<string, { count: number; userIds: string[]; userNames: string[] }> = {};
  for (const r of rows) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, userIds: [], userNames: [] };
    const entry = grouped[r.emoji]!;
    entry.count++;
    entry.userIds.push(r.userId);
    if (r.userName) entry.userNames.push(r.userName);
  }

  return NextResponse.json(grouped);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorized();

  const { id } = await params;
  const ticketId = Number(id);
  const { emoji } = await req.json();

  if (!ALLOWED_EMOJIS.includes(emoji)) return badRequest("Emoji non autorisé");

  const ticket = db().select().from(guntherBoardTickets).where(eq(guntherBoardTickets.id, ticketId)).get();
  if (!ticket) return notFound("Ticket introuvable");

  const existing = db()
    .select()
    .from(guntherBoardReactions)
    .where(and(
      eq(guntherBoardReactions.ticketId, ticketId),
      eq(guntherBoardReactions.userId, session.user.id),
      eq(guntherBoardReactions.emoji, emoji),
    ))
    .get();

  if (existing) {
    // Toggle off
    db().delete(guntherBoardReactions).where(eq(guntherBoardReactions.id, existing.id)).run();
    return NextResponse.json({ action: "removed" });
  }

  db().insert(guntherBoardReactions).values({ ticketId, userId: session.user.id, emoji }).run();
  return NextResponse.json({ action: "added" }, { status: 201 });
}
