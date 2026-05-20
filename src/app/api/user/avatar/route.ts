import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const MAX_SIZE = 400 * 1024; // 400KB base64

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { dataUrl } = await req.json() as { dataUrl?: string };
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Image invalide" }, { status: 400 });
    }

    const base64 = dataUrl.split(",")[1] ?? "";
    if (Buffer.byteLength(base64, "base64") > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop lourde (max 400KB)" }, { status: 413 });
    }

    db().update(user)
      .set({ avatarDataUrl: dataUrl, updatedAt: new Date() })
      .where(eq(user.id, session.user.id))
      .run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("avatar POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    db().update(user)
      .set({ avatarDataUrl: null, updatedAt: new Date() })
      .where(eq(user.id, session.user.id))
      .run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("avatar DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
