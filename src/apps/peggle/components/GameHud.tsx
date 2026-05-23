"use client";

import { StatCard } from "./StatCard";
import type { UiState } from "../types";

interface GameHudProps {
  ui: UiState;
  bestScore: number;
  displayName: string | null;
  onActivateMultiball: () => void;
}

export function GameHud({ ui, bestScore, displayName, onActivateMultiball }: GameHudProps) {
  const showMultiball = !ui.multiballUsed || ui.multiballPending || ui.multiballReady;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px 8px",
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-bg)",
        gap: 5,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", minWidth: 40 }}>
        NVX {ui.level}
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <StatCard label="SCORE" value={ui.score.toLocaleString()} />
        <StatCard label="🟠 PEGS" value={`${ui.orangeLeft} / ${ui.orangeTotal}`} accent />
        <StatCard label="BILLES" value={ui.balls} />
        {ui.combo >= 3 && (
          <StatCard label="COMBO" value={`×${Math.max(1, Math.floor(ui.combo / 3))}`} accent />
        )}
        {bestScore > 0 && (
          <StatCard label="BEST" value={bestScore.toLocaleString()} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {showMultiball && (
          <button
            onClick={onActivateMultiball}
            disabled={!ui.multiballReady || ui.multiballPending || ui.phase !== "aim"}
            title="Tirer 3 balles simultanément — 1 fois par niveau"
            style={{
              padding: "3px 8px",
              fontSize: "var(--t-text-xs)",
              fontFamily: "var(--t-font-display)",
              cursor: ui.multiballReady && ui.phase === "aim" ? "pointer" : "default",
              background: ui.multiballPending
                ? "linear-gradient(to bottom, #ffcc44, #ff8800)"
                : ui.multiballReady
                ? "linear-gradient(to bottom, #444466, #222233)"
                : "var(--t-app-bg)",
              color: ui.multiballPending
                ? "#000000"
                : ui.multiballReady
                ? "#aaccff"
                : "var(--t-text-muted)",
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor: ui.multiballReady ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderLeftColor: ui.multiballReady ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              opacity: ui.multiballUsed && !ui.multiballPending ? 0.45 : 1,
              transition: "opacity 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {ui.multiballPending ? "⚡ PRÊT !" : "⚡×3"}
          </button>
        )}

        {displayName && (
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            {displayName}
          </div>
        )}
      </div>
    </div>
  );
}
