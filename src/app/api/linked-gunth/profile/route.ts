import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthProfiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, badRequest } from "@/lib/api-utils";

// GET /api/linked-gunth/profile?userId=X
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const profile = db()
    .select()
    .from(linkedGunthProfiles)
    .where(eq(linkedGunthProfiles.userId, userId))
    .get();

  return NextResponse.json(profile ?? { userId, openToWork: false, headline: null, location: null });
}

// PATCH /api/linked-gunth/profile  { openToWork?, headline?, location? }
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { openToWork?: boolean; headline?: string; location?: string };

  const updated = db()
    .insert(linkedGunthProfiles)
    .values({ userId: session.user.id, ...body, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: linkedGunthProfiles.userId,
      set: { ...body, updatedAt: sql`(unixepoch())` },
    })
    .returning()
    .get();

  return NextResponse.json(updated);
}
