export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const buffer = await req.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Validate SQLite magic header: "SQLite format 3\000"
  const magic = "SQLite format 3\0";
  for (let i = 0; i < magic.length; i++) {
    if (bytes[i] !== magic.charCodeAt(i)) {
      return NextResponse.json({ error: "Fichier invalide (pas une DB SQLite)" }, { status: 400 });
    }
  }

  const backupPath = DB_PATH + ".bak";
  fs.copyFileSync(DB_PATH, backupPath);
  fs.writeFileSync(DB_PATH, bytes);

  return NextResponse.json({ ok: true });
}
