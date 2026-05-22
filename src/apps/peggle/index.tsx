"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { AppProps } from "@/types";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useAuth } from "@/lib/contexts/auth-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 480;
const H = 520;
const BALL_R = 8;
const PEG_R = 7;
const BUCKET_W = 72;
const BUCKET_H = 18;
const GRAVITY = 0.28;
const LAUNCH_SPEED = 14;
const WALL_BOUNCE = 0.72;
const PEG_BOUNCE = 0.55;
const FRICTION = 0.998;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Peg {
  x: number;
  y: number;
  hit: boolean;
  orange: boolean;
  popping: boolean;
  popAlpha: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  trail: { x: number; y: number }[];
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
function buildLevel(): Peg[] {
  const pegs: Peg[] = [];
  const ROWS = 8;
  const COLS = 9;
  const marginX = 48;
  const marginY = 100;
  const spacingX = (W - marginX * 2) / (COLS - 1);
  const spacingY = (H - marginY - 80) / (ROWS - 1);

  for (let r = 0; r < ROWS; r++) {
    const count = r % 2 === 0 ? COLS : COLS - 1;
    const offsetX = r % 2 === 0 ? 0 : spacingX / 2;
    for (let c = 0; c < count; c++) {
      const x = marginX + offsetX + c * spacingX;
      const y = marginY + r * spacingY;
      pegs.push({ x, y, hit: false, orange: false, popping: false, popAlpha: 1 });
    }
  }

  const orangeCount = Math.floor(pegs.length * 0.3);
  const indices = [...Array(pegs.length).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < orangeCount; i++) {
    const idx = indices[i];
    if (idx !== undefined && pegs[idx]) pegs[idx].orange = true;
  }

  return pegs;
}

// ─── Collision ────────────────────────────────────────────────────────────────
function circleCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  px: number, py: number, pr: number
): { vx: number; vy: number } | null {
  const dx = bx - px;
  const dy = by - py;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > br + pr) return null;
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

  for (let i = 0; i < 90; i++) {
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
    pegs: buildLevel(),
    ball: null,
    balls: 10,
    score: 0,
    phase: "aim",
    bucket: W / 2 - BUCKET_W / 2,
    bucketDir: 1.4,
    message: "",
  });
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: W / 2, y: 0 });
  const { playPop, playBip, playVictory, playDelete } = useSoundContext();
  const { user } = useAuth();
  const [uiState, setUiState] = useState({
    balls: 10, score: 0, orangeLeft: 0, orangeTotal: 0,
    phase: "aim" as string, message: "",
  });
  const [tab, setTab] = useState<"game" | "leaderboard">("game");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const syncUI = useCallback(() => {
    const s = stateRef.current;
    const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
    const orangeTotal = stateRef.current.pegs.filter(p => p.orange).length +
      stateRef.current.pegs.filter(p => p.orange && p.hit).length;
    setUiState({ balls: s.balls, score: s.score, orangeLeft, orangeTotal, phase: s.phase, message: s.message });
  }, []);

  // Track orange total at game start
  const orangeTotalRef = useRef(0);

  const resetGame = useCallback(() => {
    const pegs = buildLevel();
    orangeTotalRef.current = pegs.filter(p => p.orange).length;
    stateRef.current = {
      pegs,
      ball: null,
      balls: 10,
      score: 0,
      phase: "aim",
      bucket: W / 2 - BUCKET_W / 2,
      bucketDir: 1.4,
      message: "",
    };
    setScoreSubmitted(false);
    syncUI();
  }, [syncUI]);

  // Submit score when game ends
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

      s.bucket += s.bucketDir;
      if (s.bucket <= 0) { s.bucket = 0; s.bucketDir = Math.abs(s.bucketDir); }
      if (s.bucket + BUCKET_W >= W) { s.bucket = W - BUCKET_W; s.bucketDir = -Math.abs(s.bucketDir); }

      if (s.ball && s.ball.active) {
        const b = s.ball;
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 18) b.trail.shift();
        b.x += b.vx; b.y += b.vy;
        b.vy += GRAVITY; b.vx *= FRICTION;

        if (b.x - BALL_R < 0) { b.vx = Math.abs(b.vx) * WALL_BOUNCE; b.x = BALL_R; playBip(); }
        if (b.x + BALL_R > W) { b.vx = -Math.abs(b.vx) * WALL_BOUNCE; b.x = W - BALL_R; playBip(); }

        for (const p of s.pegs) {
          if (p.hit) continue;
          const result = circleCollide(b.x, b.y, b.vx, b.vy, BALL_R, p.x, p.y, PEG_R);
          if (result) {
            b.vx = result.vx; b.vy = result.vy;
            const dx = b.x - p.x, dy = b.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const overlap = BALL_R + PEG_R - dist + 1;
            b.x += (dx / dist) * overlap; b.y += (dy / dist) * overlap;
            p.hit = true; p.popping = true;
            s.score += p.orange ? 100 : 10;
            if (p.orange) playPop(); else playBip();
          }
        }

        const bucketTop = H - BUCKET_H - 4;
        if (b.y + BALL_R >= bucketTop && b.x >= s.bucket && b.x <= s.bucket + BUCKET_W) {
          s.balls += 1;
          playVictory();
          b.active = false;
        }

        if (b.y > H + 40) b.active = false;
      }

      for (const p of s.pegs) {
        if (p.popping) {
          p.popAlpha -= 0.05;
          if (p.popAlpha <= 0) { p.popAlpha = 0; p.popping = false; }
        }
      }

      if (s.ball && !s.ball.active) {
        s.ball = null;
        s.pegs = s.pegs.filter(p => !p.hit || p.popping);
        s.pegs = s.pegs.filter(p => !p.hit);
        const orangeLeft = s.pegs.filter(p => p.orange).length;

        if (orangeLeft === 0) {
          s.phase = "won";
          s.message = "NIVEAU TERMINÉ !";
          playVictory();
          submitScore(s.score, true);
        } else if (s.balls <= 0) {
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

      {tab === "game" && (
        <>
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
              PEGGLE 98
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <StatCard label="SCORE" value={uiState.score.toLocaleString()} />
              <StatCard label="🟠 PEGS" value={`${uiState.orangeLeft} / ${uiState.orangeTotal}`} accent />
              <StatCard label="BILLES" value={uiState.balls} />
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
                    minWidth: 220,
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

                  {/* Score recap */}
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>SCORE FINAL</div>
                    <div style={{ fontSize: "var(--t-text-2xl)", fontWeight: "bold", color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>
                      {uiState.score.toLocaleString()}
                    </div>
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
                    <button
                      onClick={resetGame}
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
                      onClick={() => { resetGame(); setTab("leaderboard"); }}
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
        </>
      )}

      {tab === "leaderboard" && (
        <div className="flex flex-col flex-1 overflow-hidden" style={{ padding: 12, gap: 8 }}>
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
      )}
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
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (s.phase === "aim") {
    const pts = computeAimLine(launcherX, launcherY, aimAngle, s.pegs);
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(255,255,180,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i]; if (!pt) continue;
      if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.orange) {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, PEG_R);
      grad.addColorStop(0, "#fff4aa");
      grad.addColorStop(0.4, "#ff9900");
      grad.addColorStop(1, "#cc4400");
      ctx.fillStyle = grad;
      if (!p.hit) { ctx.shadowColor = "#ff8800"; ctx.shadowBlur = 10; }
    } else {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, PEG_R);
      grad.addColorStop(0, "#aaddff");
      grad.addColorStop(0.5, "#2266cc");
      grad.addColorStop(1, "#001166");
      ctx.fillStyle = grad;
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath(); ctx.arc(p.x - 2, p.y - 2, PEG_R * 0.4, 0, Math.PI * 2); ctx.fill();
    if (p.popping) {
      ctx.strokeStyle = p.orange ? "#ffcc00" : "#66aaff";
      ctx.lineWidth = 2;
      const r = PEG_R + (1 - p.popAlpha) * 18;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  if (s.ball?.active) {
    const trail = s.ball.trail;
    for (let i = 0; i < trail.length; i++) {
      const tp = trail[i]; if (!tp) continue;
      ctx.save();
      ctx.globalAlpha = (i / trail.length) * 0.5;
      ctx.fillStyle = "#ffffaa";
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, BALL_R * (i / trail.length) * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const grad = ctx.createRadialGradient(s.ball.x - 3, s.ball.y - 3, 1, s.ball.x, s.ball.y, BALL_R);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#ffeeaa");
    grad.addColorStop(1, "#ccaa00");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#ffff00"; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.save();
  ctx.translate(launcherX, launcherY);
  ctx.fillStyle = "#888"; ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (s.phase === "aim") {
    ctx.save(); ctx.rotate(aimAngle);
    ctx.fillStyle = "#aaa"; ctx.strokeStyle = "#eee"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(0, -5, 24, 10); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const bx = s.bucket, by = H - BUCKET_H - 4;
  ctx.save();
  ctx.shadowColor = "#00ffcc"; ctx.shadowBlur = 8;
  ctx.fillStyle = "#006655"; ctx.strokeStyle = "#00ffcc"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.rect(bx, by, BUCKET_W, BUCKET_H); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0,255,200,0.2)";
  ctx.beginPath(); ctx.rect(bx + 2, by + 2, BUCKET_W - 4, BUCKET_H / 2 - 2); ctx.fill();
  ctx.fillStyle = "#00ffcc"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  ctx.fillText("FREE BALL", bx + BUCKET_W / 2, by + BUCKET_H - 5);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, H - 3, W, 3);
}
