export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, osVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const rowId = parseInt(id, 10);
  if (isNaN(rowId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const body = await req.json() as { version?: string; changelog?: string | null };
  if (!body.version?.trim()) return NextResponse.json({ error: "version requis" }, { status: 400 });

  const updated = db()
    .update(osVersions)
    .set({ version: body.version.trim(), changelog: body.changelog?.trim() || null })
    .where(eq(osVersions.id, rowId))
    .returning()
    .get();

  if (!updated) return NextResponse.json({ error: "Version introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, release: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const rowId = parseInt(id, 10);
  if (isNaN(rowId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  db().delete(osVersions).where(eq(osVersions.id, rowId)).run();
  return NextResponse.json({ ok: true });
}
