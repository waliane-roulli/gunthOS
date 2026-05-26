// In-memory room store — survives across requests in the same Node.js process
// Rooms are ephemeral: no DB, no persistence across restarts.

export interface Participant {
  userId: string;
  displayName: string;
  joinedAt: number;
}

export interface SignalMessage {
  from: string;
  to: string;
  type: "offer" | "answer" | "ice-candidate" | "screen-share-state";
  payload: unknown;
}

type Writer = (data: string) => void;

interface Room {
  id: string;
  createdAt: number;
  participants: Map<string, Participant>;
  writers: Map<string, Writer>;
}

const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      createdAt: Date.now(),
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
  participant: Participant,
  writer: Writer
): () => void {
  const room = getOrCreateRoom(roomId);

  // Snapshot participants BEFORE adding the new one (for peer-joined broadcast)
  const existingParticipants = [...room.participants.values()];

  room.participants.set(participant.userId, participant);
  room.writers.set(participant.userId, writer);

  // Notify existing participants that a new peer joined
  for (const p of existingParticipants) {
    const w = room.writers.get(p.userId);
    if (!w) continue;
    try {
      w(`data: ${JSON.stringify({
        kind: "peer-joined",
        participant,
        participants: [...room.participants.values()],
      })}\n\n`);
    } catch {
      room.writers.delete(p.userId);
    }
  }

  // Send the new peer the current participant list (deferred so the SSE stream is open)
  queueMicrotask(() => {
    sendToParticipant(roomId, participant.userId, {
      kind: "room-state",
      participants: [...room.participants.values()],
    });
  });

  return () => leaveRoom(roomId, participant.userId);
}

export function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.participants.delete(userId);
  room.writers.delete(userId);

  broadcastToRoom(roomId, {
    kind: "peer-left",
    userId,
    participants: [...room.participants.values()],
  });

  // Clean up empty rooms after a delay
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
    writer(`data: ${JSON.stringify({ kind: "signal", ...msg })}\n\n`);
    return true;
  } catch {
    return false;
  }
}

export function broadcastToRoom(
  roomId: string,
  payload: Record<string, unknown>,
  excludeUserId?: string
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
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
  payload: Record<string, unknown>
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const writer = room.writers.get(userId);
  if (!writer) return;
  try {
    writer(`data: ${JSON.stringify(payload)}\n\n`);
  } catch {
    room.writers.delete(userId);
  }
}

export function listParticipants(roomId: string): Participant[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return [...room.participants.values()];
}
