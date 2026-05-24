export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { peagleAnnouncements, user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

async function requireAdmin(session: Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>) {
  if (!session?.user) return "unauth";
  const [row] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  return row?.role === "admin" ? null : "forbidden";
}

// GET /api/peagle/announcements — all announcements, newest first
export async function GET() {
  try {
    const rows = db()
      .select()
      .from(peagleAnnouncements)
      .orderBy(desc(peagleAnnouncements.createdAt))
      .all();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("peagle GET announcements error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/peagle/announcements — create announcement (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    const check = await requireAdmin(session);
    if (check === "unauth") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    if (check === "forbidden") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json() as { title: string; message: string; type?: string };
    const title = String(body.title ?? "").trim();
    const message = String(body.message ?? "").trim();
    const type = (["info", "update", "warning"].includes(body.type ?? "") ? body.type : "info") as "info" | "update" | "warning";

    if (!title || !message) return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });

    const row = db().insert(peagleAnnouncements).values({ title, message, type }).returning().get();
    return NextResponse.json(row);
  } catch (err) {
    console.error("peagle POST announcements error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/peagle/announcements?id=N — delete by id (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    const check = await requireAdmin(session);
    if (check === "unauth") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    if (check === "forbidden") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    db().delete(peagleAnnouncements).where(eq(peagleAnnouncements.id, id)).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("peagle DELETE announcements error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
