import type { NotificationType } from "@/lib/contexts/notification-context";

export interface NotifPayload {
  kind?: "notif";
  type: NotificationType;
  title: string;
  message?: string;
  duration: number | null;
}

export interface TtsPayload {
  kind: "tts";
  text: string;
  lang?: string;
  pitch?: number;
  rate?: number;
}

export interface ReloadPayload {
  kind: "reload";
  version: string;
  changelog?: string;
}

export type BroadcastPayload = NotifPayload | TtsPayload | ReloadPayload;

type Writer = (data: string) => void;

// Module-level singleton — survives across requests in the same Node.js process
const clients = new Set<Writer>();

export function subscribe(writer: Writer): () => void {
  clients.add(writer);
  return () => clients.delete(writer);
}

export function broadcast(payload: BroadcastPayload): number {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  let reached = 0;
  for (const writer of clients) {
    try { writer(data); reached++; } catch { clients.delete(writer); }
  }
  return reached;
}

export function clientCount(): number {
  return clients.size;
}
