import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrCreateRoom } from "@/lib/meet-rooms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/meet/rooms — create or join a room
export async function POST(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const roomId: string = body.roomId ?? nanoid(8);

  getOrCreateRoom(roomId);

  return NextResponse.json({ roomId });
}
