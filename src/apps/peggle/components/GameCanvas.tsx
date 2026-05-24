"use client";

import { useRef, useEffect, useState } from "react";
import type { UiState } from "../types";
import { W, H } from "../constants";

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ui: UiState;
  bestScore: number;
  user: { name?: string | null; email?: string | null; id?: string } | null;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onReplay: () => void;
  onNextLevel: () => void;
  onLeaderboard: () => void;
}

export function GameCanvas({
  canvasRef,
  ui,
  bestScore,
  user,
  onMouseMove,
  onClick,
  onReplay,
  onNextLevel,
  onLeaderboard,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cssSize, setCssSize] = useState({ w: W, h: H });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      const scale = Math.min(width / W, height / H);
      setCssSize({ w: Math.floor(W * scale), h: Math.floor(H * scale) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const btnBase: React.CSSProperties = {
    padding: "6px 18px",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-sm)",
    cursor: "pointer",
    borderWidth: 2,
    borderStyle: "solid",
    borderTopColor: "var(--t-border-light)",
    borderLeftColor: "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--t-app-bg)" }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: cssSize.w,
          height: cssSize.h,
          cursor: ui.phase === "aim" ? "crosshair" : "default",
          display: "block",
          imageRendering: "pixelated",
          touchAction: "none",
        }}
        onMouseMove={onMouseMove}
        onClick={onClick}
      />

      {(ui.phase === "won" || ui.phase === "lost") && (
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
                color: ui.phase === "won" ? "var(--t-success, #22c55e)" : "var(--t-error, #ef4444)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              {ui.phase === "won" ? "🎉 VICTOIRE !" : "💀 GAME OVER"}
            </div>

            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>SCORE FINAL</div>
              <div style={{ fontSize: "var(--t-text-2xl)", fontWeight: "bold", color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>
                {ui.score.toLocaleString()}
              </div>
              {bestScore > 0 && ui.score >= bestScore && (
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
              {ui.phase === "won" && (
                <button
                  onClick={onNextLevel}
                  style={{
                    ...btnBase,
                    background: "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))",
                    color: "var(--t-text)",
                  }}
                >
                  Niveau suivant →
                </button>
              )}
              <button
                onClick={onReplay}
                style={{ ...btnBase, background: "var(--t-bg)", color: "var(--t-text)" }}
              >
                Rejouer
              </button>
              <button
                onClick={onLeaderboard}
                style={{ ...btnBase, background: "var(--t-bg)", color: "var(--t-accent)" }}
              >
                🏆 Classement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
