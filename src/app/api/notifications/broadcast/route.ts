export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { broadcast } from "@/lib/sse-broadcaster";
import type { NotifPayload } from "@/lib/sse-broadcaster";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json() as Partial<NotifPayload>;
  if (!body.type || !body.title) {
    return NextResponse.json({ error: "type et title requis" }, { status: 400 });
  }

  const payload: NotifPayload = {
    type: body.type,
    title: body.title,
    message: body.message,
    duration: body.duration ?? 6000,
  };

  const count = broadcast(payload);
  return NextResponse.json({ ok: true, reached: count });
}
