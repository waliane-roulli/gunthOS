export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthNotifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, badRequest } from "@/lib/api-utils";

// GET /api/linked-gunth/notifications  — liste + unread count
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 });

  const notifications = db()
    .select()
    .from(linkedGunthNotifications)
    .where(eq(linkedGunthNotifications.userId, session.user.id))
    .orderBy(desc(linkedGunthNotifications.createdAt))
    .limit(30)
    .all();

  const unread = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unread });
}

// PATCH /api/linked-gunth/notifications  { id? }  — marquer lu (id=null = tout marquer)
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { id?: number | null };
  const { id } = body;

  if (id == null) {
    db().update(linkedGunthNotifications).set({ read: true }).where(eq(linkedGunthNotifications.userId, session.user.id)).run();
  } else {
    db().update(linkedGunthNotifications).set({ read: true }).where(and(eq(linkedGunthNotifications.id, id), eq(linkedGunthNotifications.userId, session.user.id))).run();
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/linked-gunth/notifications  { id }
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { id?: number };
  const { id } = body;
  if (!id) return badRequest("id requis");

  db().delete(linkedGunthNotifications).where(and(eq(linkedGunthNotifications.id, id), eq(linkedGunthNotifications.userId, session.user.id))).run();
  return NextResponse.json({ ok: true });
}
