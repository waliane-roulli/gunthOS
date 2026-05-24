export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { ne } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/user/list  — liste des utilisateurs (hors soi-même)
export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  const query = db()
    .select({ id: user.id, name: user.name, username: user.username, avatarDataUrl: user.avatarDataUrl });

  const rows = session?.user?.id
    ? query.from(user).where(ne(user.id, session.user.id)).all()
    : query.from(user).all();

  return NextResponse.json({ users: rows });
}
