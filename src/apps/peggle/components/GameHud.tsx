"use client";

import { StatCard } from "./StatCard";
import type { UiState } from "../types";

interface GameHudProps {
  ui: UiState;
  bestScore: number;
  displayName: string | null;
}

export function GameHud({ ui, bestScore, displayName }: GameHudProps) {
  return (
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
        NVX {ui.level}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
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
      {displayName && (
        <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
          {displayName}
        </div>
      )}
    </div>
  );
}
