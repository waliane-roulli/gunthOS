export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthEndorsements, user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest, notify } from "@/lib/api-utils";
import { VALID_SKILLS } from "@/lib/linked-gunth-constants";

// GET /api/linked-gunth/endorsements?userId=X  — comptages par skill + qui a validé
export async function GET(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const myId = session?.user?.id ?? null;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const rows = db()
    .select({ skillName: linkedGunthEndorsements.skillName, count: count() })
    .from(linkedGunthEndorsements)
    .where(eq(linkedGunthEndorsements.toUserId, userId))
    .groupBy(linkedGunthEndorsements.skillName)
    .all();

  const myEndorsements = myId
    ? db()
        .select({ skillName: linkedGunthEndorsements.skillName })
        .from(linkedGunthEndorsements)
        .where(and(
          eq(linkedGunthEndorsements.fromUserId, myId),
          eq(linkedGunthEndorsements.toUserId, userId),
        ))
        .all()
        .map((r) => r.skillName)
    : [];

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.skillName] = r.count;

  return NextResponse.json({ counts, myEndorsements });
}

// POST /api/linked-gunth/endorsements  { toUserId, skillName }  — toggle endorsement
export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { toUserId?: string; skillName?: string };

  if (!body.toUserId || !body.skillName) return badRequest("Champs requis manquants");
  if (body.toUserId === session.user.id) return badRequest("On ne se valide pas soi-même (sauf en coaching)");
  if (!(VALID_SKILLS as readonly string[]).includes(body.skillName)) return badRequest("Compétence inconnue");

  const target = db().select({ name: user.name }).from(user).where(eq(user.id, body.toUserId)).get();
  if (!target) return notFound("Utilisateur introuvable");

  const existing = db()
    .select({ id: linkedGunthEndorsements.id })
    .from(linkedGunthEndorsements)
    .where(and(
      eq(linkedGunthEndorsements.fromUserId, session.user.id),
      eq(linkedGunthEndorsements.toUserId, body.toUserId),
      eq(linkedGunthEndorsements.skillName, body.skillName),
    ))
    .get();

  if (existing) {
    db().delete(linkedGunthEndorsements).where(eq(linkedGunthEndorsements.id, existing.id)).run();
    return NextResponse.json({ action: "removed" });
  }

  db().insert(linkedGunthEndorsements).values({
    fromUserId: session.user.id,
    toUserId: body.toUserId,
    skillName: body.skillName,
  }).run();

  notify(body.toUserId, `${session.user.name} a validé votre compétence "${body.skillName}"`, "👍");

  return NextResponse.json({ action: "added" });
}
