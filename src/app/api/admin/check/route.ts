export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ isAdmin: false }, { status: 401 });

  const [row] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  return NextResponse.json({ isAdmin: row?.role === "admin" });
}
