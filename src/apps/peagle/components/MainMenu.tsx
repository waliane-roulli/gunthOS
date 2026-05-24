"use client";

import { useMemo, useState } from "react";
import "../peagle.css";
import { captionBtn, PG } from "../styles";
import { PegIcon } from "./PegIcon";
import { PeagleLogo } from "./PeagleLogo";
import { DevPanel, type DevConfig } from "./DevPanel";

const TIPS = [
  "ASTUCE : Les cibles orange sont les vraies cibles. Les bleues ? Décoration. Comme les plumes inutiles de l'autruche.",
  "ASTUCE : Lancez l'œuf avec la souris. Oui, c'est tout. Non il n'y a pas d'autre mécanisme. Si.",
  "ASTUCE : Le panier en bas rapporte des œufs. L'aigle y a mis ses économies. Respectez le panier.",
  "ASTUCE : Les cibles vertes donnent des pouvoirs. L'aigle les a mangées par erreur. Ça a quand même marché.",
  "ASTUCE : Si vous perdez, c'est la physique. Jamais vous. La physique est injuste et l'aigle le sait.",
  "ASTUCE : Le mode Fièvre s'active quand il reste peu de cibles oranges. L'aigle devient incontrôlable. Comme d'habitude.",
  "ASTUCE : Vous lancez des œufs d'aigle sur des cibles. C'est exactement aussi stupide que ça en a l'air.",
  "ASTUCE : Les bombes explosent et détruisent les voisins. Exactement comme dans la vraie vie, mais en moins lourd.",
  "ASTUCE : Le score monte quand vous touchez des trucs. C'est à peu près toute la philosophie du jeu.",
  "ASTUCE : Ce jeu a été inspecté par des ornithologues. Aucun n'a survécu pour confirmer.",
  "ASTUCE : Vous jouez à Peggle. Mais avec des aigles. La FDA n'a pas encore statué si c'est un médicament.",
  "ASTUCE : Choisissez une classe avant de jouer. Le Faucon juge ceux qui choisissent le Pélican. Injustement.",
];

interface MainMenuProps {
  bestScore: number;
  displayName: string | null;
  isAdmin: boolean;
  onPlay: () => void;
  onLeaderboard: () => void;
  onDevLaunch: (cfg: DevConfig) => void;
}

export function MainMenu({ bestScore, displayName, isAdmin, onPlay, onLeaderboard, onDevLaunch }: MainMenuProps) {
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)]!, []);
  const [showDev, setShowDev] = useState(false);
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

      {/* DevPanel overlay */}
      {showDev && (
        <DevPanel
          onClose={() => setShowDev(false)}
          onLaunch={(cfg) => { setShowDev(false); onDevLaunch(cfg); }}
        />
      )}

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
              [x] CASSEZ TOUTES LES CIBLES ORANGES
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

            {isAdmin && (
              <button
                onClick={() => setShowDev(true)}
                className="pg-btn"
                style={{
                  width: "100%",
                  padding: "7px 0",
                  fontSize: 7,
                  textAlign: "center",
                  letterSpacing: "0.04em",
                  borderTopColor: "#cc44ff",
                  borderLeftColor: "#cc44ff",
                  color: "#cc44ff",
                }}
              >
                ⚙  DEV TOOLS
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="pg-sep" style={{ marginBottom: 14 }} />

          {/* Tip absurde */}
          <div
            style={{
              fontSize: 7,
              color: PG.textMuted,
              fontFamily: "var(--pg-font)",
              marginBottom: 12,
              lineHeight: 1.5,
              padding: "6px 8px",
              borderWidth: 1,
              borderStyle: "solid",
              borderTopColor: PG.sh,
              borderLeftColor: PG.sh,
              borderBottomColor: PG.hi,
              borderRightColor: PG.hi,
              background: "rgba(0,0,0,0.3)",
            }}
          >
            {tip}
          </div>

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
