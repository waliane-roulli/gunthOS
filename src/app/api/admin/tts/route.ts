export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { broadcast } from "@/lib/sse-broadcaster";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json() as { text?: string; lang?: string; pitch?: number; rate?: number };
  if (!body.text?.trim()) return NextResponse.json({ error: "text requis" }, { status: 400 });

  const count = broadcast({
    kind: "tts",
    text: body.text.trim(),
    lang: body.lang ?? "fr-FR",
    pitch: body.pitch ?? 1,
    rate: body.rate ?? 1,
  });

  return NextResponse.json({ ok: true, reached: count });
}
