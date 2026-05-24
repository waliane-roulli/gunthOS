export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthRecommendations, user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest, notify } from "@/lib/api-utils";

// GET /api/linked-gunth/recommendations?userId=X
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const recs = db()
    .select({
      id: linkedGunthRecommendations.id,
      fromUserId: linkedGunthRecommendations.fromUserId,
      content: linkedGunthRecommendations.content,
      relationship: linkedGunthRecommendations.relationship,
      createdAt: linkedGunthRecommendations.createdAt,
      fromName: user.name,
      fromUsername: user.username,
    })
    .from(linkedGunthRecommendations)
    .innerJoin(user, eq(linkedGunthRecommendations.fromUserId, user.id))
    .where(eq(linkedGunthRecommendations.toUserId, userId))
    .orderBy(desc(linkedGunthRecommendations.createdAt))
    .all();

  return NextResponse.json(recs);
}

// POST /api/linked-gunth/recommendations  { toUserId, content, relationship }
export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as { toUserId?: string; content?: string; relationship?: string };

  if (!body.toUserId || !body.content?.trim() || !body.relationship?.trim()) {
    return badRequest("Champs requis manquants");
  }
  if (body.toUserId === session.user.id) {
    return badRequest("On ne se recommande pas soi-même (même sur LinkedGunth)");
  }
  if (body.content.length > 600) {
    return badRequest("Maximum 600 caractères");
  }

  const target = db().select({ id: user.id }).from(user).where(eq(user.id, body.toUserId)).get();
  if (!target) return notFound("Utilisateur introuvable");

  try {
    const [inserted] = db().insert(linkedGunthRecommendations).values({
      fromUserId: session.user.id,
      toUserId: body.toUserId,
      content: body.content.trim(),
      relationship: body.relationship.trim(),
    }).returning().all();

    notify(body.toUserId, `${session.user.name} vous a recommandé sur LinkedGunth`, "🏆");
    return NextResponse.json(inserted);
  } catch {
    return NextResponse.json({ error: "Vous avez déjà recommandé cette personne" }, { status: 409 });
  }
}

// DELETE /api/linked-gunth/recommendations?id=X
export async function DELETE(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") ?? "");
  if (!id) return badRequest("id requis");

  const rec = db()
    .select({ fromUserId: linkedGunthRecommendations.fromUserId, toUserId: linkedGunthRecommendations.toUserId })
    .from(linkedGunthRecommendations)
    .where(eq(linkedGunthRecommendations.id, id))
    .get();

  if (!rec) return notFound();
  if (rec.fromUserId !== session.user.id && rec.toUserId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  db().delete(linkedGunthRecommendations).where(eq(linkedGunthRecommendations.id, id)).run();
  return NextResponse.json({ ok: true });
}
