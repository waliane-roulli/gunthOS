import type { GreenPowerupId, RelicId, ClassId, UpgradeId } from "./roguelite";

export type { GreenPowerupId, RelicId, ClassId, UpgradeId };

export interface Peg {
  x: number;
  y: number;
  hit: boolean;
  orange: boolean;
  green: boolean;
  bomb: boolean;
  boss: boolean;         // boss peg (appears on every 3rd level)
  armorHits: number;     // 0=none; 1=cracked (1 more hit); init 1 for armor, 4 for boss
  hitCooldown: number;
  warpId?: number;
  greenPowerup?: GreenPowerupId; // power-up type for green pegs
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

  // ─── Roguelite state ──────────────────────────────────────────────────────
  runRelics: RelicId[];
  runUpgrades: UpgradeId[];
  runClassId: ClassId;

  // Effective physics values (derived from class + upgrades)
  effectiveBallR: number;
  effectiveBombR: number;
  effectiveFeverThreshold: number;
  effectiveAimSteps: number;
  effectivePegBounce: number;
  effectiveBucketSpeed: number;

  // Active power-up effects
  spookyActive: boolean;   // green peg spooky was triggered
  magnetFrames: number;    // frames remaining for magnet attraction
  ghostBallActive: boolean;// ghost_ball upgrade: bypass first peg this shot
  phoenixAvailable: boolean; // phoenix relic not yet used this level
  lastHitWasOrange: boolean; // for combo_hungry upgrade tracking
  cursedLuckHits: number;  // total pegs hit this shot (for cursed_luck relic)
  ballsLostThisLevel: number; // for trophy relic

  // Boss tracking
  bossKilledThisLevel: boolean;
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
  // Roguelite
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
