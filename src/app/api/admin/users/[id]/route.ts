import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  return caller?.role === "admin" ? session : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { role } = body as { role: string };

  if (role !== "user" && role !== "admin") {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  await db().update(user).set({ role }).where(eq(user.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  await db().delete(user).where(eq(user.id, id));
  return NextResponse.json({ ok: true });
}
