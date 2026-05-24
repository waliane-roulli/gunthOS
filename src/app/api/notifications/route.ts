export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { and, eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, badRequest } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 });

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");

  const where = source
    ? and(eq(notifications.userId, session.user.id), eq(notifications.source, source))
    : eq(notifications.userId, session.user.id);

  const items = db()
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(50)
    .all();

  const unread = items.filter((n) => !n.read).length;
  return NextResponse.json({ notifications: items, unread });
}

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as {
    source?: string;
    type?: string;
    title?: string;
    message?: string;
    actionAppSlug?: string;
  };

  if (!body.source || !body.title) return badRequest("source et title requis");

  const [notif] = db()
    .insert(notifications)
    .values({
      userId: session.user.id,
      source: body.source,
      type: (body.type as "info" | "success" | "warning" | "error") ?? "info",
      title: body.title,
      message: body.message ?? null,
      actionAppSlug: body.actionAppSlug ?? null,
    })
    .returning()
    .all();

  return NextResponse.json(notif, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { id?: number | null };
  const { id } = body;

  if (id == null) {
    db().update(notifications).set({ read: true }).where(eq(notifications.userId, session.user.id)).run();
  } else {
    db()
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)))
      .run();
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { id?: number | "all" };
  const { id } = body;

  if (id === "all") {
    db().delete(notifications).where(eq(notifications.userId, session.user.id)).run();
  } else if (id) {
    db()
      .delete(notifications)
      .where(and(eq(notifications.id, Number(id)), eq(notifications.userId, session.user.id)))
      .run();
  } else {
    return badRequest("id requis");
  }

  return NextResponse.json({ ok: true });
}
