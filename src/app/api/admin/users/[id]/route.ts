import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { id } = await params;
  await db().delete(user).where(eq(user.id, id));
  return NextResponse.json({ ok: true });
}
