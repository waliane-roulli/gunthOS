import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { publish } from "@/lib/sse-bus";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { toUserId } = body;

  if (!toUserId) return NextResponse.json({ error: "toUserId manquant" }, { status: 400 });

  publish(toUserId, {
    type: "typing",
    fromUserId: session.user.id,
    toUserId,
    fromName: session.user.name ?? session.user.id,
  });

  return NextResponse.json({ ok: true });
}
