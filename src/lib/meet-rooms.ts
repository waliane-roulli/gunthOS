// In-memory room store — survives across requests in the same Node.js process
// Rooms are ephemeral: no DB, no persistence across restarts.

import type { ParticipantState, SignalType, SseEvent } from "@/apps/gunth-meet/types";

export type { ParticipantState };

export interface SignalMessage {
  from: string;
  to: string;
  type: SignalType;
  payload: unknown;
}

type Writer = (data: string) => void;

interface Room {
  id: string;
  createdAt: number;
  hostUserId: string | null;
  participants: Map<string, ParticipantState>;
  writers: Map<string, Writer>;
}

const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      createdAt: Date.now(),
      hostUserId: null,
      participants: new Map(),
      writers: new Map(),
    });
  }
  return rooms.get(roomId)!;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(
  roomId: string,
  participant: { userId: string; displayName: string; joinedAt: number },
  writer: Writer
): () => void {
  const room = getOrCreateRoom(roomId);

  const isFirstParticipant = room.participants.size === 0;
  if (isFirstParticipant) room.hostUserId = participant.userId;

  const fullParticipant: ParticipantState = {
    ...participant,
    isMuted: false,
    isCamOff: false,
    isScreenSharing: false,
    isHost: isFirstParticipant,
  };

  const existingParticipants = [...room.participants.values()];
  room.participants.set(participant.userId, fullParticipant);
  room.writers.set(participant.userId, writer);

  // Notify existing participants
  for (const p of existingParticipants) {
    const w = room.writers.get(p.userId);
    if (!w) continue;
    try {
      const event: SseEvent = {
        kind: "peer-joined",
        participant: fullParticipant,
        participants: [...room.participants.values()],
      };
      w(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      room.writers.delete(p.userId);
    }
  }

  // Send the new peer the current room state (deferred so SSE stream is open)
  queueMicrotask(() => {
    const event: SseEvent = {
      kind: "room-state",
      participants: [...room.participants.values()],
    };
    sendToParticipant(roomId, participant.userId, event);
  });

  return () => leaveRoom(roomId, participant.userId);
}

export function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.participants.delete(userId);
  room.writers.delete(userId);

  // Elect new host if the host left
  if (room.hostUserId === userId && room.participants.size > 0) {
    const newHost = [...room.participants.values()][0]!;
    newHost.isHost = true;
    room.hostUserId = newHost.userId;
    const updateEvent: SseEvent = { kind: "participant-update", participant: { ...newHost } };
    broadcastToRoom(roomId, updateEvent);
  }

  const leaveEvent: SseEvent = {
    kind: "peer-left",
    userId,
    participants: [...room.participants.values()],
  };
  broadcastToRoom(roomId, leaveEvent);

  if (room.participants.size === 0) {
    setTimeout(() => {
      const r = rooms.get(roomId);
      if (r && r.participants.size === 0) rooms.delete(roomId);
    }, 30_000);
  }
}

export function relaySignal(roomId: string, msg: SignalMessage): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;
  const writer = room.writers.get(msg.to);
  if (!writer) return false;
  try {
    const event: SseEvent = { kind: "signal", ...msg };
    writer(`data: ${JSON.stringify(event)}\n\n`);
    return true;
  } catch {
    return false;
  }
}

export function broadcastToRoom(
  roomId: string,
  event: SseEvent,
  excludeUserId?: string
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const [userId, writer] of room.writers) {
    if (userId === excludeUserId) continue;
    try {
      writer(data);
    } catch {
      room.writers.delete(userId);
    }
  }
}

export function sendToParticipant(
  roomId: string,
  userId: string,
  event: SseEvent
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const writer = room.writers.get(userId);
  if (!writer) return;
  try {
    writer(`data: ${JSON.stringify(event)}\n\n`);
  } catch {
    room.writers.delete(userId);
  }
}

export function updateParticipantState(
  roomId: string,
  userId: string,
  update: Partial<Pick<ParticipantState, "isMuted" | "isCamOff" | "isScreenSharing">>
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const p = room.participants.get(userId);
  if (!p) return;
  Object.assign(p, update);
  const event: SseEvent = { kind: "participant-update", participant: { ...p } };
  broadcastToRoom(roomId, event, userId);
}

export function listParticipants(roomId: string): ParticipantState[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return [...room.participants.values()];
}

export function getHost(roomId: string): string | null {
  return rooms.get(roomId)?.hostUserId ?? null;
}
