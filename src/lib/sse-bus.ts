// In-memory SSE event bus — works in a single Next.js process (dev + single-instance prod)
// Each connected user has a Set of active listener callbacks.

export type SSEEvent =
  | { type: "message"; fromUserId: string; toUserId: string; messageId: number; content: string; createdAt: string; fromName: string }
  | { type: "nudge"; fromUserId: string; toUserId: string; fromName: string }
  | { type: "status"; userId: string; status: "online" | "away" | "busy" | "offline" }
  | { type: "typing"; fromUserId: string; toUserId: string; fromName: string }
  | { type: "effect"; fromUserId: string; toUserId: string; fromName: string; effect: "confetti" | "bsod" | "rain" | "shake" | "matrix" | "heart" }
  | { type: "group_message"; groupId: number; groupName: string; fromUserId: string; fromName: string; messageId: number; content: string; createdAt: string }
  | { type: "group_typing"; groupId: number; fromUserId: string; fromName: string };

type Listener = (event: SSEEvent) => void;

// userId → Set of listeners (one per open SSE connection)
const listeners = new Map<string, Set<Listener>>();

export function subscribe(userId: string, cb: Listener): () => void {
  if (!listeners.has(userId)) listeners.set(userId, new Set());
  listeners.get(userId)!.add(cb);
  return () => {
    const set = listeners.get(userId);
    if (!set) return;
    set.delete(cb);
    if (set.size === 0) listeners.delete(userId);
  };
}

export function publish(toUserId: string, event: SSEEvent): void {
  const set = listeners.get(toUserId);
  if (!set) return;
  for (const cb of set) cb(event);
}

export function publishToAll(event: SSEEvent & { type: "status" }): void {
  for (const set of listeners.values()) {
    for (const cb of set) cb(event);
  }
}

export function getListenerCount(userId: string): number {
  return listeners.get(userId)?.size ?? 0;
}
