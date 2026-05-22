"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { AppProps } from "@/types";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { getChannel } from "@/lib/audio/channel";
import { AudioPlayer } from "@/lib/audio/player";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 480;
const H = 520;
const BALL_R = 8;
const PEG_R = 7;
const BUCKET_W = 80;
const BUCKET_H = 20;
const GRAVITY = 0.28;
const LAUNCH_SPEED = 14;
const WALL_BOUNCE = 0.72;
const PEG_BOUNCE = 0.55;
const FRICTION = 0.998;
const FEVER_THRESHOLD = 3;
const SHAKE_DECAY = 0.82;
const AIM_LINE_STEPS = 180;
const SLOW_MO_DURATION = 90; // frames of slow-mo on last orange hit

// ─── Types ────────────────────────────────────────────────────────────────────
interface Peg {
  x: number;
  y: number;
  hit: boolean;
  orange: boolean;
  green: boolean;
  popping: boolean;
  popAlpha: number;
  scale: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  trail: { x: number; y: number; speed: number }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
  combo: boolean;
}

interface GameState {
  pegs: Peg[];
  ball: Ball | null;
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
  bucketFlash: number;
  shakeX: number;
  shakeY: number;
  scoreMultiplier: number;
  flashWhite: number;
  slowMoFrames: number; // countdown for slow-mo effect
  level: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayUsername: string | null;
  name: string;
  score: number;
  won: boolean;
  createdAt: string;
}

// ─── Level generator ──────────────────────────────────────────────────────────
function makePeg(x: number, y: number): Peg {
  return { x, y, hit: false, orange: false, green: false, popping: false, popAlpha: 1, scale: 1 };
}

function buildLevel(level: number): Peg[] {
  const pegs: Peg[] = [];
  const cx = W / 2;

  const layout = ((level - 1) % 3) + 1;

  if (layout === 1) {
    // Level 1 — rings + diagonals (original layout)
    const ringR = 90;
    const ringCount = 14;
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      pegs.push(makePeg(cx + Math.cos(a) * ringR, 200 + Math.sin(a) * ringR * 0.7));
    }
    const innerR = 44;
    const innerCount = 7;
    for (let i = 0; i < innerCount; i++) {
      const a = (i / innerCount) * Math.PI * 2 + Math.PI / innerCount;
      pegs.push(makePeg(cx + Math.cos(a) * innerR, 200 + Math.sin(a) * innerR * 0.7));
    }
    for (let i = 0; i < 5; i++) {
      pegs.push(makePeg(60 + i * 34, 110 + i * 30));
      pegs.push(makePeg(W - 60 - i * 34, 110 + i * 30));
    }
    const bottomPositions = [
      [80, 390], [150, 420], [240, 400], [330, 420], [400, 390],
      [120, 450], [200, 465], [280, 455], [360, 450],
    ];
    for (const [bx, by] of bottomPositions) pegs.push(makePeg(bx!, by!));
    const topCorners = [
      [50, 130], [90, 115], [130, 130],
      [W - 50, 130], [W - 90, 115], [W - 130, 130],
    ];
    for (const [tx, ty] of topCorners) pegs.push(makePeg(tx!, ty!));

  } else if (layout === 2) {
    // Level 2 — pyramid + arch
    // Pyramid rows
    for (let row = 0; row < 7; row++) {
      const count = row + 2;
      const startX = cx - (count - 1) * 28 / 2;
      for (let col = 0; col < count; col++) {
        pegs.push(makePeg(startX + col * 28, 100 + row * 38));
      }
    }
    // Two side columns
    for (let i = 0; i < 5; i++) {
      pegs.push(makePeg(40, 140 + i * 60));
      pegs.push(makePeg(W - 40, 140 + i * 60));
    }
    // Bottom arch
    const archR = 120;
    const archCount = 9;
    for (let i = 0; i < archCount; i++) {
      const a = Math.PI + (i / (archCount - 1)) * Math.PI;
      pegs.push(makePeg(cx + Math.cos(a) * archR, 430 + Math.sin(a) * 60));
    }

  } else {
    // Level 3 — spiral + checkerboard scatter
    // Spiral
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 5;
      const r = 20 + i * 4.5;
      pegs.push(makePeg(cx + Math.cos(a) * r * 0.85, 240 + Math.sin(a) * r * 0.62));
    }
    // Scattered corners
    const corners = [
      [55, 95], [115, 80], [170, 100], [55, 155], [115, 140],
      [W - 55, 95], [W - 115, 80], [W - 170, 100], [W - 55, 155], [W - 115, 140],
      [80, 420], [160, 440], [240, 415], [320, 440], [400, 420],
    ];
    for (const [cx2, cy2] of corners) pegs.push(makePeg(cx2!, cy2!));
  }

  // Deduplicate
  const filtered = pegs.filter((p, i) => {
    for (let j = 0; j < i; j++) {
      const d = Math.hypot(p.x - pegs[j]!.x, p.y - pegs[j]!.y);
      if (d < PEG_R * 3) return false;
    }
    return true;
  });

  // Orange count scales with level difficulty
  const orangePct = Math.min(0.42, 0.28 + (level - 1) * 0.04);
  const orangeCount = Math.floor(filtered.length * orangePct);
  const shuffled = [...Array(filtered.length).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < orangeCount; i++) {
    const idx = shuffled[i];
    if (idx !== undefined && filtered[idx]) filtered[idx]!.orange = true;
  }

  // Green bonus pegs
  const nonOrange = shuffled.filter(i => filtered[i] && !filtered[i]!.orange);
  for (let i = 0; i < 5; i++) {
    const idx = nonOrange[i];
    if (idx !== undefined && filtered[idx]) filtered[idx]!.green = true;
  }

  return filtered;
}

