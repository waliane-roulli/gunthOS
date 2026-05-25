"use client";

import "../peagle.css";
import type { UiState } from "../engine/types";
import { RelicBar } from "./RelicBar";
import { PG } from "../styles";

// Overrides forêt — remplace les tokens cyberpunk pour le HUD
const HUD = {
  bg:        "#060e04",
  surface:   "#0c1a08",
  surface2:  "#122010",
  sh:        "#020501",
  hi:        "#2a4a22",
  text:      "#c8e8b0",
  textMuted: "#4a7040",
  accent:    "#88cc44",   // vert-lime luciole (remplace cyan)
  accentDim: "#446622",
} as const;

interface GameHudProps {
  ui: UiState;
  bestScore: number;
  displayName: string | null;
  isAdmin?: boolean;
  showDevTools?: boolean;
  onActivateMultiball: () => void;
  onSkipLevel?: () => void;
  onOpenDevPanel?: () => void;
  onMenu: () => void;
}

function Sep() {
  return (
    <div
      style={{
        width: 3,
        alignSelf: "stretch",
        margin: "4px 1px",
        borderLeft: `1px solid ${HUD.sh}`,
        borderRight: `1px solid ${HUD.hi}`,
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
          color: urgent ? PG.orange : warn ? "#ffaa44" : HUD.textMuted,
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
                ? HUD.accent
                : muted
                  ? HUD.textMuted
                  : HUD.text,
          fontFamily: "var(--pg-font)",
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow: urgent
            ? `0 0 8px ${PG.orange}`
            : accent
              ? `0 0 6px ${HUD.accent}88`
              : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function GameHud({ ui, bestScore, displayName, isAdmin, showDevTools, onActivateMultiball, onSkipLevel, onOpenDevPanel, onMenu }: GameHudProps) {
  const showMultiball = !ui.multiballUsed || ui.multiballPending || ui.multiballReady;
  const mbClickable = ui.multiballReady && !ui.multiballPending && ui.phase === "aim";
  const inFever = ui.orangeLeft > 0 && ui.orangeLeft <= 3;
  const lowBalls = ui.balls <= 2 && ui.balls > 0;

  const menuBtn = (
    <button
      onClick={onMenu}
      title="Retour au nid principal. L'aigle ne vous retiendra pas."
      style={{
        height: "100%",
        padding: "0 10px",
        fontFamily: "var(--pg-font)",
        fontSize: 12,
        cursor: "pointer",
        background: HUD.surface2,
        color: HUD.textMuted,
        border: "none",
        borderRight: `2px solid ${HUD.sh}`,
        flexShrink: 0,
        lineHeight: 1,
        transition: "color 0.1s, background 0.1s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = PG.orange; e.currentTarget.style.background = HUD.bg; }}
      onMouseLeave={e => { e.currentTarget.style.color = HUD.textMuted; e.currentTarget.style.background = HUD.surface2; }}
    >
      ≡
    </button>
  );

  const multiballBtn = showMultiball && (
    <button
      onClick={onActivateMultiball}
      disabled={!mbClickable}
      title="Ponte triple — l'aigle pond 3 œufs d'un coup. Science inexpliquée."
      style={{
        height: 24,
        padding: "0 8px",
        fontSize: 7,
        fontFamily: "var(--pg-font)",
        cursor: mbClickable ? "pointer" : "default",
        background: ui.multiballPending
          ? `linear-gradient(to bottom, ${HUD.accent}, #558822)`
          : ui.multiballReady
            ? `linear-gradient(to bottom, ${PG.orange}, #cc4400)`
            : HUD.bg,
        color: ui.multiballPending ? "#000" : ui.multiballReady ? "#fff" : HUD.textMuted,
        borderWidth: 2,
        borderStyle: "solid",
        borderTopColor: mbClickable || ui.multiballPending ? HUD.hi : HUD.sh,
        borderLeftColor: mbClickable || ui.multiballPending ? HUD.hi : HUD.sh,
        borderBottomColor: HUD.sh,
        borderRightColor: HUD.sh,
        opacity: ui.multiballUsed && !ui.multiballPending ? 0.4 : 1,
        whiteSpace: "nowrap",
        lineHeight: 1,
        textShadow: ui.multiballReady ? "0 1px 0 rgba(0,0,0,0.6)" : undefined,
        boxShadow: ui.multiballReady ? `0 0 8px ${PG.orange}66` : undefined,
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {ui.multiballPending ? ">>PONTE!" : "×3🥚"}
    </button>
  );

  return (
    <div
      className="peagle-root pg-hud-scrollable"
      style={{
        display: "flex",
        alignItems: "stretch",
        height: 38,
        flexShrink: 0,
        borderBottom: `2px solid ${HUD.sh}`,
        borderTop: `1px solid ${HUD.hi}`,
        background: HUD.surface,
      }}
    >
      {menuBtn}

      {/* Stats — toujours visibles, scroll horizontal sur mobile */}
      <HudStat label="NID" value={ui.level} minW={32} />
      {ui.bossLevel && (
        <>
          <Sep />
          <HudStat label="BOSS" value="⚠" accent minW={36} />
        </>
      )}
      <Sep />
      <HudStat label="SCORE" value={ui.score.toLocaleString()} minW={70} />
      <Sep />
      <HudStat
        label="PROIES"
        value={`${ui.orangeLeft}/${ui.orangeTotal}`}
        accent={!inFever}
        urgent={inFever}
        minW={68}
      />
      <Sep />
      <HudStat label="ŒUFS" value={ui.balls} warn={lowBalls} minW={40} />

      {ui.combo >= 3 && (
        <>
          <Sep />
          <HudStat label="ENVOL" value={`×${Math.max(1, Math.floor(ui.combo / 3))}`} accent minW={40} />
        </>
      )}

      {/* Record — masqué en mode compact (visible dans SidePanel droit) */}
      {bestScore > 0 && (
        <div className="pg-hud-record-wide">
          <Sep />
          <HudStat label="RECORD" value={bestScore.toLocaleString()} muted minW={80} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 4 }} />

      {/* Relics */}
      <RelicBar relics={ui.relics} spookyActive={ui.spookyActive} magnetFrames={ui.magnetFrames} />

      <Sep />

      {/* Boutons droite */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 6, flexShrink: 0 }}>
        {multiballBtn}

        {isAdmin && (
          <>
            <Sep />
            {showDevTools && (
              <button
                onClick={onSkipLevel}
                title="[DEV] Skip au niveau suivant"
                style={{
                  height: 24,
                  padding: "0 6px",
                  fontSize: 7,
                  fontFamily: "var(--pg-font)",
                  cursor: "pointer",
                  background: `linear-gradient(to bottom, #550099, #330066)`,
                  color: "#cc88ff",
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderTopColor: "#aa44ff",
                  borderLeftColor: "#aa44ff",
                  borderBottomColor: "#220033",
                  borderRightColor: "#220033",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                }}
              >
                ⏭
              </button>
            )}
            <button
              onClick={onOpenDevPanel}
              title="[DEV] Ouvrir les dev tools"
              style={{
                height: 24,
                padding: "0 6px",
                fontSize: 7,
                fontFamily: "var(--pg-font)",
                cursor: "pointer",
                background: `linear-gradient(to bottom, #330055, #1a0033)`,
                color: "#aa44ff",
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "#884dcc",
                borderLeftColor: "#884dcc",
                borderBottomColor: "#110022",
                borderRightColor: "#110022",
                whiteSpace: "nowrap",
                lineHeight: 1,
                letterSpacing: "0.04em",
              }}
            >
              ⚙
            </button>
          </>
        )}

        {displayName && (
          <>
            <Sep />
            <span
              style={{
                fontSize: 7,
                color: HUD.accentDim,
                padding: "0 6px",
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
