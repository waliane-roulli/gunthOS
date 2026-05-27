// Shared types for GunthMeet — used by both client hooks and server-side meet-rooms

// ── Participant state ─────────────────────────────────────────────────────────

export interface ParticipantState {
  userId: string;
  displayName: string;
  joinedAt: number;
  isMuted: boolean;
  isCamOff: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
}

// ── Remote peer (client-side view) ───────────────────────────────────────────

export interface RemotePeer {
  userId: string;
  displayName: string;
  stream: MediaStream | null;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  isMuted: boolean;
  isCamOff: boolean;
  isHost: boolean;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id?: string;
  from: string;
  displayName: string;
  text: string;
  ts: number;
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export type ReactionEmoji = "👍" | "👏" | "✋" | "❤️" | "😂";

export interface Reaction {
  userId: string;
  displayName: string;
  emoji: ReactionEmoji;
  id: string;
}

// ── SSE event payloads (discriminated union) ─────────────────────────────────

export interface SseRoomState {
  kind: "room-state";
  participants: ParticipantState[];
}

export interface SsePeerJoined {
  kind: "peer-joined";
  participant: ParticipantState;
  participants: ParticipantState[];
}

export interface SsePeerLeft {
  kind: "peer-left";
  userId: string;
  participants: ParticipantState[];
}

export interface SseSignal {
  kind: "signal";
  from: string;
  to: string;
  type: SignalType;
  payload: unknown;
}

export interface SseChat {
  kind: "chat";
  message: {
    id: string;
    userId: string;
    displayName: string;
    content: string;
    createdAt: number;
  };
}

export interface SseParticipantUpdate {
  kind: "participant-update";
  participant: ParticipantState;
}

export interface SseReaction {
  kind: "reaction";
  reaction: Reaction;
}

export interface SseHostMutePeer {
  kind: "host-mute-peer";
  targetUserId: string;
}

export interface SseAmbianceSync {
  kind: "ambiance-sync";
  sampleId: string | null; // null = stop
  displayName: string;
}

export type SseEvent =
  | SseRoomState
  | SsePeerJoined
  | SsePeerLeft
  | SseSignal
  | SseChat
  | SseParticipantUpdate
  | SseReaction
  | SseHostMutePeer
  | SseAmbianceSync;

// ── Signal types ──────────────────────────────────────────────────────────────

export type SignalType =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "screen-share-state"
  | "participant-update"
  | "reaction"
  | "host-mute-peer";

export const VALID_SIGNAL_TYPES: SignalType[] = [
  "offer",
  "answer",
  "ice-candidate",
  "screen-share-state",
  "participant-update",
  "reaction",
  "host-mute-peer",
];

// ── Media device ─────────────────────────────────────────────────────────────

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: "audioinput" | "videoinput" | "audiooutput";
}
