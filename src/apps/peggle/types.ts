export interface Peg {
  x: number;
  y: number;
  hit: boolean;
  orange: boolean;
  green: boolean;
  bomb: boolean;
  armorHits: number;   // 0=none; 1=cracked (1 more hit); init 1 for armor pegs
  hitCooldown: number; // prevents re-collision same frame
  warpId?: number;     // paired warp pegs share same warpId
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
  tint?: string; // multiball coloring
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
  fontSize?: number; // dramatic scaling
}

export interface Star {
  x: number;
  y: number;
  layer: 0 | 1 | 2; // 0=far dim, 1=mid, 2=near bright
  size: number;
  phase: number; // for twinkle offset
}

export interface GameState {
  pegs: Peg[];
  ball: Ball | null;
  extraBalls: Ball[]; // multiball extra balls
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
  animClock: number;  // always-incrementing animation clock
  bucketFlash: number;
  trauma: number;     // 0-1, drives screen shake intensity
  shakeX: number;
  shakeY: number;
  scoreMultiplier: number;
  flashWhite: number;
  slowMoFrames: number;
  zoomLevel: number;  // smooth zoom towards ball on last peg
  level: number;
  hitFreezeFrames: number; // hitstop on peg collision
  stars: Star[];
  multiballReady: boolean;
  multiballPending: boolean;
  multiballUsed: boolean;
  turnScoreStart: number;
  bonusBucketFlash: number[];
  bonusBucketMults: number[];
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
