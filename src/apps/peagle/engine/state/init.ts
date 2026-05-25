import {
  BALL_R, BOMB_RADIUS, BUCKET_W, FEVER_THRESHOLD, AIM_LINE_STEPS,
  W, STAR_COUNT, BONUS_BUCKET_MULTS,
} from "../constants";
import { CLASSES } from "../roguelite";
import { buildLevel } from "../levels";
import type { GameState, Star } from "../types";
import type { RunState } from "../roguelite";

function makeStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * (640),
    layer: Math.floor(Math.random() * 3) as 0 | 1 | 2,
    size: 0.4 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function makeInitialState(
  level: number,
  runState: RunState,
  keepScore: boolean,
  prevScore: number,
): GameState {
  const cls = CLASSES[runState.classId]!;
  const { upgrades, relics } = runState;

  const baseBalls = cls.startBalls + (upgrades.includes("extra_ball") ? 1 : 0);
  const effectiveBallR = BALL_R * cls.ballRadiusMult * (upgrades.includes("bigger_ball") ? 1.3 : 1);
  const effectiveBombR = BOMB_RADIUS * (upgrades.includes("turbo_bomb") ? 1.5 : 1);
  const effectiveFeverThreshold = upgrades.includes("fever_forever") ? 6 : FEVER_THRESHOLD;
  const aimMult = cls.aimStepsMult * (relics.includes("blessed_cursor") ? 1.6 : 1);
  const effectiveAimSteps = Math.round(AIM_LINE_STEPS * aimMult);
  const effectivePegBounce = 0.55 * (upgrades.includes("heavy_ball") ? 1.3 : 1);
  const effectiveBucketSpeed = 1.4 * (upgrades.includes("lucky_spin") ? 1.4 : 1);

  const { pegs, decors } = buildLevel(level, runState);

  return {
    pegs,
    decors,
    ball: null,
    extraBalls: [],
    balls: baseBalls,
    score: keepScore ? prevScore : 0,
    phase: "aim",
    bucket: W / 2 - BUCKET_W / 2,
    bucketDir: effectiveBucketSpeed,
    message: "",
    combo: 0,
    particles: [],
    floatingTexts: [],
    feverPulse: 0,
    animClock: 0,
    bucketFlash: 0,
    trauma: 0,
    shakeX: 0,
    shakeY: 0,
    scoreMultiplier: 1,
    flashWhite: 0,
    slowMoFrames: 0,
    zoomLevel: 1,
    level,
    hitFreezeFrames: 0,
    stars: makeStars(),
    multiballReady: true,
    multiballPending: false,
    multiballUsed: false,
    turnScoreStart: 0,
    bonusBucketFlash: [0, 0, 0],
    bonusBucketMults: [...BONUS_BUCKET_MULTS],

    runRelics: [...relics],
    runUpgrades: [...upgrades],
    runClassId: runState.classId,
    effectiveBallR,
    effectiveBombR,
    effectiveFeverThreshold,
    effectiveAimSteps,
    effectivePegBounce,
    effectiveBucketSpeed,

    spookyActive: false,
    magnetFrames: 0,
    ghostBallActive: false,
    phoenixAvailable: relics.includes("phoenix"),
    lastHitWasOrange: false,
    cursedLuckHits: 0,
    ballsLostThisLevel: 0,
    bossKilledThisLevel: false,
  };
}
