import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { joinRoom, relaySignal, listParticipants } from "@/lib/meet-rooms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/meet/rooms/[roomId]/signal — SSE stream for a participant
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { roomId } = await params;
  const userId = session.user.id;
  const displayName = session.user.name ?? session.user.email ?? userId;

  let cleanup: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const doCleanup = () => {
    if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
    cleanup?.();
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const writer = (data: string) => {
        controller.enqueue(encoder.encode(data));
      };

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          doCleanup();
        }
      }, 25_000);

      cleanup = joinRoom(roomId, { userId, displayName, joinedAt: Date.now() }, writer);
    },
    cancel() {
      doCleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// POST /api/meet/rooms/[roomId]/signal — relay a WebRTC signal
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await params;
  const body = await req.json();
  const { to, type, payload } = body;

  const VALID_TYPES = ["offer", "answer", "ice-candidate"] as const;
  if (!to || !type || payload === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid signal type" }, { status: 400 });
  }

  const sent = relaySignal(roomId, {
    from: session.user.id,
    to,
    type,
    payload,
  });

  return NextResponse.json({ sent });
}

// HEAD /api/meet/rooms/[roomId]/participants (bonus endpoint)
export async function HEAD(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return new Response(null, { status: 401 });

  const { roomId } = await params;
  const count = listParticipants(roomId).length;
  return new Response(null, { headers: { "X-Participant-Count": String(count) } });
}
