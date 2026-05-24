"use client";

import type { UiState } from "../types";

interface GameHudProps {
  ui: UiState;
  bestScore: number;
  displayName: string | null;
  onActivateMultiball: () => void;
  onMenu: () => void;
}

function Sep() {
  return (
    <div
      style={{
        width: 4,
        alignSelf: "stretch",
        margin: "5px 1px",
        borderLeft: "1px solid var(--t-border-dark)",
        borderRight: "1px solid var(--t-border-light)",
        flexShrink: 0,
      }}
    />
  );
}

function HudStat({
  label,
  value,
  accent,
  muted,
  minW = 48,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  muted?: boolean;
  minW?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 10px",
        minWidth: minW,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: "var(--t-text-xs)",
          color: "var(--t-text-muted)",
          lineHeight: 1,
          marginBottom: 2,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--t-text-sm)",
          fontWeight: "bold",
          color: accent ? "var(--t-accent)" : muted ? "var(--t-text-muted)" : "var(--t-text)",
          fontFamily: "var(--t-font-display)",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function GameHud({ ui, bestScore, displayName, onActivateMultiball, onMenu }: GameHudProps) {
  const showMultiball = !ui.multiballUsed || ui.multiballPending || ui.multiballReady;
  const mbClickable = ui.multiballReady && !ui.multiballPending && ui.phase === "aim";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        height: 36,
        flexShrink: 0,
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-bg)",
        overflow: "hidden",
      }}
    >
      {/* Menu button — far left */}
      <button
        onClick={onMenu}
        title="Retour au menu principal"
        style={{
          height: "100%",
          padding: "0 10px",
          fontFamily: "var(--t-font-display)",
          fontSize: "var(--t-text-md)",
          cursor: "pointer",
          background: "var(--t-bg)",
          color: "var(--t-text-muted)",
          borderTopWidth: 0,
          borderLeftWidth: 0,
          borderBottomWidth: 0,
          borderRightWidth: 2,
          borderRightStyle: "solid",
          borderRightColor: "var(--t-border-dark)",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ≡
      </button>

      <HudStat label="NVX" value={ui.level} minW={40} />
      <Sep />
      <HudStat label="SCORE" value={ui.score.toLocaleString()} minW={88} />
      <Sep />
      <HudStat label="🪟 FENÊTRES" value={`${ui.orangeLeft} / ${ui.orangeTotal}`} accent minW={84} />
      <Sep />
      <HudStat label="BILLES" value={ui.balls} minW={52} />

      {ui.combo >= 3 && (
        <>
          <Sep />
          <HudStat
            label="COMBO"
            value={`×${Math.max(1, Math.floor(ui.combo / 3))}`}
            accent
            minW={56}
          />
        </>
      )}

      {bestScore > 0 && (
        <>
          <Sep />
          <HudStat label="MEILLEUR" value={bestScore.toLocaleString()} muted minW={80} />
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Right group: multiball + player name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 8 }}>
        {showMultiball && (
          <button
            onClick={onActivateMultiball}
            disabled={!mbClickable}
            title="Tirer 3 balles simultanément — 1 fois par niveau"
            style={{
              height: 22,
              padding: "0 10px",
              fontSize: "var(--t-text-xs)",
              fontFamily: "var(--t-font-display)",
              cursor: mbClickable ? "pointer" : "default",
              background: ui.multiballPending
                ? "linear-gradient(to bottom, #ffcc44, #ff8800)"
                : ui.multiballReady
                  ? "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))"
                  : "var(--t-app-bg)",
              color: ui.multiballPending ? "#000" : ui.multiballReady ? "#fff" : "var(--t-text-muted)",
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor:
                mbClickable || ui.multiballPending ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderLeftColor:
                mbClickable || ui.multiballPending ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              opacity: ui.multiballUsed && !ui.multiballPending ? 0.5 : 1,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {ui.multiballPending ? "⚡ PRÊT !" : "⚡×3"}
          </button>
        )}

        {displayName && (
          <>
            <Sep />
            <span
              style={{
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-muted)",
                padding: "0 8px",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
