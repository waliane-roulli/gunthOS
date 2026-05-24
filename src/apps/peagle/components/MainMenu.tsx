"use client";

import { useMemo, useState } from "react";
import "../peagle.css";
import { captionBtn } from "../styles";
import { PegIcon } from "./PegIcon";
import { ForestBackground } from "./ForestBackground";
import { AnnouncementsOverlay, useAnnouncements } from "./AnnouncementPopup";

const NW = {
  bg:        "#060e04",
  surface:   "#0c1a08",
  surface2:  "#122010",
  border:    "#1e3a18",
  hi:        "#3a6030",
  sh:        "#020501",
  gold:      "#88cc44",     // vert-lime luciole
  goldLight: "#aaee66",
  amber:     "#66bb33",
  text:      "#c8e8b0",
  textMuted: "#4a7040",
  cyan:      "#44ccaa",
  titleFrom: "#0a1a06",
  titleTo:   "#060e04",
} as const;
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
  const { announcements, popupAnnouncement, showChangelog, dismiss, openChangelog, setShowChangelog } = useAnnouncements();
  return (
    <div
      className="peagle-root"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#060e04",
        overflow: "hidden",
        userSelect: "none",
        position: "relative",
      }}
    >
      <ForestBackground />

      {/* DevPanel overlay */}
      {showDev && (
        <DevPanel
          onClose={() => setShowDev(false)}
          onLaunch={(cfg) => { setShowDev(false); onDevLaunch(cfg); }}
        />
      )}

      {/* Announcements overlay (popup + changelog) */}
      {!showDev && (
        <AnnouncementsOverlay
          announcements={announcements}
          popupAnnouncement={popupAnnouncement}
          showChangelog={showChangelog}
          onDismiss={dismiss}
          onMoreInfo={openChangelog}
          onCloseChangelog={() => setShowChangelog(false)}
        />
      )}

      {/* Dialog centré */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          zIndex: 2,
          background: NW.surface,
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: NW.hi,
          borderLeftColor: NW.hi,
          borderBottomColor: NW.sh,
          borderRightColor: NW.sh,
          boxShadow: `6px 6px 0 rgba(0,0,0,0.8), 0 0 50px rgba(200,134,10,0.1)`,
        }}
      >
        {/* Titlebar — plumes d'or */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(to right, ${NW.titleFrom}, ${NW.titleTo})`,
            padding: "5px 6px 5px 8px",
            gap: 4,
            borderBottom: `1px solid ${NW.gold}55`,
          }}
        >
          <span style={{
            fontSize: 9,
            color: NW.goldLight,
            flex: 1,
            fontFamily: "var(--pg-font)",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 5,
            textShadow: `0 0 8px ${NW.gold}88`,
          }}>
            <PegIcon id="eagle" size={10} /> PEAGLE 98
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div
              key={ch}
              style={{
                ...captionBtn,
                background: NW.surface2,
                borderTopColor: NW.hi,
                borderLeftColor: NW.hi,
                borderBottomColor: NW.sh,
                borderRightColor: NW.sh,
                color: NW.textMuted,
              }}
            >
              {ch}
            </div>
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
                background: NW.bg,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: NW.sh,
                borderLeftColor: NW.sh,
                borderBottomColor: NW.hi,
                borderRightColor: NW.hi,
                boxShadow: `inset 0 0 20px rgba(200,134,10,0.06)`,
              }}
            >
              <PeagleLogo />
            </div>

            <div
              style={{
                fontSize: 8,
                color: NW.gold,
                letterSpacing: "0.12em",
                fontFamily: "var(--pg-font)",
                animation: "pg-blink 2s step-end infinite",
                textShadow: `0 0 8px ${NW.gold}66`,
              }}
            >
              ✦ CASSEZ TOUTES LES CIBLES ORANGES ✦
            </div>
          </div>

          {/* Séparateur doré */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(to right, transparent, ${NW.gold}44, transparent)`,
              marginBottom: 20,
            }}
          />

          {/* Boutons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              onClick={onPlay}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 0",
                fontFamily: "var(--pg-font)",
                fontSize: 9,
                textAlign: "center",
                letterSpacing: "0.06em",
                cursor: "pointer",
                background: `linear-gradient(to bottom, ${NW.amber}, #9a4a00)`,
                color: NW.text,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: NW.goldLight,
                borderLeftColor: NW.goldLight,
                borderBottomColor: NW.sh,
                borderRightColor: NW.sh,
                textShadow: "0 1px 0 rgba(0,0,0,0.6)",
              }}
            >
              ▶  NOUVELLE PARTIE
            </button>

            <button
              onClick={onLeaderboard}
              style={{
                width: "100%",
                padding: "9px 0",
                fontFamily: "var(--pg-font)",
                fontSize: 8,
                textAlign: "center",
                letterSpacing: "0.04em",
                cursor: "pointer",
                background: NW.surface2,
                color: NW.text,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: NW.hi,
                borderLeftColor: NW.hi,
                borderBottomColor: NW.sh,
                borderRightColor: NW.sh,
              }}
            >
              ★  CLASSEMENT
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowDev(true)}
                style={{
                  width: "100%",
                  padding: "7px 0",
                  fontFamily: "var(--pg-font)",
                  fontSize: 7,
                  textAlign: "center",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  background: NW.surface2,
                  color: "#9955cc",
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderTopColor: "#9955cc",
                  borderLeftColor: "#9955cc",
                  borderBottomColor: NW.sh,
                  borderRightColor: NW.sh,
                }}
              >
                ⚙  DEV TOOLS
              </button>
            )}
          </div>

          {/* Séparateur doré */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(to right, transparent, ${NW.gold}44, transparent)`,
              marginBottom: 14,
            }}
          />

          {/* Tip absurde */}
          <div
            style={{
              fontSize: 7,
              color: NW.textMuted,
              fontFamily: "var(--pg-font)",
              marginBottom: 12,
              lineHeight: 1.5,
              padding: "6px 8px",
              borderWidth: 1,
              borderStyle: "solid",
              borderTopColor: NW.sh,
              borderLeftColor: NW.sh,
              borderBottomColor: NW.hi,
              borderRightColor: NW.hi,
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
              color: NW.textMuted,
              fontFamily: "var(--pg-font)",
            }}
          >
            <span>
              {bestScore > 0 ? (
                <>
                  ⭐{" "}
                  <span style={{ color: NW.gold }}>{bestScore.toLocaleString()}</span>
                </>
              ) : (
                "-- PAS DE SCORE --"
              )}
            </span>
            <span style={{ color: displayName ? NW.cyan : NW.textMuted }}>
              {displayName ? `▶ ${displayName}` : "NON CONNECTÉ"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
