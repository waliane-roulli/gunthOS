export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthExperiences } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { headers } from "next/headers";
import { unauthorized, notFound, badRequest } from "@/lib/api-utils";

// GET /api/linked-gunth/experiences?userId=X
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const experiences = db()
    .select()
    .from(linkedGunthExperiences)
    .where(eq(linkedGunthExperiences.userId, userId))
    .orderBy(asc(linkedGunthExperiences.startYear))
    .all();

  return NextResponse.json(experiences);
}

// POST /api/linked-gunth/experiences  { title, company, startYear, endYear?, isCurrent?, description? }
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const body = await req.json() as {
    title?: string; company?: string; startYear?: number;
    endYear?: number; isCurrent?: boolean; description?: string;
  };

  if (!body.title?.trim() || !body.company?.trim() || !body.startYear) {
    return badRequest("Champs requis manquants");
  }

  const existingCount = db()
    .select({ id: linkedGunthExperiences.id })
    .from(linkedGunthExperiences)
    .where(eq(linkedGunthExperiences.userId, session.user.id))
    .all().length;

  if (existingCount >= 10) return badRequest("Maximum 10 expériences");

  const inserted = db().insert(linkedGunthExperiences).values({
    userId: session.user.id,
    title: body.title.trim(),
    company: body.company.trim(),
    startYear: body.startYear,
    endYear: body.endYear ?? null,
    isCurrent: body.isCurrent ?? false,
    description: body.description?.trim() ?? null,
  }).returning().get();

  return NextResponse.json(inserted);
}

// DELETE /api/linked-gunth/experiences?id=X
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") ?? "");
  if (!id) return badRequest("id requis");

  const exp = db()
    .select({ userId: linkedGunthExperiences.userId })
    .from(linkedGunthExperiences)
    .where(eq(linkedGunthExperiences.id, id))
    .get();

  if (!exp || exp.userId !== session.user.id) return notFound("Non autorisé");

  db().delete(linkedGunthExperiences).where(eq(linkedGunthExperiences.id, id)).run();
  return NextResponse.json({ ok: true });
}
