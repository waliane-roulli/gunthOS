export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { peagleScores, user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq, count } from "drizzle-orm";

async function requireAdmin() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session.user;
}

// GET /api/admin/peagle-scores — top 20 scores + total count
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = db()
    .select({
      userId: peagleScores.userId,
      username: user.username,
      score: peagleScores.score,
      won: peagleScores.won,
      createdAt: peagleScores.createdAt,
    })
    .from(peagleScores)
    .innerJoin(user, eq(peagleScores.userId, user.id))
    .orderBy(desc(peagleScores.score))
    .limit(20)
    .all();

  const totalRow = db()
    .select({ total: count() })
    .from(peagleScores)
    .all();
  const total = totalRow[0]?.total ?? 0;

  return NextResponse.json({ scores: rows, total });
}

// DELETE /api/admin/peagle-scores — wipe all scores
export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db().delete(peagleScores).run();

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/peagle-scores?userId=xxx — wipe scores for one user
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { userId?: string };
  if (!body.userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  db().delete(peagleScores).where(eq(peagleScores.userId, body.userId)).run();

  return NextResponse.json({ ok: true });
}
