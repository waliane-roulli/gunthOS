import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { publish } from "@/lib/sse-bus";

export const dynamic = "force-dynamic";

const VALID_EFFECTS = ["confetti", "bsod", "rain", "shake", "matrix", "heart"] as const;
type Effect = typeof VALID_EFFECTS[number];

export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { toUserId, effect } = body;

  if (!toUserId) return NextResponse.json({ error: "toUserId manquant" }, { status: 400 });
  if (!VALID_EFFECTS.includes(effect)) return NextResponse.json({ error: "Effet invalide" }, { status: 400 });

  publish(toUserId, {
    type: "effect",
    fromUserId: session.user.id,
    toUserId,
    fromName: session.user.name ?? session.user.id,
    effect: effect as Effect,
  });

  return NextResponse.json({ ok: true });
}