// ─── Collision ────────────────────────────────────────────────────────────────
function circleCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  px: number, py: number, pr: number
): { vx: number; vy: number } | null {
  const dx = bx - px;
  const dy = by - py;
  const distSq = dx * dx + dy * dy;
  const minDist = br + pr;
  if (distSq > minDist * minDist) return null;
  const dist = Math.sqrt(distSq);
  if (dist < 0.001) return null;
  const nx = dx / dist;
  const ny = dy / dist;
  const dot = bvx * nx + bvy * ny;
  if (dot >= 0) return null;
  return {
    vx: bvx - (1 + PEG_BOUNCE) * dot * nx,
    vy: bvy - (1 + PEG_BOUNCE) * dot * ny,
  };
}

// ─── Aim line ─────────────────────────────────────────────────────────────────
function computeAimLine(fromX: number, fromY: number, angle: number, pegs: Peg[]): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let x = fromX, y = fromY;
  let vx = Math.cos(angle) * LAUNCH_SPEED;
  let vy = Math.sin(angle) * LAUNCH_SPEED;

  for (let i = 0; i < AIM_LINE_STEPS; i++) {
    x += vx; y += vy;
    vy += GRAVITY; vx *= FRICTION;
    if (x - BALL_R < 0) { vx = Math.abs(vx) * WALL_BOUNCE; x = BALL_R; }
    if (x + BALL_R > W) { vx = -Math.abs(vx) * WALL_BOUNCE; x = W - BALL_R; }
    points.push({ x, y });
    if (y > H + 20) break;
    for (const p of pegs) {
      if (p.hit) continue;
      const dx = x - p.x, dy = y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < BALL_R + PEG_R + 2) {
        points.push({ x: p.x, y: p.y });
        return points;
      }
    }
  }
  return points;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4px 10px",
        background: "var(--t-app-bg)",
        borderWidth: 2,
        borderStyle: "solid",
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
        minWidth: 60,
      }}
    >
      <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.2 }}>{label}</span>
      <span
        style={{
          fontSize: "var(--t-text-md)",
          fontWeight: "bold",
          color: accent ? "var(--t-accent)" : "var(--t-text)",
          lineHeight: 1.3,
          fontFamily: "var(--t-font-display)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PeggleApp({ windowId: _windowId }: AppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>({
    pegs: buildLevel(1),
    ball: null,
    balls: 10,
    score: 0,
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
    level: 1,
  });
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: W / 2, y: 0 });
  const { playPop, playBip, playVictory, playDelete } = useSoundContext();
  const { user } = useAuth();
  const [uiState, setUiState] = useState({
    balls: 10, score: 0, orangeLeft: 0, orangeTotal: 0,
    phase: "aim" as string, message: "", combo: 0, level: 1,
  });
  const [tab, setTab] = useState<"game" | "leaderboard">("game");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
  });

  const syncUI = useCallback(() => {
    const s = stateRef.current;
    const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
    setUiState({ balls: s.balls, score: s.score, orangeLeft, orangeTotal: orangeTotalRef.current, phase: s.phase, message: s.message, combo: s.combo, level: s.level });
  }, []);

  const orangeTotalRef = useRef(0);

  // ── Music ──────────────────────────────────────────────────────────────────
  const musicRef = useRef<AudioPlayer | null>(null);
  const { init: initAudio } = useSoundContext();

  useEffect(() => {
    initAudio();
    const channel = getChannel("peggle-music");
    musicRef.current = new AudioPlayer(channel);
    musicRef.current.play("/sounds/radio-lofi.mp3", { loop: true });
    return () => { musicRef.current?.fadeOutAndStop(0.8); };
  }, [initAudio]);

  const resetGame = useCallback((keepLevel = false) => {
    const s = stateRef.current;
    const nextLevel = keepLevel ? s.level : 1;
    const pegs = buildLevel(nextLevel);
    orangeTotalRef.current = pegs.filter(p => p.orange).length;
    stateRef.current = {
      pegs,
      ball: null,
      balls: 10,
      score: keepLevel ? s.score : 0,
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
      level: nextLevel,
    };
    if (!keepLevel) setScoreSubmitted(false);
    syncUI();
  }, [syncUI]);

  const submitScore = useCallback(async (score: number, won: boolean) => {
    if (!user || scoreSubmitted) return;
    setScoreSubmitted(true);
    try {
      await fetch("/api/peggle/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, won }),
      });
    } catch {
      // silent
    }
  }, [user, scoreSubmitted]);

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch("/api/peggle/scores");
      const data = await res.json() as LeaderboardEntry[];
      setLeaderboard(data);
    } catch {
      // silent
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "leaderboard") fetchLeaderboard();
  }, [tab, fetchLeaderboard]);

  // ── Game loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const LAUNCHER_X = W / 2;
    const LAUNCHER_Y = 28;

    function getAngle() {
      const dx = mouseRef.current.x - LAUNCHER_X;
      const dy = mouseRef.current.y - LAUNCHER_Y;
      const angle = Math.atan2(dy, dx);
      return Math.max(0.15, Math.min(Math.PI - 0.15, angle));
    }

    function tick() {
      const s = stateRef.current;

      function spawnParticles(x: number, y: number, orange: boolean, count: number) {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3.5;
          const colors = orange
            ? ["#ff9900", "#ffcc00", "#ff6600", "#fff4aa", "#ff4400"]
            : ["#66aaff", "#aaddff", "#4488ff", "#ffffff", "#2266cc"];
          s.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            life: 1,
            maxLife: 0.6 + Math.random() * 0.6,
            color: colors[Math.floor(Math.random() * colors.length)]!,
            size: 2 + Math.random() * 3,
          });
        }
      }

      // Slow-mo time scale
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

          if (b.x - BALL_R < 0) { b.vx = Math.abs(b.vx) * WALL_BOUNCE; b.x = BALL_R; if (step === 0) { playBip(); s.shakeX += 3; } }
          if (b.x + BALL_R > W) { b.vx = -Math.abs(b.vx) * WALL_BOUNCE; b.x = W - BALL_R; if (step === 0) { playBip(); s.shakeX -= 3; } }

          for (const p of s.pegs) {
            if (p.hit) continue;
            const result = circleCollide(b.x, b.y, b.vx, b.vy, BALL_R, p.x, p.y, PEG_R);
            if (result) {
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

              // Slow-mo on last orange peg hit
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

              spawnParticles(p.x, p.y, p.orange, p.orange ? 20 : p.green ? 14 : 8);

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
        }

        const bucketTop = H - BUCKET_H - 4;
        if (b.y + BALL_R >= bucketTop && b.x >= s.bucket && b.x <= s.bucket + BUCKET_W) {
          s.balls += 1;
          s.score += 500;
          s.bucketFlash = 1;
          s.floatingTexts.push({ x: s.bucket + BUCKET_W / 2, y: bucketTop - 10, text: "+500 FREE BALL!", life: 1, maxLife: 1.5, color: "#00ffcc", combo: true });
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
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.97;
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
          // Bonus for remaining balls
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

          // Save best score locally
          const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
          if (s.score > saved) {
            localStorage.setItem("peggle98_best", String(s.score));
            setBestScore(s.score);
          }

          s.phase = "won";
          s.message = `NIVEAU ${s.level} TERMINÉ !`;
          playVictory();
          submitScore(s.score, true);
        } else if (s.balls <= 0) {
          const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
          if (s.score > saved) {
            localStorage.setItem("peggle98_best", String(s.score));
            setBestScore(s.score);
          }
          s.phase = "lost";
          s.message = "GAME OVER";
          playDelete();
          submitScore(s.score, false);
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
  }, [playBip, playPop, playVictory, playDelete, syncUI, submitScore]);

  // ── Mouse handler ─────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.phase !== "aim" || s.ball) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const LAUNCHER_X = W / 2, LAUNCHER_Y = 28;
    const angle = Math.max(0.15, Math.min(Math.PI - 0.15, Math.atan2(my - LAUNCHER_Y, mx - LAUNCHER_X)));
    s.ball = { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(angle) * LAUNCH_SPEED, vy: Math.sin(angle) * LAUNCH_SPEED, active: true, trail: [] };
    s.balls -= 1;
    s.phase = "firing";
    syncUI();
  }, [syncUI]);

  useEffect(() => {
    const pegs = stateRef.current.pegs;
    orangeTotalRef.current = pegs.filter(p => p.orange).length;
    const orangeLeft = pegs.filter(p => p.orange && !p.hit).length;
    setUiState(u => ({ ...u, orangeLeft, orangeTotal: orangeTotalRef.current }));
  }, []);

  const displayName = user ? (user.name || user.email || "Joueur") : null;

  const handleNextLevel = useCallback(() => {
    const s = stateRef.current;
    s.level += 1;
    resetGame(true);
  }, [resetGame]);

  return (
    <div className="flex flex-col h-full select-none" style={{ background: "var(--t-bg)", fontFamily: "var(--t-font-display)" }}>

      {/* ── Tab bar ── */}
      <div
        className="flex border-b-2"
        style={{ borderColor: "var(--t-border-dark)", background: "var(--t-bg)" }}
      >
        {(["game", "leaderboard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "4px 14px",
              fontSize: "var(--t-text-xs)",
              fontFamily: "var(--t-font-display)",
              cursor: "pointer",
              background: tab === t
                ? "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))"
                : "var(--t-app-bg)",
              color: tab === t ? "var(--t-text)" : "var(--t-text-muted)",
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor: tab === t ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderLeftColor: tab === t ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderBottomColor: tab === t ? "var(--t-bg)" : "var(--t-border-dark)",
              borderRightColor: tab === t ? "var(--t-border-dark)" : "var(--t-border-dark)",
              marginBottom: tab === t ? -2 : 0,
              position: "relative",
              zIndex: tab === t ? 1 : 0,
            }}
          >
            {t === "game" ? "🎯 Jeu" : "🏆 Classement"}
          </button>
        ))}
      </div>

      <div style={{ display: tab === "game" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* ── HUD ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              borderBottom: "2px solid var(--t-border-dark)",
              background: "var(--t-bg)",
              gap: 6,
            }}
          >
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
              NVX {uiState.level}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <StatCard label="SCORE" value={uiState.score.toLocaleString()} />
              <StatCard label="🟠 PEGS" value={`${uiState.orangeLeft} / ${uiState.orangeTotal}`} accent />
              <StatCard label="BILLES" value={uiState.balls} />
              {uiState.combo >= 3 && (
                <StatCard label="COMBO" value={`×${Math.max(1, Math.floor(uiState.combo / 3))}`} accent />
              )}
              {bestScore > 0 && (
                <StatCard label="BEST" value={bestScore.toLocaleString()} />
              )}
            </div>
            {displayName && (
              <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                {displayName}
              </div>
            )}
          </div>

          {/* ── Canvas ── */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ background: "var(--t-app-bg)" }}>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                cursor: uiState.phase === "aim" ? "crosshair" : "default",
                display: "block",
                imageRendering: "pixelated",
              }}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
            />

            {/* ── Overlay: won / lost ── */}
            {(uiState.phase === "won" || uiState.phase === "lost") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: "rgba(0,0,0,0.7)" }}>
                <div
                  style={{
                    background: "var(--t-bg)",
                    borderWidth: 4,
                    borderStyle: "solid",
                    borderTopColor: "var(--t-border-light)",
                    borderLeftColor: "var(--t-border-light)",
                    borderBottomColor: "var(--t-border-dark)",
                    borderRightColor: "var(--t-border-dark)",
                    padding: "24px 36px",
                    textAlign: "center",
                    minWidth: 240,
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--t-text-xl)",
                      fontWeight: "bold",
                      marginBottom: 8,
                      color: uiState.phase === "won" ? "var(--t-success, #22c55e)" : "var(--t-error, #ef4444)",
                      fontFamily: "var(--t-font-display)",
                    }}
                  >
                    {uiState.phase === "won" ? "🎉 VICTOIRE !" : "💀 GAME OVER"}
                  </div>

                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>SCORE FINAL</div>
                    <div style={{ fontSize: "var(--t-text-2xl)", fontWeight: "bold", color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>
                      {uiState.score.toLocaleString()}
                    </div>
                    {bestScore > 0 && uiState.score >= bestScore && (
                      <div style={{ fontSize: "var(--t-text-xs)", color: "#ffcc00", marginTop: 2 }}>
                        ⭐ NOUVEAU RECORD !
                      </div>
                    )}
                  </div>

                  {!user && (
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 12 }}>
                      Connectez-vous pour sauver votre score
                    </div>
                  )}
                  {user && (
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 12 }}>
                      Score enregistré pour {user.name}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {uiState.phase === "won" && (
                      <button
                        onClick={handleNextLevel}
                        style={{
                          padding: "6px 18px",
                          fontFamily: "var(--t-font-display)",
                          fontSize: "var(--t-text-sm)",
                          cursor: "pointer",
                          background: "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))",
                          color: "var(--t-text)",
                          borderWidth: 2,
                          borderStyle: "solid",
                          borderTopColor: "var(--t-border-light)",
                          borderLeftColor: "var(--t-border-light)",
                          borderBottomColor: "var(--t-border-dark)",
                          borderRightColor: "var(--t-border-dark)",
                        }}
                      >
                        Niveau suivant →
                      </button>
                    )}
                    <button
                      onClick={() => resetGame(false)}
                      style={{
                        padding: "6px 18px",
                        fontFamily: "var(--t-font-display)",
                        fontSize: "var(--t-text-sm)",
                        cursor: "pointer",
                        background: "var(--t-bg)",
                        color: "var(--t-text)",
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderTopColor: "var(--t-border-light)",
                        borderLeftColor: "var(--t-border-light)",
                        borderBottomColor: "var(--t-border-dark)",
                        borderRightColor: "var(--t-border-dark)",
                      }}
                    >
                      Rejouer
                    </button>
                    <button
                      onClick={() => { resetGame(false); setTab("leaderboard"); }}
                      style={{
                        padding: "6px 18px",
                        fontFamily: "var(--t-font-display)",
                        fontSize: "var(--t-text-sm)",
                        cursor: "pointer",
                        background: "var(--t-bg)",
                        color: "var(--t-accent)",
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderTopColor: "var(--t-border-light)",
                        borderLeftColor: "var(--t-border-light)",
                        borderBottomColor: "var(--t-border-dark)",
                        borderRightColor: "var(--t-border-dark)",
                      }}
                    >
                      🏆 Classement
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer hint ── */}
          <div
            style={{
              textAlign: "center",
              padding: "3px 0",
              borderTop: "2px solid var(--t-border-dark)",
              color: "var(--t-text-muted)",
              fontSize: "var(--t-text-xs)",
            }}
          >
            {uiState.phase === "aim"
              ? "Cliquez pour tirer • Détruisez tous les pegs orange"
              : uiState.phase === "firing"
              ? "En vol..."
              : ""}
          </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden" style={{ display: tab === "leaderboard" ? "flex" : "none", padding: 12, gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "var(--t-text-sm)", color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>
              🏆 Top 10 — Meilleurs scores
            </span>
            <button
              onClick={fetchLeaderboard}
              disabled={lbLoading}
              style={{
                padding: "3px 10px",
                fontSize: "var(--t-text-xs)",
                fontFamily: "var(--t-font-display)",
                cursor: "pointer",
                background: "var(--t-bg)",
                color: "var(--t-text-muted)",
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-light)",
                borderLeftColor: "var(--t-border-light)",
                borderBottomColor: "var(--t-border-dark)",
                borderRightColor: "var(--t-border-dark)",
              }}
            >
              {lbLoading ? "..." : "↻"}
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
              background: "var(--t-app-bg)",
            }}
          >
            {lbLoading && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
                Chargement...
              </div>
            )}
            {!lbLoading && leaderboard.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
                Aucun score enregistré. Soyez le premier !
              </div>
            )}
            {!lbLoading && leaderboard.map((entry, i) => {
              const name = entry.displayUsername || entry.username || entry.name;
              const isMe = user && entry.userId === (user as { id?: string }).id;
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
              return (
                <div
                  key={entry.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 12px",
                    borderBottom: "1px solid var(--t-border-dark)",
                    background: isMe ? "var(--t-card-hover)" : "transparent",
                    fontFamily: "var(--t-font-display)",
                  }}
                >
                  <span style={{ fontSize: "var(--t-text-sm)", minWidth: 28, textAlign: "center" }}>{medal}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: "var(--t-text-xs)",
                      color: isMe ? "var(--t-accent)" : "var(--t-text)",
                      fontWeight: isMe ? "bold" : "normal",
                    }}
                  >
                    {name}{isMe ? " (vous)" : ""}
                  </span>
                  <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                    {entry.won ? "🎉" : "💀"}
                  </span>
                  <span style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold", color: "var(--t-text)", minWidth: 60, textAlign: "right" }}>
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {!user && (
            <div
              style={{
                padding: "6px 12px",
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-muted)",
                textAlign: "center",
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
              }}
            >
              Connectez-vous pour apparaître dans le classement
            </div>
          )}
      </div>
    </div>
  );
}

