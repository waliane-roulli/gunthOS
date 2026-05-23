"use client";

import { useEffect, useRef, useCallback } from "react";
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

function makeStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    layer: Math.floor(Math.random() * 3) as 0 | 1 | 2,
    size: 0.4 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
  }));
}

function makeInitialState(level: number, keepScore = false, prevScore = 0): GameState {
  return {
    pegs: buildLevel(level),
    ball: null,
    extraBalls: [],
    balls: 10,
    score: keepScore ? prevScore : 0,
    phase: "aim",
    bucket: W / 2 - BUCKET_W / 2,
    bucketDir: 1.4,
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
  };
}

interface UseGameLoopOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  onUiSync: (ui: UiState) => void;
  onOrangeTotalChange: (total: number) => void;
  onBestScore: (score: number) => void;
  onScoreSubmit: (score: number, won: boolean) => void;
}

export function useGameLoop({
  canvasRef,
  mouseRef,
  onUiSync,
  onOrangeTotalChange,
  onBestScore,
  onScoreSubmit,
}: UseGameLoopOptions) {
  const stateRef = useRef<GameState>(makeInitialState(1));
  const animRef = useRef<number>(0);
  const orangeTotalRef = useRef(0);
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
    });
  }, [onUiSync]);

  const resetGame = useCallback((keepLevel = false) => {
    const s = stateRef.current;
    const nextLevel = keepLevel ? s.level : 1;
    const newState = makeInitialState(nextLevel, keepLevel, s.score);
    orangeTotalRef.current = newState.pegs.filter(p => p.orange).length;
    onOrangeTotalChange(orangeTotalRef.current);
    stateRef.current = newState;
    syncUI();
  }, [syncUI, onOrangeTotalChange]);

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
        {
          x: LAUNCHER_X, y: LAUNCHER_Y,
          vx: Math.cos(a2) * LAUNCH_SPEED, vy: Math.sin(a2) * LAUNCH_SPEED,
          active: true, trail: [], tint: "#ffdd88",
        },
        {
          x: LAUNCHER_X, y: LAUNCHER_Y,
          vx: Math.cos(a3) * LAUNCH_SPEED, vy: Math.sin(a3) * LAUNCH_SPEED,
          active: true, trail: [], tint: "#88ffcc",
        },
      ];
      s.multiballPending = false;
      s.multiballUsed = true;
      s.floatingTexts.push({
        x: W / 2, y: LAUNCHER_Y + 40,
        text: "⚡ MULTIBALL!", life: 1, maxLife: 2,
        color: "#ffcc44", combo: true, fontSize: 16,
      });
    } else {
      s.ball = {
        x: LAUNCHER_X, y: LAUNCHER_Y,
        vx: Math.cos(angle) * LAUNCH_SPEED, vy: Math.sin(angle) * LAUNCH_SPEED,
        active: true, trail: [],
      };
    }
    s.balls -= 1;
    s.turnScoreStart = s.score;
    s.phase = "firing";
    syncUI();
  }, [syncUI]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) updateAimFromTouch(touch);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) updateAimFromTouch(touch);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (!touch) return;
      updateAimFromTouch(touch);
      const rect = canvas.getBoundingClientRect();
      fireBallAtClientPos(rect, touch.clientX, touch.clientY);
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
          ? ["#ff9900", "#ffcc00", "#ff6600", "#fff4aa", "#ff4400"]
          : ["#66aaff", "#aaddff", "#4488ff", "#ffffff", "#2266cc"];
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

      while (queue.length > 0) {
        const bPeg = queue.shift()!;
        if (processed.has(bPeg)) continue;
        processed.add(bPeg);

        for (const p of s.pegs) {
          if (p.hit || processed.has(p)) continue;
          const d = Math.hypot(p.x - bPeg.x, p.y - bPeg.y);
          if (d <= BOMB_RADIUS) {
            p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.9;
            spawnParticles(s, p.x, p.y, p.orange, p.orange ? 18 : 10, true);
            const pts = p.orange ? 150 : p.green ? 75 : 15;
            s.score += pts * s.scoreMultiplier;
            chainCount++;
            if (p.bomb) queue.push(p);
          }
        }
      }

      spawnParticles(s, bombPeg.x, bombPeg.y, true, 40, true);
      s.trauma = Math.min(1, s.trauma + 0.5);
      s.flashWhite = Math.max(s.flashWhite, 0.7);
      const label = chainCount > 3 ? `💥 CHAIN ×${chainCount}!` : "💥 BOOM!";
      s.floatingTexts.push({
        x: bombPeg.x, y: bombPeg.y - 20,
        text: label, life: 1, maxLife: 2.2,
        color: "#ff6600", combo: true, fontSize: 17,
      });

      // Check if last orange was destroyed by bomb
      const orangeRemaining = s.pegs.filter(pg => pg.orange && !pg.hit).length;
      if (orangeRemaining === 0 && s.slowMoFrames === 0) {
        s.slowMoFrames = SLOW_MO_DURATION;
        s.flashWhite = 1.0;
        s.floatingTexts.push({
          x: W / 2, y: H / 2 - 30,
          text: "DERNIER ORANGE !",
          life: 1, maxLife: 2.5,
          color: "#ffcc00", combo: true, fontSize: 16,
        });
      }
    }

    function processBallPhysics(
      b: Ball,
      s: GameState,
      timeScale: number,
    ) {
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      b.trail.push({ x: b.x, y: b.y, speed });
      if (b.trail.length > 32) b.trail.shift();

      const substeps = Math.max(1, Math.ceil(speed / (PEG_R * 0.8)));
      const dt = timeScale / substeps;

      for (let step = 0; step < substeps; step++) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy += GRAVITY * dt;
        b.vx *= Math.pow(FRICTION, dt);

        if (b.x - BALL_R < 0) {
          b.vx = Math.abs(b.vx) * WALL_BOUNCE;
          b.x = BALL_R;
          if (step === 0) { playBip(); s.trauma = Math.min(1, s.trauma + 0.06); }
        }
        if (b.x + BALL_R > W) {
          b.vx = -Math.abs(b.vx) * WALL_BOUNCE;
          b.x = W - BALL_R;
          if (step === 0) { playBip(); s.trauma = Math.min(1, s.trauma + 0.06); }
        }

        for (const p of s.pegs) {
          if (p.hit || p.hitCooldown > 0) continue;
          const result = circleCollide(b.x, b.y, b.vx, b.vy, BALL_R, p.x, p.y, PEG_R);
          if (!result) continue;

          // Apply bounce
          b.vx = result.vx; b.vy = result.vy;
          const dx = b.x - p.x, dy = b.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const overlap = BALL_R + PEG_R - dist + 0.5;
          b.x += (dx / dist) * overlap;
          b.y += (dy / dist) * overlap;

          if (p.armorHits > 0) {
            // Armor hit: crack but don't pop
            p.armorHits--;
            p.hitCooldown = 12;
            p.scale = 1.5;
            s.trauma = Math.min(1, s.trauma + 0.12);
            s.hitFreezeFrames = Math.max(s.hitFreezeFrames, HIT_FREEZE_NORMAL);
            spawnParticles(s, p.x, p.y, false, 8);
            s.floatingTexts.push({
              x: p.x, y: p.y - 12,
              text: "CRACK!", life: 1, maxLife: 0.9,
              color: "#aaccff", combo: false, fontSize: 11,
            });
            playBip();
            continue;
          }

          // Warp peg: teleport ball to partner
          if (p.warpId !== undefined) {
            const partner = s.pegs.find(pp => pp.warpId === p.warpId && pp !== p && !pp.hit);
            if (partner) {
              b.x = partner.x + (dx / dist) * (BALL_R + PEG_R + 2);
              b.y = partner.y + (dy / dist) * (BALL_R + PEG_R + 2);
              spawnParticles(s, p.x, p.y, false, 14);
              spawnParticles(s, partner.x, partner.y, false, 14);
              s.flashWhite = Math.max(s.flashWhite, 0.3);
              s.floatingTexts.push({
                x: partner.x, y: partner.y - 14,
                text: "✦ WARP!", life: 1, maxLife: 1.2,
                color: "#cc88ff", combo: true, fontSize: 13,
              });
              partner.hitCooldown = 20; // prevent immediate re-warp
            }
            p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.7;
            s.score += 30 * s.scoreMultiplier;
            playPop();
            continue;
          }

          // Normal peg pop
          p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.7;
          s.combo += 1;

          if (p.green) {
            s.scoreMultiplier = 2;
            s.flashWhite = Math.max(s.flashWhite, 0.35);
            s.floatingTexts.push({
              x: p.x, y: p.y - 14,
              text: "×2 BONUS!", life: 1, maxLife: 1.6,
              color: "#44ff88", combo: true, fontSize: 14,
            });
          }

          if (p.orange) {
            const orangeRemaining = s.pegs.filter(pg => pg.orange && !pg.hit).length;
            if (orangeRemaining === 0) {
              s.slowMoFrames = SLOW_MO_DURATION;
              s.flashWhite = 1.0;
              s.floatingTexts.push({
                x: W / 2, y: H / 2 - 30,
                text: "DERNIER ORANGE !",
                life: 1, maxLife: 2.5,
                color: "#ffcc00", combo: true, fontSize: 16,
              });
            }
          }

          const comboMult = Math.max(1, Math.floor(s.combo / 3));
          const totalMult = comboMult * s.scoreMultiplier;
          const basePoints = p.orange ? 100 : p.green ? 50 : 10;
          const earned = basePoints * totalMult;
          s.score += earned;

          // Hitstop
          const freeze = p.orange ? HIT_FREEZE_ORANGE : HIT_FREEZE_NORMAL;
          s.hitFreezeFrames = Math.max(s.hitFreezeFrames, freeze);

          // Trauma
          if (p.orange) {
            s.trauma = Math.min(1, s.trauma + 0.35);
            s.flashWhite = Math.max(s.flashWhite, 0.5);
          } else {
            s.trauma = Math.min(1, s.trauma + 0.08);
          }

          if (p.bomb) {
            triggerBomb(s, p);
          } else {
            spawnParticles(s, p.x, p.y, p.orange, p.orange ? 20 : p.green ? 14 : 8);
          }

          const comboBonus = s.combo >= 3 && s.combo % 3 === 0;
          const totalMult2 = totalMult;
          // Scale floating text by multiplier — bigger popup for bigger combos
          const popFontSize = Math.min(18, 11 + Math.floor(totalMult2 * 1.5));
          const label = totalMult > 1 ? `+${earned} ×${totalMult}` : `+${earned}`;
          s.floatingTexts.push({
            x: p.x + (Math.random() - 0.5) * 20,
            y: p.y,
            text: label, life: 1, maxLife: 1,
            color: p.orange ? "#ffcc00" : p.green ? "#44ff88" : "#aaddff",
            combo: comboBonus,
            fontSize: comboBonus ? popFontSize + 2 : popFontSize,
          });

          if (comboBonus) {
            s.floatingTexts.push({
              x: p.x, y: p.y - 22,
              text: `COMBO ×${comboMult}!`, life: 1, maxLife: 1.6,
              color: "#ff6600", combo: true,
              fontSize: Math.min(20, 13 + comboMult * 2),
            });
          }

          if (p.orange) playPop(); else playBip();
        }
      }

      // Bucket catch
      const bucketTop = H - BUCKET_H - 4;
      const isLastBall = s.balls === 0;

      if (isLastBall) {
        for (let i = 0; i < 3; i++) {
          const bx = BONUS_BUCKET_XS[i]!;
          if (b.y + BALL_R >= bucketTop && b.x >= bx && b.x <= bx + BUCKET_W) {
            const mult = BONUS_BUCKET_MULTS[i]!;
            const turnScore = Math.max(0, s.score - s.turnScoreStart);
            const bonus = (mult - 1) * turnScore;
            s.balls += 1;
            s.bonusBucketFlash[i] = 1;
            s.trauma = Math.min(1, s.trauma + 0.2);
            if (bonus > 0) {
              s.score += bonus;
              s.floatingTexts.push({
                x: bx + BUCKET_W / 2, y: bucketTop - 14,
                text: `×${mult} BONUS +${bonus.toLocaleString()}`,
                life: 1, maxLife: 2.2,
                color: mult === 5 ? "#ffcc00" : "#cc44ff",
                combo: true, fontSize: 15,
              });
            } else {
              s.floatingTexts.push({
                x: bx + BUCKET_W / 2, y: bucketTop - 14,
                text: mult > 1 ? `×${mult} FREE BALL!` : "FREE BALL!",
                life: 1, maxLife: 1.8,
                color: mult === 5 ? "#ffcc00" : mult === 3 ? "#cc44ff" : "#00ffcc",
                combo: mult > 1, fontSize: 14,
              });
            }
            playVictory();
            b.active = false;
            break;
          }
        }
      } else {
        if (b.y + BALL_R >= bucketTop && b.x >= s.bucket && b.x <= s.bucket + BUCKET_W) {
          s.balls += 1;
          s.bucketFlash = 1;
          s.trauma = Math.min(1, s.trauma + 0.15);
          s.floatingTexts.push({
            x: s.bucket + BUCKET_W / 2, y: bucketTop - 14,
            text: "FREE BALL!", life: 1, maxLife: 1.8,
            color: "#00ffcc", combo: true, fontSize: 14,
          });
          playVictory();
          b.active = false;
        }
      }

      if (b.y > H + 40) b.active = false;
    }

    function tick() {
      const s = stateRef.current;

      // Always increment animation clock
      s.animClock += 0.03;

      // Hitstop: pause physics, still animate
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

      // Smooth zoom toward ball on last orange slow-mo
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

      // Fever pulse
      const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
      const inFever = orangeLeft <= FEVER_THRESHOLD && orangeLeft > 0;
      if (inFever) s.feverPulse = (s.feverPulse + 0.08) % (Math.PI * 2);
      else s.feverPulse = 0;

      // Trauma-based shake (replaces direct shake accumulation)
      if (s.trauma > 0) {
        s.trauma = Math.max(0, s.trauma - TRAUMA_DECAY);
      }
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
      if (s.ball && s.ball.active) {
        processBallPhysics(s.ball, s, timeScale);
      }
      for (const eb of s.extraBalls) {
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

      // Deactivate balls that went off-screen
      if (s.ball && !s.ball.active) s.ball = null;
      s.extraBalls = s.extraBalls.filter(eb => eb.active);

      // End of turn
      const anyBallActive = s.ball?.active === true || s.extraBalls.length > 0;
      if (s.phase === "firing" && !anyBallActive) {
        s.pegs = s.pegs.filter(p => !p.hit);
        s.combo = 0;
        s.scoreMultiplier = 1;
        const remainingOrange = s.pegs.filter(p => p.orange).length;

        if (remainingOrange === 0) {
          const ballBonus = s.balls * 1000;
          s.score += ballBonus;
          if (ballBonus > 0) {
            s.floatingTexts.push({
              x: W / 2, y: H / 2,
              text: `+${ballBonus.toLocaleString()} BONUS BILLES !`,
              life: 1, maxLife: 3,
              color: "#00ffcc", combo: true, fontSize: 16,
            });
          }
          const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
          if (s.score > saved) {
            localStorage.setItem("peggle98_best", String(s.score));
            onBestScore(s.score);
          }
          s.phase = "won";
          s.message = `NIVEAU ${s.level} TERMINÉ !`;
          playVictory();
          onScoreSubmit(s.score, true);
        } else if (s.balls <= 0) {
          const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
          if (s.score > saved) {
            localStorage.setItem("peggle98_best", String(s.score));
            onBestScore(s.score);
          }
          s.phase = "lost";
          s.message = "GAME OVER";
          playDelete();
          onScoreSubmit(s.score, false);
        } else {
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
  }, [playBip, playPop, playVictory, playDelete, syncUI, onBestScore, onScoreSubmit]);

  return { stateRef, handleClick, resetGame, nextLevel, activateMultiball };
}
