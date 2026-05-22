import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messageReads } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/messages/read  { contactId: string }
// Upserts a read receipt for the current user / contact pair
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { contactId } = await req.json() as { contactId?: string };
  if (!contactId) return NextResponse.json({ error: "contactId requis" }, { status: 400 });

  const now = new Date();

  db()
    .insert(messageReads)
    .values({ userId: session.user.id, contactId, readAt: now })
    .onConflictDoUpdate({
      target: [messageReads.userId, messageReads.contactId],
      set: { readAt: now },
    })
    .run();

  return NextResponse.json({ ok: true });
}
