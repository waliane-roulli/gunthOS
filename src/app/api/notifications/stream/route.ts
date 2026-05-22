import { subscribe } from "@/lib/sse-broadcaster";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const cleanup = () => {
    if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
    unsubscribe?.();
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          cleanup();
        }
      }, 25_000);

      unsubscribe = subscribe((data) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          cleanup();
        }
      });
    },
    cancel() {
      cleanup();
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
