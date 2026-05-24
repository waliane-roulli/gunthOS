export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const users = await db().select({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  }).from(user).orderBy(user.createdAt);

  const credentials = await db().select({ userId: account.userId })
    .from(account)
    .where(eq(account.providerId, "credential"));

  const credentialSet = new Set(credentials.map((c) => c.userId));

  return NextResponse.json(users.map((u) => ({ ...u, hasCredential: credentialSet.has(u.id) })));
}
