export type SoundId = "bip" | "pop" | "victory" | "delete";

export type GameEvent =
  | { kind: "sound"; id: SoundId }
  | { kind: "level-won"; bossKilled: boolean }
  | { kind: "level-lost"; score: number }
  | { kind: "iron-will" }
  | { kind: "best-score"; score: number }
  | { kind: "score-submit"; score: number; won: boolean };
