"use client";

import { useRef, useEffect, useState } from "react";
import type { RefObject, MouseEvent } from "react";
import type { UiState } from "../types";
import { W, H } from "../constants";
import { captionBtn, btnRaised, btnPrimary } from "../styles";

interface GameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  ui: UiState;
  bestScore: number;
  user: { name?: string | null; email?: string | null; id?: string } | null;
  onMouseMove: (e: MouseEvent<HTMLCanvasElement>) => void;
  onClick: (e: MouseEvent<HTMLCanvasElement>) => void;
  onReplay: () => void;
  onNextLevel: () => void;
  onLeaderboard: () => void;
  onMenu: () => void;
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
  onMenu,
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

  const isGameOver = ui.phase === "won" || ui.phase === "lost";
  const isWin = ui.phase === "won";
  const isRecord = ui.score > 0 && ui.score >= bestScore;
  const displayUser = user?.name ?? user?.email ?? null;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex items-center justify-center overflow-hidden"
      style={{ background: "#003a3a" }}
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

      {isGameOver && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          {/* Win98 dialog */}
          <div
            style={{
              background: "var(--t-bg)",
              borderWidth: 3,
              borderStyle: "solid",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              minWidth: 280,
              maxWidth: 340,
              boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            {/* Titlebar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
                padding: "4px 6px 4px 8px",
                gap: 4,
              }}
            >
              <span style={{ fontSize: "var(--t-text-xs)", color: "#fff", flex: 1 }}>
                🎮 Peggle 98
              </span>
              {(["─", "□", "×"] as const).map((ch) => (
                <div key={ch} style={captionBtn}>{ch}</div>
              ))}
            </div>

            {/* Content */}
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "20px 24px 16px",
              }}
            >
              <div style={{ fontSize: 40, lineHeight: 1, flexShrink: 0, paddingTop: 2 }}>
                {isWin ? "🎉" : "💀"}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "var(--t-text-lg)",
                    fontWeight: "bold",
                    color: isWin ? "var(--t-success)" : "var(--t-error)",
                    marginBottom: 10,
                    lineHeight: 1.1,
                  }}
                >
                  {isWin ? "VICTOIRE !" : "GAME OVER"}
                </div>

                <div
                  style={{
                    fontSize: "var(--t-text-xs)",
                    color: "var(--t-text-muted)",
                    marginBottom: 4,
                  }}
                >
                  SCORE FINAL
                </div>

                <div
                  style={{
                    display: "inline-block",
                    padding: "3px 14px",
                    background: "var(--t-app-bg)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderTopColor: "var(--t-border-dark)",
                    borderLeftColor: "var(--t-border-dark)",
                    borderBottomColor: "var(--t-border-light)",
                    borderRightColor: "var(--t-border-light)",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--t-text-2xl)",
                      fontWeight: "bold",
                      color: "var(--t-text)",
                    }}
                  >
                    {ui.score.toLocaleString()}
                  </span>
                </div>

                {isRecord && (
                  <div style={{ fontSize: "var(--t-text-xs)", color: "#ffcc00", marginBottom: 4 }}>
                    ⭐ NOUVEAU RECORD !
                  </div>
                )}

                <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                  {displayUser
                    ? `Score enregistré pour ${displayUser}`
                    : "Connectez-vous pour sauver votre score"}
                </div>
              </div>
            </div>

            {/* Button row */}
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                padding: "10px 20px 14px",
                borderTop: "1px solid var(--t-border-dark)",
                flexWrap: "wrap",
              }}
            >
              {isWin && (
                <button onClick={onNextLevel} style={btnPrimary}>
                  Niveau suivant →
                </button>
              )}
              <button onClick={onReplay} style={btnRaised}>
                Rejouer
              </button>
              {!isWin && (
                <button
                  onClick={onLeaderboard}
                  style={{ ...btnRaised, color: "var(--t-accent)" }}
                >
                  🏆 Classement
                </button>
              )}
              <button onClick={onMenu} style={{ ...btnRaised, color: "var(--t-text-muted)" }}>
                ≡ Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
