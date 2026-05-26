import type { GreenPowerupId, RelicId, ClassId, UpgradeId } from "./roguelite";

export type { GreenPowerupId, RelicId, ClassId, UpgradeId };

// Ordered by rendering priority (first match wins in drawPegs)
export type PegType = "warp" | "boss" | "bomb" | "armor" | "orange" | "green" | "normal";

export function getPegType(p: { warpId?: number; boss: boolean; bomb: boolean; armorHits: number; orange: boolean; green: boolean }): PegType {
  if (p.warpId !== undefined) return "warp";
  if (p.boss) return "boss";
  if (p.bomb) return "bomb";
  if (p.armorHits > 0) return "armor";
  if (p.orange) return "orange";
  if (p.green) return "green";
  return "normal";
}

export interface Peg {
  x: number;
  y: number;
  hit: boolean;
  orange: boolean;
  green: boolean;
  bomb: boolean;
  boss: boolean;
  armorHits: number;
  hitCooldown: number;
  warpId?: number;
  greenPowerup?: GreenPowerupId;
  popping: boolean;
  popAlpha: number;
  scale: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  trail: { x: number; y: number; speed: number }[];
  trailHead: number; // ring buffer write pointer (oldest slot)
  tint?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
  combo: boolean;
  fontSize?: number;
}

export interface Star {
  x: number;
  y: number;
  layer: 0 | 1 | 2;
  size: number;
  phase: number;
}

// ─── Décor (éléments non-poppables) ─────────────────────────────────────────

export interface DecorBumper {
  kind: "bumper";
  x: number; y: number; r: number;
  flashFrames: number;
  color: string;
}

export interface DecorPlank {
  kind: "plank";
  x: number; y: number;
  len: number;
  thickness: number;
  angle: number;
  flashFrames: number;
  color: string;
  // Precomputed endpoints — set once by makeInitialState, avoids cos/sin every substep
  ax?: number; ay?: number; ex?: number; ey?: number;
}

export interface DecorArc {
  kind: "arc";
  x: number; y: number; r: number;
  startAngle: number; endAngle: number;
  thickness: number;
  flashFrames: number;
  color: string;
}

export interface DecorSpike {
  kind: "spike";
  x: number; y: number;
  size: number;
  angle: number;
  flashFrames: number;
  color: string;
}

export type Decor = DecorBumper | DecorPlank | DecorArc | DecorSpike;

export interface GameState {
  pegs: Peg[];
  ball: Ball | null;
  extraBalls: Ball[];
  balls: number;
  score: number;
  phase: "aim" | "firing" | "lost" | "won";
  bucket: number;
  bucketDir: number;
  message: string;
  combo: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  feverPulse: number;
  animClock: number;
  bucketFlash: number;
  trauma: number;
  shakeX: number;
  shakeY: number;
  scoreMultiplier: number;
  flashWhite: number;
  slowMoFrames: number;
  zoomLevel: number;
  level: number;
  hitFreezeFrames: number;
  stars: Star[];
  multiballReady: boolean;
  multiballPending: boolean;
  multiballUsed: boolean;
  turnScoreStart: number;
  bonusBucketFlash: number[];
  bonusBucketMults: number[];
  orangeLeft: number;
  warpPairs: [Peg, Peg][];

  runRelics: RelicId[];
  runUpgrades: UpgradeId[];
  runClassId: ClassId;

  effectiveBallR: number;
  effectiveBombR: number;
  effectiveFeverThreshold: number;
  effectiveAimSteps: number;
  effectivePegBounce: number;
  effectiveBucketSpeed: number;

  spookyActive: boolean;
  magnetFrames: number;
  ghostBallActive: boolean;
  phoenixAvailable: boolean;
  lastHitWasOrange: boolean;
  cursedLuckHits: number;
  ballsLostThisLevel: number;

  bossKilledThisLevel: boolean;

  decors: Decor[];
}

export interface UiState {
  balls: number;
  score: number;
  orangeLeft: number;
  orangeTotal: number;
  phase: string;
  message: string;
  combo: number;
  level: number;
  multiballReady: boolean;
  multiballPending: boolean;
  multiballUsed: boolean;
  relics: RelicId[];
  spookyActive: boolean;
  magnetFrames: number;
  bossLevel: boolean;
  stars: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayUsername: string | null;
  name: string;
  score: number;
  won: boolean;
  createdAt: string;
}
