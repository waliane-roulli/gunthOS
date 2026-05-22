"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { draw } from "./draw";
import { circleCollide } from "./physics";
import { buildLevel } from "./levels";
import {
  W, H, BALL_R, PEG_R, BUCKET_W, BUCKET_H,
  GRAVITY, FRICTION, WALL_BOUNCE, LAUNCH_SPEED,
  SHAKE_DECAY, FEVER_THRESHOLD, SLOW_MO_DURATION,
  LAUNCHER_X, LAUNCHER_Y,
} from "./constants";
import type { GameState, UiState, Particle } from "./types";

function makeInitialState(level: number, keepScore = false, prevScore = 0): GameState {
  return {
    pegs: buildLevel(level),
    ball: null,
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
    bucketFlash: 0,
    shakeX: 0,
    shakeY: 0,
    scoreMultiplier: 1,
    flashWhite: 0,
    slowMoFrames: 0,
    level,
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

  function getAngle() {
    const dx = mouseRef.current.x - LAUNCHER_X;
    const dy = mouseRef.current.y - LAUNCHER_Y;
    const angle = Math.atan2(dy, dx);
    return Math.max(0.15, Math.min(Math.PI - 0.15, angle));
  }

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.phase !== "aim" || s.ball) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const angle = Math.max(0.15, Math.min(Math.PI - 0.15, Math.atan2(my - LAUNCHER_Y, mx - LAUNCHER_X)));
    s.ball = {
      x: LAUNCHER_X, y: LAUNCHER_Y,
      vx: Math.cos(angle) * LAUNCH_SPEED,
      vy: Math.sin(angle) * LAUNCH_SPEED,
      active: true,
      trail: [],
    };
    s.balls -= 1;
    s.phase = "firing";
    syncUI();
  }, [syncUI]);

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

    function spawnParticles(s: GameState, x: number, y: number, orange: boolean, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        const colors = orange
          ? ["#ff9900", "#ffcc00", "#ff6600", "#fff4aa", "#ff4400"]
          : ["#66aaff", "#aaddff", "#4488ff", "#ffffff", "#2266cc"];
        const p: Particle = {
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)]!,
          size: 2 + Math.random() * 3,
        };
        s.particles.push(p);
      }
    }

    function tick() {
      const s = stateRef.current;

      const inSlowMo = s.slowMoFrames > 0;
      const timeScale = inSlowMo ? 0.25 : 1;
      if (s.slowMoFrames > 0) s.slowMoFrames--;

      s.bucket += s.bucketDir * timeScale;
      if (s.bucket <= 0) { s.bucket = 0; s.bucketDir = Math.abs(s.bucketDir); }
      if (s.bucket + BUCKET_W >= W) { s.bucket = W - BUCKET_W; s.bucketDir = -Math.abs(s.bucketDir); }

      if (s.bucketFlash > 0) s.bucketFlash -= 0.06;

      const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
      const inFever = orangeLeft <= FEVER_THRESHOLD && orangeLeft > 0;
      if (inFever) s.feverPulse = (s.feverPulse + 0.08) % (Math.PI * 2);
      else s.feverPulse = 0;

      s.shakeX *= SHAKE_DECAY;
      s.shakeY *= SHAKE_DECAY;
      if (s.flashWhite > 0) s.flashWhite -= 0.07;

      for (const p of s.pegs) {
        if (p.scale !== 1) {
          p.scale += (1 - p.scale) * 0.18;
          if (Math.abs(p.scale - 1) < 0.01) p.scale = 1;
        }
      }

      if (s.ball && s.ball.active) {
        const b = s.ball;
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.trail.push({ x: b.x, y: b.y, speed });
        if (b.trail.length > 32) b.trail.shift();

        const substeps = Math.max(1, Math.ceil(speed / (PEG_R * 0.8)));
        const dt = timeScale / substeps;
        for (let step = 0; step < substeps; step++) {
          b.x += b.vx * dt; b.y += b.vy * dt;
          b.vy += GRAVITY * dt; b.vx *= Math.pow(FRICTION, dt);

          if (b.x - BALL_R < 0) {
            b.vx = Math.abs(b.vx) * WALL_BOUNCE; b.x = BALL_R;
            if (step === 0) { playBip(); s.shakeX += 3; }
          }
          if (b.x + BALL_R > W) {
            b.vx = -Math.abs(b.vx) * WALL_BOUNCE; b.x = W - BALL_R;
            if (step === 0) { playBip(); s.shakeX -= 3; }
          }

          for (const p of s.pegs) {
            if (p.hit) continue;
            const result = circleCollide(b.x, b.y, b.vx, b.vy, BALL_R, p.x, p.y, PEG_R);
            if (!result) continue;

            b.vx = result.vx; b.vy = result.vy;
            const dx = b.x - p.x, dy = b.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const overlap = BALL_R + PEG_R - dist + 0.5;
            b.x += (dx / dist) * overlap; b.y += (dy / dist) * overlap;
            p.hit = true; p.popping = true; p.popAlpha = 0.25;
            p.scale = 1.7;
            s.combo += 1;

            if (p.green) {
              s.scoreMultiplier = 2;
              s.flashWhite = 0.35;
              s.floatingTexts.push({
                x: p.x, y: p.y - 14,
                text: "×2 BONUS!",
                life: 1, maxLife: 1.6,
                color: "#44ff88", combo: true,
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
                  color: "#ffcc00", combo: true,
                });
              }
            }

            const comboMult = Math.max(1, Math.floor(s.combo / 3));
            const totalMult = comboMult * s.scoreMultiplier;
            const basePoints = p.orange ? 100 : p.green ? 50 : 10;
            const earned = basePoints * totalMult;
            s.score += earned;

            if (p.orange) {
              s.shakeX += (Math.random() - 0.5) * 10;
              s.shakeY += (Math.random() - 0.5) * 10;
              s.flashWhite = Math.max(s.flashWhite, 0.5);
            }

            spawnParticles(s, p.x, p.y, p.orange, p.orange ? 20 : p.green ? 14 : 8);

            const comboBonus = s.combo >= 3 && s.combo % 3 === 0;
            const label = totalMult > 1 ? `+${earned} ×${totalMult}` : `+${earned}`;
            s.floatingTexts.push({
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y,
              text: label,
              life: 1, maxLife: 1,
              color: p.orange ? "#ffcc00" : p.green ? "#44ff88" : "#aaddff",
              combo: comboBonus,
            });

            if (comboBonus) {
              s.floatingTexts.push({
                x: p.x, y: p.y - 18,
                text: `COMBO ×${comboMult}!`,
                life: 1, maxLife: 1.4,
                color: "#ff6600", combo: true,
              });
            }

            if (p.orange) playPop(); else playBip();
          }
        }

        const bucketTop = H - BUCKET_H - 4;
        if (b.y + BALL_R >= bucketTop && b.x >= s.bucket && b.x <= s.bucket + BUCKET_W) {
          s.balls += 1;
          s.score += 500;
          s.bucketFlash = 1;
          s.floatingTexts.push({
            x: s.bucket + BUCKET_W / 2, y: bucketTop - 10,
            text: "+500 FREE BALL!", life: 1, maxLife: 1.5,
            color: "#00ffcc", combo: true,
          });
          playVictory();
          b.active = false;
        }

        if (b.y > H + 40) b.active = false;
      }

      for (const p of s.pegs) {
        if (p.popping) {
          p.popAlpha -= 0.07;
          if (p.popAlpha <= 0) { p.popAlpha = 0; p.popping = false; }
        }
      }

      s.particles = s.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.12; p.vx *= 0.97;
        p.life -= 0.03 / p.maxLife;
        return p.life > 0;
      });

      s.floatingTexts = s.floatingTexts.filter(t => {
        t.y -= 1.2 * timeScale;
        t.life -= 0.02 / t.maxLife;
        return t.life > 0;
      });

      if (s.ball && !s.ball.active) {
        s.ball = null;
        s.pegs = s.pegs.filter(p => !p.hit || p.popping);
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
              color: "#00ffcc", combo: true,
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

  return { stateRef, handleClick, resetGame, nextLevel };
}