// ─── Draw function ────────────────────────────────────────────────────────────
function draw(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  aimAngle: number,
  launcherX: number,
  launcherY: number
) {
  const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
  const inFever = orangeLeft <= FEVER_THRESHOLD && orangeLeft > 0;
  const feverIntensity = inFever ? (Math.sin(s.feverPulse) * 0.5 + 0.5) : 0;
  const inSlowMo = s.slowMoFrames > 0;

  ctx.save();
  ctx.translate(s.shakeX, s.shakeY);

  const bgR = Math.round(10 + feverIntensity * 30);
  const bgG = Math.round(10 + feverIntensity * 5);
  // Slow-mo tints the background blue
  const bgB = inSlowMo ? Math.round(26 + (s.slowMoFrames / SLOW_MO_DURATION) * 60) : 26;
  ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
  ctx.fillRect(-Math.abs(s.shakeX) - 4, -Math.abs(s.shakeY) - 4, W + 8, H + 8);

  // Grid
  ctx.strokeStyle = `rgba(255,255,255,${0.03 + feverIntensity * 0.04})`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (inFever) {
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, `rgba(220,30,0,${0.18 * feverIntensity})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // Slow-mo blue vignette overlay
  if (inSlowMo) {
    const slowAlpha = (s.slowMoFrames / SLOW_MO_DURATION) * 0.22;
    const sg = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.9);
    sg.addColorStop(0, "transparent");
    sg.addColorStop(1, `rgba(80,140,255,${slowAlpha})`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
  }

  // Aim line — fade out toward the end
  if (s.phase === "aim") {
    const pts = computeAimLine(launcherX, launcherY, aimAngle, s.pegs);
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(255,255,100,0.3)";
    ctx.shadowBlur = 4;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]; const cur = pts[i];
      if (!prev || !cur) continue;
      const t = i / pts.length;
      // Fade from 0.5 → 0 in the last 40% of the line
      const alpha = t < 0.6 ? 0.4 : 0.4 * (1 - (t - 0.6) / 0.4);
      ctx.strokeStyle = `rgba(255,255,180,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pegs
  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pulseExtra = inFever && p.orange ? Math.sin(s.feverPulse * 2) * 2 : 0;
    const r = (PEG_R + pulseExtra) * p.scale;

    if (p.orange) {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#fff8cc");
      grad.addColorStop(0.35, "#ff9900");
      grad.addColorStop(0.75, "#dd4400");
      grad.addColorStop(1, "#991100");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = inFever ? "#ff3300" : "#ff8800";
        ctx.shadowBlur = inFever ? 18 + feverIntensity * 10 : 12;
      }
    } else if (p.green) {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#eeffcc");
      grad.addColorStop(0.35, "#44ff88");
      grad.addColorStop(0.75, "#00bb44");
      grad.addColorStop(1, "#005522");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = 14 + Math.sin(s.feverPulse * 1.5) * 4;
      }
    } else {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#cceeff");
      grad.addColorStop(0.4, "#3377dd");
      grad.addColorStop(0.8, "#1144aa");
      grad.addColorStop(1, "#001166");
      ctx.fillStyle = grad;
      if (!p.hit) { ctx.shadowColor = "#3366cc"; ctx.shadowBlur = 6; }
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(p.x - 2, p.y - 2.5, r * 0.35, r * 0.25, -0.3, 0, Math.PI * 2); ctx.fill();

    if (p.popping) {
      ctx.strokeStyle = p.orange ? "#ffcc00" : "#66aaff";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.8;
      const ringR = PEG_R + (1 - p.popAlpha) * 22;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = alpha * 0.4;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  // Particles
  for (const p of s.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * Math.max(0, p.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Ball trail
  if (s.ball?.active) {
    const trail = s.ball.trail;
    for (let i = 0; i < trail.length; i++) {
      const tp = trail[i]; if (!tp) continue;
      const t = i / trail.length;
      const speedFactor = Math.min(1, (tp.speed || 8) / 18);
      ctx.save();
      ctx.globalAlpha = t * t * 0.65;
      const hot = t > 0.65;
      ctx.fillStyle = hot ? "#ffffcc" : "#ffaa44";
      ctx.shadowColor = hot ? "#ffff88" : "#ff8800";
      ctx.shadowBlur = 4 + speedFactor * 12;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, BALL_R * t * (0.8 + speedFactor * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const grad = ctx.createRadialGradient(s.ball.x - 3, s.ball.y - 3, 1, s.ball.x, s.ball.y, BALL_R);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, "#fffacc");
    grad.addColorStop(0.7, "#ffcc00");
    grad.addColorStop(1, "#cc8800");
    ctx.fillStyle = grad;
    ctx.shadowColor = inSlowMo ? "#88ccff" : "#ffdd00";
    ctx.shadowBlur = inSlowMo ? 28 : 18;
    ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath(); ctx.ellipse(s.ball.x - 3, s.ball.y - 3, 3, 2, -0.5, 0, Math.PI * 2); ctx.fill();
  }

  // Floating score texts
  for (const t of s.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.life * 2);
    ctx.font = t.combo ? "bold 13px monospace" : "bold 11px monospace";
    ctx.fillStyle = t.color;
    ctx.textAlign = "center";
    ctx.shadowColor = t.color;
    ctx.shadowBlur = t.combo ? 12 : 6;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  // Launcher
  ctx.save();
  ctx.translate(launcherX, launcherY);
  const launchGrad = ctx.createRadialGradient(-2, -3, 2, 0, 0, 14);
  launchGrad.addColorStop(0, "#cccccc");
  launchGrad.addColorStop(0.5, "#888888");
  launchGrad.addColorStop(1, "#333333");
  ctx.fillStyle = launchGrad;
  ctx.strokeStyle = "#bbbbbb"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (s.phase === "aim") {
    ctx.save(); ctx.rotate(aimAngle);
    const barGrad = ctx.createLinearGradient(0, -5, 0, 5);
    barGrad.addColorStop(0, "#dddddd");
    barGrad.addColorStop(1, "#888888");
    ctx.fillStyle = barGrad;
    ctx.strokeStyle = "#eeeeee"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(2, -4, 22, 8, 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#aaaaff"; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Bucket
  const bx = s.bucket, by = H - BUCKET_H - 4;
  ctx.save();
  const bucketGlow = s.bucketFlash > 0 ? s.bucketFlash : 1;
  ctx.shadowColor = s.bucketFlash > 0 ? "#ffffff" : "#00ffcc";
  ctx.shadowBlur = 8 + bucketGlow * 20;

  const bucketGrad = ctx.createLinearGradient(bx, by, bx, by + BUCKET_H);
  bucketGrad.addColorStop(0, s.bucketFlash > 0 ? `rgba(200,255,240,${0.3 + s.bucketFlash * 0.7})` : "#005544");
  bucketGrad.addColorStop(1, s.bucketFlash > 0 ? `rgba(0,255,200,${0.5 + s.bucketFlash * 0.5})` : "#003322");
  ctx.fillStyle = bucketGrad;
  ctx.strokeStyle = s.bucketFlash > 0 ? `rgba(255,255,255,${0.5 + s.bucketFlash * 0.5})` : "#00ffcc";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bx, by, BUCKET_W, BUCKET_H, 3); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = `rgba(0,255,200,${0.15 + s.bucketFlash * 0.2})`;
  ctx.beginPath(); ctx.roundRect(bx + 3, by + 3, BUCKET_W - 6, BUCKET_H / 2 - 2, 2); ctx.fill();
  ctx.fillStyle = s.bucketFlash > 0 ? "#ffffff" : "#00ffcc";
  ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  ctx.fillText("FREE BALL", bx + BUCKET_W / 2, by + BUCKET_H - 5);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, H - 3, W, 3);

  ctx.restore();

  if (s.flashWhite > 0) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, s.flashWhite * 0.35);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}
