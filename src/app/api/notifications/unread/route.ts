export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";
import { and, eq, count } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ unread: 0 });

  const [row] = db()
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.read, false)))
    .all();

  return NextResponse.json({ unread: row?.count ?? 0 });
}
