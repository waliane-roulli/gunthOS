export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nudges, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { publish } from "@/lib/sse-bus";

// POST /api/messages/nudge — send a real nudge to another user
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { toUserId } = body;

  if (!toUserId) return NextResponse.json({ error: "toUserId manquant" }, { status: 400 });

  const recipient = db().select({ id: user.id, name: user.name }).from(user).where(eq(user.id, toUserId)).get();
  if (!recipient) return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });

  db().insert(nudges).values({ fromUserId: session.user.id, toUserId }).run();

  publish(toUserId, {
    type: "nudge",
    fromUserId: session.user.id,
    toUserId,
    fromName: session.user.name ?? session.user.id,
  });

  return NextResponse.json({ ok: true });
}
