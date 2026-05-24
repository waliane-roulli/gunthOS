import { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";
import { subscribe, publishToAll, getListenerCount } from "@/lib/sse-bus";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Non authentifié", { status: 401 });
  }

  const userId = session.user.id;

  // Mark user online when they open an SSE connection
  db().update(user).set({ onlineStatus: "online", lastHeartbeat: new Date() }).where(eq(user.id, userId)).run();
  publishToAll({ type: "status", userId, status: "online" });

  const stream = new ReadableStream({
    start(controller) {
      const encode = (event: import("@/lib/sse-bus").SSEEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      };

      // Send a ping every 25s to keep the connection alive through proxies
      const ping = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": ping\n\n"));
        } catch {
          clearInterval(ping);
        }
      }, 25_000);

      const unsubscribe = subscribe(userId, encode);

      req.signal.addEventListener("abort", () => {
        clearInterval(ping);
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }

        // Only mark offline if this was the last open SSE connection for this user
        if (getListenerCount(userId) === 0) {
          db().update(user).set({ onlineStatus: "offline" }).where(eq(user.id, userId)).run();
          publishToAll({ type: "status", userId, status: "offline" });
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
