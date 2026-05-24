"use client";

import "../peggle.css";
import type { UiState } from "../engine/types";
import { RelicBar } from "./RelicBar";
import { PG } from "../styles";

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
        width: 3,
        alignSelf: "stretch",
        margin: "4px 1px",
        borderLeft: `1px solid ${PG.sh}`,
        borderRight: `1px solid ${PG.hi}`,
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
      className={urgent ? "pg-fever" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8px",
        minWidth: minW,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 6,
          color: urgent ? PG.orange : warn ? "#ffaa44" : PG.textMuted,
          lineHeight: 1,
          marginBottom: 3,
          whiteSpace: "nowrap",
          fontFamily: "var(--pg-font)",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span
        className={urgent ? "animate-pulse" : undefined}
        style={{
          fontSize: 10,
          fontWeight: "bold",
          color: urgent
            ? PG.orange
            : warn
              ? "#ff9900"
              : accent
                ? PG.cyan
                : muted
                  ? PG.textMuted
                  : PG.text,
          fontFamily: "var(--pg-font)",
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow: urgent
            ? `0 0 8px ${PG.orange}`
            : accent
              ? `0 0 6px ${PG.cyan}88`
              : undefined,
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
      className="peggle-root"
      style={{
        display: "flex",
        alignItems: "stretch",
        height: 38,
        flexShrink: 0,
        borderBottom: `2px solid ${PG.sh}`,
        borderTop: `1px solid ${PG.hi}`,
        background: PG.surface,
        overflow: "hidden",
      }}
    >
      {/* Menu button */}
      <button
        onClick={onMenu}
        title="Retour au menu principal"
        style={{
          height: "100%",
          padding: "0 12px",
          fontFamily: "var(--pg-font)",
          fontSize: 12,
          cursor: "pointer",
          background: PG.surface2,
          color: PG.textMuted,
          border: "none",
          borderRight: `2px solid ${PG.sh}`,
          flexShrink: 0,
          lineHeight: 1,
          transition: "color 0.1s, background 0.1s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = PG.orange; e.currentTarget.style.background = PG.bg; }}
        onMouseLeave={e => { e.currentTarget.style.color = PG.textMuted; e.currentTarget.style.background = PG.surface2; }}
      >
        ≡
      </button>

      <HudStat label="NVX" value={ui.level} minW={36} />
      {ui.bossLevel && (
        <>
          <Sep />
          <HudStat label="BOSS" value="[!]" accent minW={36} />
        </>
      )}
      <Sep />
      <HudStat label="SCORE" value={ui.score.toLocaleString()} minW={80} />
      <Sep />
      <HudStat
        label="CIBLES"
        value={`${ui.orangeLeft}/${ui.orangeTotal}`}
        accent={!inFever}
        urgent={inFever}
        minW={76}
      />
      <Sep />
      <HudStat label="BILLES" value={ui.balls} warn={lowBalls} minW={48} />

      {ui.combo >= 3 && (
        <>
          <Sep />
          <HudStat label="COMBO" value={`×${Math.max(1, Math.floor(ui.combo / 3))}`} accent minW={48} />
        </>
      )}

      {bestScore > 0 && (
        <>
          <Sep />
          <HudStat label="MEILLEUR" value={bestScore.toLocaleString()} muted minW={72} />
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Relics */}
      <RelicBar relics={ui.relics} spookyActive={ui.spookyActive} magnetFrames={ui.magnetFrames} />

      <Sep />

      {/* Right group */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 8 }}>
        {showMultiball && (
          <button
            onClick={onActivateMultiball}
            disabled={!mbClickable}
            title="Tirer 3 balles simultanément — 1 fois par niveau"
            style={{
              height: 24,
              padding: "0 10px",
              fontSize: 7,
              fontFamily: "var(--pg-font)",
              cursor: mbClickable ? "pointer" : "default",
              background: ui.multiballPending
                ? `linear-gradient(to bottom, ${PG.gold}, #cc8800)`
                : ui.multiballReady
                  ? `linear-gradient(to bottom, ${PG.orange}, #cc4400)`
                  : PG.bg,
              color: ui.multiballPending ? "#000" : ui.multiballReady ? "#fff" : PG.textMuted,
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor: mbClickable || ui.multiballPending ? PG.hi : PG.sh,
              borderLeftColor: mbClickable || ui.multiballPending ? PG.hi : PG.sh,
              borderBottomColor: PG.sh,
              borderRightColor: PG.sh,
              opacity: ui.multiballUsed && !ui.multiballPending ? 0.4 : 1,
              whiteSpace: "nowrap",
              lineHeight: 1,
              textShadow: ui.multiballReady ? "0 1px 0 rgba(0,0,0,0.6)" : undefined,
              boxShadow: ui.multiballReady ? `0 0 8px ${PG.orange}66` : undefined,
              letterSpacing: "0.04em",
            }}
          >
            {ui.multiballPending ? ">> PRÊT !" : ">>×3"}
          </button>
        )}

        {displayName && (
          <>
            <Sep />
            <span
              style={{
                fontSize: 7,
                color: PG.cyanDim,
                padding: "0 8px",
                whiteSpace: "nowrap",
                fontFamily: "var(--pg-font)",
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
