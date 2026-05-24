"use client";

import "../peagle.css";
import { captionBtn, PG } from "../styles";
import { PegIcon } from "./PegIcon";
import { PeagleLogo } from "./PeagleLogo";

interface MainMenuProps {
  bestScore: number;
  displayName: string | null;
  onPlay: () => void;
  onLeaderboard: () => void;
}

export function MainMenu({ bestScore, displayName, onPlay, onLeaderboard }: MainMenuProps) {
  return (
    <div
      className="peagle-root"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PG.bg,
        overflow: "hidden",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Starfield animé */}
      <div className="pg-starfield" />

      {/* Scan lines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Dialog centré */}
      <div className="pg-dialog" style={{ width: 320, flexShrink: 0, zIndex: 2 }}>
        {/* Titlebar */}
        <div className="pg-titlebar">
          <span style={{ fontSize: 9, color: "#aaaaee", flex: 1, fontFamily: "var(--pg-font)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 5 }}>
            <PegIcon id="eagle" size={10} /> PEAGLE 98
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={captionBtn}>{ch}</div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "28px 28px 20px" }}>

          {/* Hero — logo pixel art eagle + titre */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                display: "inline-block",
                padding: "16px 20px 12px",
                marginBottom: 12,
                background: PG.bg,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: PG.sh,
                borderLeftColor: PG.sh,
                borderBottomColor: PG.hi,
                borderRightColor: PG.hi,
              }}
            >
              <PeagleLogo />
            </div>

            <div
              style={{
                fontSize: 8,
                color: PG.textMuted,
                letterSpacing: "0.12em",
                fontFamily: "var(--pg-font)",
                animation: "pg-blink 2s step-end infinite",
              }}
            >
              [x] CASSEZ TOUTES LES CIBLES
            </div>
          </div>

          {/* Separator */}
          <div className="pg-sep" style={{ marginBottom: 20 }} />

          {/* Boutons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              onClick={onPlay}
              autoFocus
              className="pg-btn pg-btn-primary"
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 9,
                textAlign: "center",
                letterSpacing: "0.06em",
              }}
            >
              ▶  NOUVELLE PARTIE
            </button>

            <button
              onClick={onLeaderboard}
              className="pg-btn"
              style={{
                width: "100%",
                padding: "9px 0",
                fontSize: 8,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              ★  CLASSEMENT
            </button>
          </div>

          {/* Separator */}
          <div className="pg-sep" style={{ marginBottom: 14 }} />

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 7,
              color: PG.textMuted,
              fontFamily: "var(--pg-font)",
            }}
          >
            <span>
              {bestScore > 0 ? (
                <>
                  ⭐{" "}
                  <span style={{ color: PG.gold }}>{bestScore.toLocaleString()}</span>
                </>
              ) : (
                "-- PAS DE SCORE --"
              )}
            </span>
            <span style={{ color: displayName ? PG.cyan : PG.textMuted }}>
              {displayName ? `▶ ${displayName}` : "NON CONNECTÉ"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
