import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guntherBoardTickets } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound } from "@/lib/api-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = db()
    .select()
    .from(guntherBoardTickets)
    .where(eq(guntherBoardTickets.id, Number(id)))
    .get();

  if (!existing) return notFound("Ticket introuvable");

  const allowed = ["title", "description", "status", "priority", "label", "scope", "assigneeId"] as const;
  const updates: Partial<typeof existing> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) (updates as Record<string, unknown>)[key] = body[key];
  }

  const [updated] = db()
    .update(guntherBoardTickets)
    .set(updates)
    .where(eq(guntherBoardTickets.id, Number(id)))
    .returning()
    .all();

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorized();

  const { id } = await params;

  const existing = db()
    .select()
    .from(guntherBoardTickets)
    .where(eq(guntherBoardTickets.id, Number(id)))
    .get();

  if (!existing) return notFound("Ticket introuvable");

  db().delete(guntherBoardTickets).where(eq(guntherBoardTickets.id, Number(id))).run();

  return NextResponse.json({ ok: true });
}
