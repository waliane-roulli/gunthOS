export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, osVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { broadcast } from "@/lib/sse-broadcaster";
import type { ReloadPayload } from "@/lib/sse-broadcaster";

export async function POST(req: Request) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json() as { version?: string; changelog?: string };
  if (!body.version) return NextResponse.json({ error: "version requis" }, { status: 400 });

  let release: { id: number; version: string; changelog: string | null; releasedAt: Date };
  try {
    release = db().insert(osVersions).values({
      version: body.version.trim(),
      changelog: body.changelog?.trim() || null,
      releasedAt: new Date(),
    }).returning().get();
  } catch (err) {
    console.error("[broadcast-version] DB insert failed:", err);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }

  const payload: ReloadPayload = {
    kind: "reload",
    version: body.version,
    changelog: body.changelog,
  };

  const count = broadcast(payload);
  return NextResponse.json({ ok: true, reached: count, release });
}
