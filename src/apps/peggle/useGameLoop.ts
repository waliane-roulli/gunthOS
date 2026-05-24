"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { draw } from "./draw";
import { circleCollide } from "./physics";
import { buildLevel } from "./levels";
import {
  W, H, BALL_R, PEG_R, BUCKET_W, BUCKET_H,
  GRAVITY, FRICTION, WALL_BOUNCE, LAUNCH_SPEED,
  FEVER_THRESHOLD, SLOW_MO_DURATION,
  LAUNCHER_X, LAUNCHER_Y,
  BOMB_RADIUS, MAX_SHAKE, TRAUMA_DECAY,
  HIT_FREEZE_NORMAL, HIT_FREEZE_ORANGE,
  ZOOM_SCALE, STAR_COUNT,
  BONUS_BUCKET_XS, BONUS_BUCKET_MULTS,
} from "./constants";
import type { GameState, UiState, Particle, Peg, Ball, Star } from "./types";
import type { RunState } from "./roguelite";
import { CLASSES, isBossLevel } from "./roguelite";

function makeStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    layer: Math.floor(Math.random() * 3) as 0 | 1 | 2,
    size: 0.4 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
  }));
}

function makeInitialState(level: number, runState: RunState, keepScore: boolean, prevScore: number): GameState {
  const cls = CLASSES[runState.classId]!;
  const upgrades = runState.upgrades;
  const relics = runState.relics;

  const baseBalls = cls.startBalls + (upgrades.includes("extra_ball") ? 1 : 0);
  const effectiveBallR = BALL_R * cls.ballRadiusMult * (upgrades.includes("bigger_ball") ? 1.3 : 1);
  const effectiveBombR = BOMB_RADIUS * (upgrades.includes("turbo_bomb") ? 1.5 : 1);
  const effectiveFeverThreshold = upgrades.includes("fever_forever") ? 6 : FEVER_THRESHOLD;
  const aimMult = cls.aimStepsMult * (relics.includes("blessed_cursor") ? 1.6 : 1);
  const effectiveAimSteps = Math.round(180 * aimMult);
  const effectivePegBounce = 0.55 * (upgrades.includes("heavy_ball") ? 1.3 : 1);
  const effectiveBucketSpeed = 1.4 * (upgrades.includes("lucky_spin") ? 1.4 : 1);

  return {
    pegs: buildLevel(level, runState),
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
    bonusBucketMults: [1, 3, 5],

    // Roguelite
    runRelics: [...relics],
    runUpgrades: [...upgrades],
    runClassId: runState.classId,
    effectiveBallR,
    effectiveBombR,
    effectiveFeverThreshold,
    effectiveAimSteps,
    effectivePegBounce,
    effectiveBucketSpeed,

    // Note: effectiveWallBounce stored implicitly — used in processBallPhysics via closure
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

interface UseGameLoopOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  mouseRef: RefObject<{ x: number; y: number }>;
  runStateRef: RefObject<RunState>;
  onUiSync: (ui: UiState) => void;
  onOrangeTotalChange: (total: number) => void;
  onBestScore: (score: number) => void;
  onScoreSubmit: (score: number, won: boolean) => void;
  onLevelWon: (bossKilled: boolean) => void;
  onIronWillUsed: () => void;
}

export function useGameLoop({
  canvasRef,
  mouseRef,
  runStateRef,
  onUiSync,
  onOrangeTotalChange,
  onBestScore,
  onScoreSubmit,
  onLevelWon,
  onIronWillUsed,
}: UseGameLoopOptions) {
  const stateRef = useRef<GameState>(makeInitialState(1, runStateRef.current, false, 0));
  const animRef = useRef<number>(0);
  const orangeTotalRef = useRef(0);
  const onScoreSubmitRef = useRef(onScoreSubmit);
  onScoreSubmitRef.current = onScoreSubmit;
  const onLevelWonRef = useRef(onLevelWon);
  onLevelWonRef.current = onLevelWon;
  const onIronWillUsedRef = useRef(onIronWillUsed);
  onIronWillUsedRef.current = onIronWillUsed;
  const { playPop, playBip, playVictory, playDelete } = useSoundContext();

  const syncUI = useCallback(() => {
    const s = stateRef.current;
    const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
    onUiSync({
      balls: s.balls,
      score: s.score,
      orangeLeft,
      orangeTotal: orangeTotalRef.current,
      phase: s.phase,
      message: s.message,
      combo: s.combo,
      level: s.level,
      multiballReady: s.multiballReady,
      multiballPending: s.multiballPending,
      multiballUsed: s.multiballUsed,
      relics: s.runRelics,
      spookyActive: s.spookyActive,
      magnetFrames: s.magnetFrames,
      bossLevel: isBossLevel(s.level),
      stars: Math.floor(s.score / 10000),
    });
  }, [onUiSync]);

  const resetGame = useCallback((keepLevel = false) => {
    const s = stateRef.current;
    const nextLevel = keepLevel ? s.level : 1;
    const newState = makeInitialState(nextLevel, runStateRef.current, keepLevel, s.score);
    orangeTotalRef.current = newState.pegs.filter(p => p.orange).length;
    onOrangeTotalChange(orangeTotalRef.current);
    stateRef.current = newState;
    syncUI();
  }, [syncUI, onOrangeTotalChange, runStateRef]);

  const nextLevel = useCallback(() => {
    const s = stateRef.current;
    s.level += 1;
    resetGame(true);
  }, [resetGame]);

  const activateMultiball = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "aim" && s.multiballReady && !s.multiballPending) {
      s.multiballPending = true;
      s.multiballReady = false;
      syncUI();
    }
  }, [syncUI]);

  function getAngle() {
    const dx = mouseRef.current.x - LAUNCHER_X;
    const dy = mouseRef.current.y - LAUNCHER_Y;
    const angle = Math.atan2(dy, dx);
    return Math.max(0.15, Math.min(Math.PI - 0.15, angle));
  }

  const fireBallAtClientPos = useCallback((rect: DOMRect, clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (s.phase !== "aim" || s.ball) return;
    const mx = (clientX - rect.left) * (W / rect.width);
    const my = (clientY - rect.top) * (H / rect.height);
    const angle = Math.max(0.15, Math.min(Math.PI - 0.15, Math.atan2(my - LAUNCHER_Y, mx - LAUNCHER_X)));

    if (s.multiballPending) {
      const a1 = angle - 0.13, a2 = angle, a3 = angle + 0.13;
      s.ball = {
        x: LAUNCHER_X, y: LAUNCHER_Y,
        vx: Math.cos(a1) * LAUNCH_SPEED, vy: Math.sin(a1) * LAUNCH_SPEED,
        active: true, trail: [], tint: "#ff8888",
      };
      s.extraBalls = [
        { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(a2) * LAUNCH_SPEED, vy: Math.sin(a2) * LAUNCH_SPEED, active: true, trail: [], tint: "#ffdd88" },
        { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(a3) * LAUNCH_SPEED, vy: Math.sin(a3) * LAUNCH_SPEED, active: true, trail: [], tint: "#88ffcc" },
      ];
      s.multiballPending = false;
      s.multiballUsed = true;
      s.floatingTexts.push({ x: W / 2, y: LAUNCHER_Y + 40, text: "⚡ MULTIBALL!", life: 1, maxLife: 2, color: "#ffcc44", combo: true, fontSize: 16 });
    } else {
      s.ball = { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(angle) * LAUNCH_SPEED, vy: Math.sin(angle) * LAUNCH_SPEED, active: true, trail: [] };
    }

    // Ghost ball: first peg bypass
    s.ghostBallActive = s.runUpgrades.includes("ghost_ball");
    s.cursedLuckHits = 0;
    s.balls -= 1;
    s.turnScoreStart = s.score;

    if (s.balls === 0) {
      const mults = [...BONUS_BUCKET_MULTS];
      for (let i = mults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mults[i], mults[j]] = [mults[j]!, mults[i]!];
      }
      s.bonusBucketMults = mults;
      s.bonusBucketFlash = [0, 0, 0];
    }
    s.phase = "firing";
    syncUI();
  }, [syncUI]);

  const handleClick = useCallback((e: { currentTarget: { getBoundingClientRect(): DOMRect }; clientX: number; clientY: number }) => {
    fireBallAtClientPos(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY);
  }, [fireBallAtClientPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateAimFromTouch = (t: Touch) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (t.clientX - rect.left) * (W / rect.width),
        y: (t.clientY - rect.top) * (H / rect.height),
      };
    };

    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; if (t) updateAimFromTouch(t); };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; if (t) updateAimFromTouch(t); };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (!t) return;
      updateAimFromTouch(t);
      fireBallAtClientPos(canvas.getBoundingClientRect(), t.clientX, t.clientY);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [fireBallAtClientPos, mouseRef]);

  useEffect(() => {
    const pegs = stateRef.current.pegs;
    orangeTotalRef.current = pegs.filter(p => p.orange).length;
    onOrangeTotalChange(orangeTotalRef.current);
    syncUI();
  }, [syncUI, onOrangeTotalChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function spawnParticles(s: GameState, x: number, y: number, orange: boolean, count: number, bomb?: boolean) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * (bomb ? 6 : 3.5);
        const colors = bomb
          ? ["#ff6600", "#ffcc00", "#ff2200", "#ffeeaa", "#ffffff"]
          : orange
          ? ["#4488ff", "#88bbff", "#0044cc", "#ffffff", "#000080"]
          : ["#c0c0c0", "#e0e0e0", "#808080", "#ffffff", "#606060"];
        const p: Particle = {
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (bomb ? 2 : 1),
          life: 1,
          maxLife: 0.6 + Math.random() * (bomb ? 1.2 : 0.6),
          color: colors[Math.floor(Math.random() * colors.length)]!,
          size: 2 + Math.random() * (bomb ? 5 : 3),
        };
        s.particles.push(p);
      }
    }

    function triggerBomb(s: GameState, bombPeg: Peg) {
      const queue: Peg[] = [bombPeg];
      const processed = new Set<Peg>();
      let chainCount = 0;
      let bombsInChain = 0;

      while (queue.length > 0) {
        const bPeg = queue.shift()!;
        if (processed.has(bPeg)) continue;
        processed.add(bPeg);

        for (const p of s.pegs) {
          if (p.hit || processed.has(p)) continue;
          const d = Math.hypot(p.x - bPeg.x, p.y - bPeg.y);
          if (d <= s.effectiveBombR) {
            p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.9;
            spawnParticles(s, p.x, p.y, p.orange, p.orange ? 18 : 10, true);
            const chainBonus = s.runUpgrades.includes("chain_master") ? 50 : 0;
            const pts = (p.orange ? 150 : p.green ? 75 : 15) + chainBonus;
            s.score += pts * s.scoreMultiplier;
            chainCount++;
            if (p.bomb) { bombsInChain++; queue.push(p); }

            // Contamination upgrade: convert peg's neighbors to bombs
            if (s.runUpgrades.includes("contamination")) {
              for (const neighbor of s.pegs) {
                if (!neighbor.hit && !processed.has(neighbor) && !neighbor.bomb && !neighbor.orange && !neighbor.boss) {
                  const nd = Math.hypot(neighbor.x - p.x, neighbor.y - p.y);
                  if (nd < PEG_R * 6) { neighbor.bomb = true; queue.push(neighbor); }
                }
              }
            }
          }
        }
      }

      spawnParticles(s, bombPeg.x, bombPeg.y, true, 40, true);
      s.trauma = Math.min(1, s.trauma + 0.5);
      s.flashWhite = Math.max(s.flashWhite, 0.7);
      const label = chainCount > 3 ? `💥 CHAIN ×${chainCount}!` : "💥 BOOM!";
      s.floatingTexts.push({ x: bombPeg.x, y: bombPeg.y - 20, text: label, life: 1, maxLife: 2.2, color: "#ff6600", combo: true, fontSize: 17 });

      // Scorpion relic: +1 ball per bomb-chain kill
      if (s.runRelics.includes("scorpion") && bombsInChain > 0) {
        s.balls += bombsInChain;
        s.floatingTexts.push({ x: bombPeg.x, y: bombPeg.y - 36, text: `🦂 +${bombsInChain}`, life: 1, maxLife: 1.8, color: "#ff6644", combo: true, fontSize: 13 });
      }

      const orangeRemaining = s.pegs.filter(pg => pg.orange && !pg.hit).length;
      if (orangeRemaining === 0 && s.slowMoFrames === 0) {
        s.slowMoFrames = SLOW_MO_DURATION;
        s.flashWhite = 1.0;
        s.floatingTexts.push({ x: W / 2, y: H / 2 - 30, text: "DERNIÈRE FENÊTRE !", life: 1, maxLife: 2.5, color: "#88ccff", combo: true, fontSize: 16 });
      }
    }

    function processBallPhysics(b: Ball, s: GameState, timeScale: number) {
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      b.trail.push({ x: b.x, y: b.y, speed });
      if (b.trail.length > 32) b.trail.shift();

      const substeps = Math.max(1, Math.ceil(speed / (PEG_R * 0.8)));
      const dt = timeScale / substeps;

      const wallBounce = WALL_BOUNCE * (s.runRelics.includes("boomerang") ? 1.4 : 1);

      for (let step = 0; step < substeps; step++) {
        // Magnet: attract toward nearest orange peg
        if (s.magnetFrames > 0) {
          const orangePegs = s.pegs.filter(p => p.orange && !p.hit && p.hitCooldown === 0);
          if (orangePegs.length > 0) {
            let nearest = orangePegs[0]!;
            let nearDist = Math.hypot(b.x - nearest.x, b.y - nearest.y);
            for (const op of orangePegs) {
              const d = Math.hypot(b.x - op.x, b.y - op.y);
              if (d < nearDist) { nearest = op; nearDist = d; }
            }
            if (nearDist > 0) {
              const force = 0.06 * dt;
              b.vx += ((nearest.x - b.x) / nearDist) * force;
              b.vy += ((nearest.y - b.y) / nearDist) * force;
            }
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy += GRAVITY * dt;
        b.vx *= Math.pow(FRICTION, dt);

        if (b.x - s.effectiveBallR < 0) {
          b.vx = Math.abs(b.vx) * wallBounce;
          b.x = s.effectiveBallR;
          if (step === 0) { playBip(); s.trauma = Math.min(1, s.trauma + 0.06); }
        }
        if (b.x + s.effectiveBallR > W) {
          b.vx = -Math.abs(b.vx) * wallBounce;
          b.x = W - s.effectiveBallR;
          if (step === 0) { playBip(); s.trauma = Math.min(1, s.trauma + 0.06); }
        }

        for (const p of s.pegs) {
          if (p.hit || p.hitCooldown > 0) continue;
          const result = circleCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, p.x, p.y, PEG_R, s.effectivePegBounce);
          if (!result) continue;

          // Ghost ball: pass through the first peg this shot
          if (s.ghostBallActive && b === s.ball) {
            s.ghostBallActive = false;
            p.hitCooldown = 20;
            s.floatingTexts.push({ x: p.x, y: p.y - 12, text: "👻 FANTÔME", life: 1, maxLife: 1.2, color: "#cc88ff", combo: false, fontSize: 11 });
            continue;
          }

          // Apply bounce
          b.vx = result.vx; b.vy = result.vy;
          const dx = b.x - p.x, dy = b.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const overlap = s.effectiveBallR + PEG_R - dist + 0.5;
          b.x += (dx / dist) * overlap;
          b.y += (dy / dist) * overlap;

          // Boss peg hit
          if (p.boss && p.armorHits > 0) {
            p.armorHits--;
            p.hitCooldown = 12;
            p.scale = 1.6;
            s.trauma = Math.min(1, s.trauma + 0.22);
            s.flashWhite = Math.max(s.flashWhite, 0.35);
            s.hitFreezeFrames = Math.max(s.hitFreezeFrames, HIT_FREEZE_ORANGE);
            spawnParticles(s, p.x, p.y, true, 12, false);
            const hpLeft = p.armorHits + 1;
            s.floatingTexts.push({ x: p.x, y: p.y - 18, text: `👑 ${hpLeft}/5`, life: 1, maxLife: 1.2, color: "#ffd700", combo: true, fontSize: 14 });
            playBip();
            continue;
          }

          // Armor peg hit
          if (p.armorHits > 0) {
            p.armorHits--;
            p.hitCooldown = 12;
            p.scale = 1.5;
            s.trauma = Math.min(1, s.trauma + 0.12);
            s.hitFreezeFrames = Math.max(s.hitFreezeFrames, HIT_FREEZE_NORMAL);
            spawnParticles(s, p.x, p.y, false, 8);
            s.floatingTexts.push({ x: p.x, y: p.y - 12, text: "CRACK!", life: 1, maxLife: 0.9, color: "#aaccff", combo: false, fontSize: 11 });
            playBip();
            continue;
          }

          // Warp peg
          if (p.warpId !== undefined) {
            const partner = s.pegs.find(pp => pp.warpId === p.warpId && pp !== p && !pp.hit);
            if (partner) {
              b.x = partner.x + (dx / dist) * (s.effectiveBallR + PEG_R + 2);
              b.y = partner.y + (dy / dist) * (s.effectiveBallR + PEG_R + 2);
              spawnParticles(s, p.x, p.y, false, 14);
              spawnParticles(s, partner.x, partner.y, false, 14);
              s.flashWhite = Math.max(s.flashWhite, 0.3);
              s.floatingTexts.push({ x: partner.x, y: partner.y - 14, text: "✦ WARP!", life: 1, maxLife: 1.2, color: "#cc88ff", combo: true, fontSize: 13 });
              partner.hitCooldown = 20;
            }
            p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.7;
            s.score += 30 * s.scoreMultiplier;
            playPop();
            continue;
          }

          // Normal peg pop
          p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.7;
          s.combo += 1;
          s.cursedLuckHits += 1;

          // Boss peg final kill (armorHits was 0)
          if (p.boss) {
            s.bossKilledThisLevel = true;
            s.score += 5000 * s.scoreMultiplier;
            s.balls += 2;
            s.trauma = Math.min(1, s.trauma + 0.9);
            s.flashWhite = 1.0;
            s.floatingTexts.push({ x: p.x, y: p.y - 30, text: "👑 BOSS VAINCU! +5000", life: 1, maxLife: 3, color: "#ffd700", combo: true, fontSize: 15 });
            s.floatingTexts.push({ x: p.x, y: p.y - 48, text: "+2 BALLES", life: 1, maxLife: 2.5, color: "#00ffcc", combo: true, fontSize: 13 });
            spawnParticles(s, p.x, p.y, true, 60, true);
            playVictory();
          }

          // Green peg power-up
          if (p.green) {
            s.flashWhite = Math.max(s.flashWhite, 0.4);
            switch (p.greenPowerup) {
              case "multiball": {
                const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                const baseA = Math.atan2(b.vy, b.vx);
                s.extraBalls.push({ x: b.x, y: b.y, vx: Math.cos(baseA - 0.22) * spd, vy: Math.sin(baseA - 0.22) * spd, active: true, trail: [], tint: "#ffdd88" });
                s.extraBalls.push({ x: b.x, y: b.y, vx: Math.cos(baseA + 0.22) * spd, vy: Math.sin(baseA + 0.22) * spd, active: true, trail: [], tint: "#88ffcc" });
                s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "⚡ MULTIBALL!", life: 1, maxLife: 2, color: "#ffcc44", combo: true, fontSize: 15 });
                break;
              }
              case "spooky":
                s.spookyActive = true;
                s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "👻 SPOOKY BALL!", life: 1, maxLife: 2, color: "#cc88ff", combo: true, fontSize: 15 });
                break;
              case "extraball":
                s.balls += 1;
                s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "🔮 +1 BALLE!", life: 1, maxLife: 2, color: "#00ffcc", combo: true, fontSize: 15 });
                break;
              case "magnet":
                s.magnetFrames = 300;
                s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "🧲 AIMANT!", life: 1, maxLife: 2, color: "#4488ff", combo: true, fontSize: 15 });
                break;
              case "pyromaniac": {
                // Convert nearby non-orange, non-boss pegs to bombs and chain them
                for (const np of s.pegs) {
                  if (!np.hit && !np.orange && !np.bomb && !np.boss && np !== p) {
                    const d = Math.hypot(np.x - p.x, np.y - p.y);
                    if (d < s.effectiveBombR * 1.3) np.bomb = true;
                  }
                }
                p.bomb = true;
                triggerBomb(s, p);
                s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "🔥 PYROMANE!", life: 1, maxLife: 2, color: "#ff6600", combo: true, fontSize: 15 });
                break;
              }
              default:
                // No known powerup — fallback to old ×2
                s.scoreMultiplier = 2;
                s.floatingTexts.push({ x: p.x, y: p.y - 14, text: "×2 BONUS!", life: 1, maxLife: 1.6, color: "#44ff88", combo: true, fontSize: 14 });
            }
          }

          if (p.orange) {
            const orangeRemaining = s.pegs.filter(pg => pg.orange && !pg.hit).length;
            if (orangeRemaining === 0) {
              s.slowMoFrames = SLOW_MO_DURATION;
              s.flashWhite = 1.0;
              s.floatingTexts.push({ x: W / 2, y: H / 2 - 30, text: "DERNIÈRE FENÊTRE !", life: 1, maxLife: 2.5, color: "#88ccff", combo: true, fontSize: 16 });
            }
          }

          // Cursed luck relic: every 5th peg gives ×3 to this hit
          let cursedMult = 1;
          if (s.runRelics.includes("cursed_luck") && s.cursedLuckHits % 5 === 0) {
            cursedMult = 3;
            s.floatingTexts.push({ x: p.x, y: p.y - 30, text: "🎲 ×3 MALCHANCE!", life: 1, maxLife: 1.8, color: "#cc44ff", combo: true, fontSize: 13 });
          }

          // Combo_hungry upgrade: orange × 1.5 if last hit was also orange
          let hungryMult = 1;
          if (p.orange && s.runUpgrades.includes("combo_hungry") && s.lastHitWasOrange) {
            hungryMult = 1.5;
          }
          s.lastHitWasOrange = p.orange;

          const comboMult = Math.max(1, Math.floor(s.combo / 3));
          const totalMult = comboMult * s.scoreMultiplier * cursedMult * hungryMult;
          const basePoints = p.orange ? 100 : p.green ? 50 : p.boss ? 0 : 10; // boss already scored above
          const earned = Math.round(basePoints * totalMult);
          if (!p.boss) s.score += earned;

          // Hitstop
          const freeze = p.orange ? HIT_FREEZE_ORANGE : HIT_FREEZE_NORMAL;
          s.hitFreezeFrames = Math.max(s.hitFreezeFrames, freeze);

          // Trauma
          if (p.orange) { s.trauma = Math.min(1, s.trauma + 0.35); s.flashWhite = Math.max(s.flashWhite, 0.5); }
          else { s.trauma = Math.min(1, s.trauma + 0.08); }

          if (p.bomb && !p.green) {
            triggerBomb(s, p);
          } else if (!p.boss) {
            spawnParticles(s, p.x, p.y, p.orange, p.orange ? 20 : p.green ? 14 : 8);
          }

          const comboBonus = s.combo >= 3 && s.combo % 3 === 0;
          if (!p.boss && earned > 0) {
            const popFontSize = Math.min(18, 11 + Math.floor(totalMult * 1.5));
            const label = totalMult > 1 ? `+${earned} ×${Math.round(totalMult)}` : `+${earned}`;
            s.floatingTexts.push({
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y,
              text: label, life: 1, maxLife: 1,
              color: p.orange ? "#88ccff" : p.green ? "#44ff88" : "#ffffff",
              combo: comboBonus,
              fontSize: comboBonus ? popFontSize + 2 : popFontSize,
            });
          }

          if (comboBonus) {
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: `COMBO ×${comboMult}!`, life: 1, maxLife: 1.6, color: "#ffcc44", combo: true, fontSize: Math.min(20, 13 + comboMult * 2) });
          }

          if (p.orange || p.boss) playPop(); else playBip();
        }
      }

      // Bucket catch
      const bucketTop = H - BUCKET_H - 4;
      const isLastBall = s.balls === 0;

      if (isLastBall) {
        for (let i = 0; i < BONUS_BUCKET_XS.length; i++) {
          const bx = BONUS_BUCKET_XS[i]!;
          if (b.y + s.effectiveBallR >= bucketTop && b.x >= bx && b.x <= bx + BUCKET_W) {
            const mult = s.bonusBucketMults[i] ?? 1;
            const turnScore = Math.max(0, s.score - s.turnScoreStart);
            const bonus = (mult - 1) * turnScore;
            s.balls += 1;
            s.bonusBucketFlash[i] = 1;
            s.trauma = Math.min(1, s.trauma + 0.2);
            if (bonus > 0) {
              s.score += bonus;
              s.floatingTexts.push({ x: bx + BUCKET_W / 2, y: bucketTop - 14, text: `×${mult} BONUS +${bonus.toLocaleString()}`, life: 1, maxLife: 2.2, color: mult === 5 ? "#ffcc00" : "#cc44ff", combo: true, fontSize: 15 });
            } else {
              s.floatingTexts.push({ x: bx + BUCKET_W / 2, y: bucketTop - 14, text: mult > 1 ? `×${mult} FREE BALL!` : "FREE BALL!", life: 1, maxLife: 1.8, color: mult === 5 ? "#ffcc00" : mult === 3 ? "#cc44ff" : "#00ffcc", combo: mult > 1, fontSize: 14 });
            }
            playVictory();
            b.active = false;
            break;
          }
        }
      } else {
        if (b.y + s.effectiveBallR >= bucketTop && b.x >= s.bucket && b.x <= s.bucket + BUCKET_W) {
          s.balls += 1;
          s.bucketFlash = 1;
          s.trauma = Math.min(1, s.trauma + 0.15);
          s.floatingTexts.push({ x: s.bucket + BUCKET_W / 2, y: bucketTop - 14, text: "FREE BALL!", life: 1, maxLife: 1.8, color: "#00ffcc", combo: true, fontSize: 14 });
          playVictory();
          b.active = false;
        }
      }

      // Ball falls off screen
      if (b.active && b.y > H + 40) {
        const isMain = b === s.ball;
        if (isMain && s.spookyActive) {
          s.spookyActive = false;
          b.x = Math.max(s.effectiveBallR, Math.min(W - s.effectiveBallR, b.x));
          b.y = LAUNCHER_Y + 30;
          b.vy = -LAUNCH_SPEED * 0.65;
          b.vx *= 0.5;
          s.flashWhite = Math.max(s.flashWhite, 0.45);
          s.floatingTexts.push({ x: b.x, y: LAUNCHER_Y + 50, text: "👻 SPOOKY SAVE!", life: 1, maxLife: 2, color: "#cc88ff", combo: true, fontSize: 14 });
        } else if (isMain && s.phoenixAvailable) {
          s.phoenixAvailable = false;
          b.x = Math.max(s.effectiveBallR, Math.min(W - s.effectiveBallR, b.x));
          b.y = LAUNCHER_Y + 30;
          b.vy = -LAUNCH_SPEED * 0.65;
          b.vx *= 0.5;
          s.flashWhite = Math.max(s.flashWhite, 0.6);
          s.trauma = Math.min(1, s.trauma + 0.3);
          s.floatingTexts.push({ x: b.x, y: LAUNCHER_Y + 50, text: "🔥 PHÉNIX SAVE!", life: 1, maxLife: 2, color: "#ff8800", combo: true, fontSize: 14 });
        } else {
          if (isMain) s.ballsLostThisLevel++;
          b.active = false;
        }
      }
    }

    function tick() {
      const s = stateRef.current;

      s.animClock += 0.03;

      if (s.hitFreezeFrames > 0) {
        s.hitFreezeFrames--;
        for (const p of s.pegs) {
          if (p.scale !== 1) p.scale += (1 - p.scale) * 0.18;
          if (p.hitCooldown > 0) p.hitCooldown--;
        }
        draw(ctx, s, getAngle(), LAUNCHER_X, LAUNCHER_Y);
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      const inSlowMo = s.slowMoFrames > 0;
      const timeScale = inSlowMo ? 0.25 : 1;
      if (s.slowMoFrames > 0) s.slowMoFrames--;

      const targetZoom = s.slowMoFrames > 0 && s.ball?.active ? ZOOM_SCALE : 1.0;
      s.zoomLevel += (targetZoom - s.zoomLevel) * 0.1;
      if (Math.abs(s.zoomLevel - 1) < 0.004) s.zoomLevel = 1;

      // Bucket
      s.bucket += s.bucketDir * timeScale;
      if (s.bucket <= 0) { s.bucket = 0; s.bucketDir = Math.abs(s.bucketDir); }
      if (s.bucket + BUCKET_W >= W) { s.bucket = W - BUCKET_W; s.bucketDir = -Math.abs(s.bucketDir); }
      if (s.bucketFlash > 0) s.bucketFlash -= 0.06;
      for (let i = 0; i < 3; i++) {
        if ((s.bonusBucketFlash[i] ?? 0) > 0) s.bonusBucketFlash[i] = Math.max(0, (s.bonusBucketFlash[i] ?? 0) - 0.06);
      }

      // Magnet countdown
      if (s.magnetFrames > 0) s.magnetFrames--;

      // Fever pulse
      const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
      const inFever = orangeLeft <= s.effectiveFeverThreshold && orangeLeft > 0;
      if (inFever) s.feverPulse = (s.feverPulse + 0.08) % (Math.PI * 2);
      else s.feverPulse = 0;

      // Screen shake
      if (s.trauma > 0) s.trauma = Math.max(0, s.trauma - TRAUMA_DECAY);
      const shakeMag = MAX_SHAKE * s.trauma * s.trauma;
      s.shakeX = s.trauma > 0.01 ? shakeMag * Math.sin(s.animClock * 43.7 + 1.1) : 0;
      s.shakeY = s.trauma > 0.01 ? shakeMag * Math.cos(s.animClock * 27.3 + 0.5) : 0;

      if (s.flashWhite > 0) s.flashWhite -= 0.07;

      // Peg animation
      for (const p of s.pegs) {
        if (p.scale !== 1) {
          p.scale += (1 - p.scale) * 0.18;
          if (Math.abs(p.scale - 1) < 0.01) p.scale = 1;
        }
        if (p.hitCooldown > 0) p.hitCooldown--;
      }

      // Ball physics
      if (s.ball && s.ball.active) processBallPhysics(s.ball, s, timeScale);

      // Extra balls (use length snapshot to avoid processing mid-spawned balls)
      const extraCount = s.extraBalls.length;
      for (let i = 0; i < extraCount; i++) {
        const eb = s.extraBalls[i]!;
        if (eb.active) processBallPhysics(eb, s, timeScale);
      }

      // Pop animations
      for (const p of s.pegs) {
        if (p.popping) {
          p.popAlpha -= 0.07;
          if (p.popAlpha <= 0) { p.popAlpha = 0; p.popping = false; }
        }
      }

      // Particles
      s.particles = s.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.12; p.vx *= 0.97;
        p.life -= 0.03 / p.maxLife;
        return p.life > 0;
      });

      // Floating texts
      s.floatingTexts = s.floatingTexts.filter(t => {
        t.y -= 1.3 * timeScale;
        t.life -= 0.02 / t.maxLife;
        return t.life > 0;
      });

      if (s.ball && !s.ball.active) s.ball = null;
      s.extraBalls = s.extraBalls.filter(eb => eb.active);

      // End of turn
      const anyBallActive = s.ball?.active === true || s.extraBalls.length > 0;
      if (s.phase === "firing" && !anyBallActive) {
        s.pegs = s.pegs.filter(p => !p.hit);
        s.combo = 0;
        s.scoreMultiplier = 1;
        s.lastHitWasOrange = false;
        const remainingOrange = s.pegs.filter(p => p.orange).length;

        if (remainingOrange === 0) {
          // Trophy relic: no balls lost this level → +2 balls
          if (s.runRelics.includes("trophy") && s.ballsLostThisLevel === 0) {
            s.balls += 2;
            s.floatingTexts.push({ x: W / 2, y: H / 3, text: "🏆 TROPHÉE +2 BALLES!", life: 1, maxLife: 2.5, color: "#ffd700", combo: true, fontSize: 14 });
          }

          // Recovery upgrade: win with >3 balls = +1
          if (s.runUpgrades.includes("recovery") && s.balls > 3) {
            s.balls += 1;
            s.floatingTexts.push({ x: W / 2, y: H / 3 + 20, text: "💊 RÉCUPÉRATION +1", life: 1, maxLife: 2, color: "#44ff88", combo: true, fontSize: 12 });
          }

          const ballBonus = s.balls * 1000;
          s.score += ballBonus;
          if (ballBonus > 0) {
            s.floatingTexts.push({ x: W / 2, y: H / 2, text: `+${ballBonus.toLocaleString()} BONUS BILLES !`, life: 1, maxLife: 3, color: "#00ffcc", combo: true, fontSize: 16 });
          }
          const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
          if (s.score > saved) {
            localStorage.setItem("peggle98_best", String(s.score));
            onBestScore(s.score);
          }
          s.phase = "won";
          s.message = `NIVEAU ${s.level} TERMINÉ !`;
          playVictory();
          onScoreSubmitRef.current(s.score, true);
          onLevelWonRef.current(s.bossKilledThisLevel);

        } else if (s.balls <= 0) {
          // Iron will upgrade: once per run, save from game over
          if (s.runUpgrades.includes("iron_will") && !runStateRef.current.ironWillUsed) {
            s.balls = 2;
            onIronWillUsedRef.current();
            s.flashWhite = 0.8;
            s.trauma = Math.min(1, s.trauma + 0.5);
            s.floatingTexts.push({ x: W / 2, y: H / 2 - 20, text: "🛡️ VOLONTÉ DE FER!", life: 1, maxLife: 2.5, color: "#4488ff", combo: true, fontSize: 15 });
            s.phase = "aim";
          } else {
            const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
            if (s.score > saved) {
              localStorage.setItem("peggle98_best", String(s.score));
              onBestScore(s.score);
            }
            s.phase = "lost";
            s.message = "GAME OVER";
            playDelete();
            onScoreSubmitRef.current(s.score, false);
          }
        } else {
          // Phoenix relic resets for next shot
          s.phoenixAvailable = s.runRelics.includes("phoenix");
          s.phase = "aim";
        }
        syncUI();
      }

      draw(ctx, s, getAngle(), LAUNCHER_X, LAUNCHER_Y);
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playBip, playPop, playVictory, playDelete, syncUI, onBestScore]);

  return { stateRef, handleClick, resetGame, nextLevel, activateMultiball };
}
