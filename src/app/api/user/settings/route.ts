export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const settingsPatchSchema = z.object({
  themeId: z.string().optional(),
  soundEnabled: z.boolean().optional(),
  masterVolume: z.number().min(0).max(100).optional(),
  ambientVolume: z.number().min(0).max(1).optional(),
  animationsEnabled: z.boolean().optional(),
  scanlinesEnabled: z.boolean().optional(),
  pixelizeEnabled: z.boolean().optional(),
  cursorId: z.string().optional(),
  wallpaperId: z.string().optional(),
  wallpaperOverridden: z.boolean().optional(),
  seenApps: z.array(z.string()).optional(),
  seenAppVersions: z.record(z.string(), z.string()).optional(),
  fontPairId: z.string().optional(),
  fontSize: z.number().min(0.85).max(1.3).optional(),
  soundSchemeId: z.string().optional(),
  performanceModeEnabled: z.boolean().optional(),
  iconThemeId: z.string().optional(),
});

async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const row = db().select().from(userSettings).where(eq(userSettings.userId, session.user.id)).get();
    if (!row) return NextResponse.json({ settings: null });

    return NextResponse.json({ settings: JSON.parse(row.settings) });
  } catch (err) {
    console.error("user settings GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const parsed = settingsPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const existing = db().select().from(userSettings).where(eq(userSettings.userId, session.user.id)).get();

    const merged = existing
      ? { ...JSON.parse(existing.settings), ...parsed.data }
      : parsed.data;

    if (existing) {
      db().update(userSettings)
        .set({ settings: JSON.stringify(merged), updatedAt: new Date() })
        .where(eq(userSettings.userId, session.user.id))
        .run();
    } else {
      db().insert(userSettings)
        .values({ userId: session.user.id, settings: JSON.stringify(merged), updatedAt: new Date() })
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("user settings POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
