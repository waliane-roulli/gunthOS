"use client";

import type { UiState } from "../types";
import { RelicBar } from "./RelicBar";

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
  urgent,
  warn,
  minW = 48,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  muted?: boolean;
  urgent?: boolean;
  warn?: boolean;
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
        background: urgent
          ? "rgba(180,0,0,0.18)"
          : warn
            ? "rgba(200,120,0,0.14)"
            : undefined,
      }}
    >
      <span
        style={{
          fontSize: "var(--t-text-xs)",
          color: urgent ? "#ff7777" : warn ? "#ffaa44" : "var(--t-text-muted)",
          lineHeight: 1,
          marginBottom: 2,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        className={urgent ? "animate-pulse" : undefined}
        style={{
          fontSize: "var(--t-text-sm)",
          fontWeight: "bold",
          color: urgent
            ? "#ff4444"
            : warn
              ? "#ff9900"
              : accent
                ? "var(--t-accent)"
                : muted
                  ? "var(--t-text-muted)"
                  : "var(--t-text)",
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
  const inFever = ui.orangeLeft > 0 && ui.orangeLeft <= 3;
  const lowBalls = ui.balls <= 2 && ui.balls > 0;

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
      {/* Menu button */}
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
      {ui.bossLevel && (
        <>
          <Sep />
          <HudStat label="BOSS" value="👑" accent minW={40} />
        </>
      )}
      <Sep />
      <HudStat label="SCORE" value={ui.score.toLocaleString()} minW={88} />
      <Sep />
      <HudStat label="🪟 FENÊTRES" value={`${ui.orangeLeft} / ${ui.orangeTotal}`} accent={!inFever} urgent={inFever} minW={84} />
      <Sep />
      <HudStat label="BILLES" value={ui.balls} warn={lowBalls} minW={52} />

      {ui.combo >= 3 && (
        <>
          <Sep />
          <HudStat label="COMBO" value={`×${Math.max(1, Math.floor(ui.combo / 3))}`} accent minW={56} />
        </>
      )}

      {bestScore > 0 && (
        <>
          <Sep />
          <HudStat label="MEILLEUR" value={bestScore.toLocaleString()} muted minW={80} />
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Active effects + relics */}
      <RelicBar relics={ui.relics} spookyActive={ui.spookyActive} magnetFrames={ui.magnetFrames} />

      <Sep />

      {/* Right group: multiball + player */}
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
              borderTopColor: mbClickable || ui.multiballPending ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderLeftColor: mbClickable || ui.multiballPending ? "var(--t-border-light)" : "var(--t-border-dark)",
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
