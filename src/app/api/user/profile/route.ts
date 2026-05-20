import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const profilePatchSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  bio: z.string().max(280).optional(),
  statusMessage: z.string().max(80).optional(),
  favoriteApp: z.string().max(40).optional(),
});

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// PATCH /api/user/profile — update own profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const parsed = profilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
    if (parsed.data.statusMessage !== undefined) updates.statusMessage = parsed.data.statusMessage;
    if (parsed.data.favoriteApp !== undefined) updates.favoriteApp = parsed.data.favoriteApp;

    db().update(user).set(updates).where(eq(user.id, session.user.id)).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("profile PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
