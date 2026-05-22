import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { hashPassword } = require("better-auth/dist/crypto") as { hashPassword: (pwd: string) => Promise<string> };

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { userId, newPassword } = await req.json();
  if (!userId || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "userId et newPassword (8 car. min) requis" }, { status: 400 });
  }

  const hashed = await hashPassword(newPassword);
  await db()
    .update(account)
    .set({ password: hashed })
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));

  return NextResponse.json({ ok: true });
}
