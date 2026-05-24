"use client";

import "../peagle.css";
import type { ClassId } from "../engine/roguelite";
import { CLASSES, CLASS_COLORS, RELICS } from "../engine/roguelite";
import { captionBtn } from "../styles";
import { PegIcon } from "./PegIcon";
import { ForestBackground } from "./ForestBackground";

// Nature sauvage palette — remplace le cyberpunk pour le choix de classe
const NW = {
  bg:        "#060e04",
  surface:   "#0c1a08",
  surface2:  "#122010",
  border:    "#1e3a18",
  hi:        "#3a6030",
  sh:        "#020501",
  gold:      "#88cc44",
  goldLight: "#aaee66",
  amber:     "#e07820",
  forest:    "#1a3a14",
  forestBr:  "#44aa44",
  storm:     "#0e1a2a",
  stormBr:   "#4488cc",
  dusk:      "#2a1040",
  duskBr:    "#9955cc",
  text:      "#c8e8b0",
  textMuted: "#4a7040",
  titleFrom: "#0a1a06",
  titleTo:   "#060e04",
} as const;

interface ClassPickerProps {
  onPick: (classId: ClassId) => void;
}

const CLASS_BG: Record<ClassId, string> = {
  canonnier:  "linear-gradient(160deg, #080e18 0%, #0e1828 60%, #060c12 100%)",
  alchimiste: "linear-gradient(160deg, #0e0818 0%, #1a1030 60%, #0a0614 100%)",
  sniper:     "linear-gradient(160deg, #061006 0%, #0e2010 60%, #040c04 100%)",
};

const CLASS_GLOW: Record<ClassId, string> = {
  canonnier:  "rgba(68,136,204,0.3)",
  alchimiste: "rgba(153,85,204,0.3)",
  sniper:     "rgba(68,170,68,0.3)",
};

const CLASS_STATS: Record<ClassId, { label: string; value: number; max: number }[]> = {
  canonnier:  [
    { label: "ŒUFS",      value: 12, max: 12 },
    { label: "PRÉCISION", value: 5,  max: 10 },
    { label: "BOMBES",    value: 0,  max: 10 },
  ],
  alchimiste: [
    { label: "ŒUFS",      value: 9,  max: 12 },
    { label: "PRÉCISION", value: 5,  max: 10 },
    { label: "MAGIE",     value: 10, max: 10 },
  ],
  sniper:     [
    { label: "ŒUFS",      value: 10, max: 12 },
    { label: "PRÉCISION", value: 10, max: 10 },
    { label: "TAILLE",    value: 3,  max: 10 },
  ],
};

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: NW.textMuted, fontFamily: "var(--pg-font)" }}>
        <span>{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div
        style={{
          height: 6,
          background: NW.bg,
          borderWidth: 1,
          borderStyle: "solid",
          borderTopColor: NW.sh,
          borderLeftColor: NW.sh,
          borderBottomColor: NW.hi,
          borderRightColor: NW.hi,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(to right, ${color}88, ${color})`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export function ClassPicker({ onPick }: ClassPickerProps) {
  const classes = Object.values(CLASSES);

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

      {/* Dialog */}
      <div
        style={{
          width: 540,
          flexShrink: 0,
          zIndex: 2,
          background: NW.surface,
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: NW.hi,
          borderLeftColor: NW.hi,
          borderBottomColor: NW.sh,
          borderRightColor: NW.sh,
          boxShadow: `6px 6px 0 rgba(0,0,0,0.8), 0 0 60px rgba(200,134,10,0.1)`,
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
            fontSize: 8,
            color: NW.goldLight,
            flex: 1,
            fontFamily: "var(--pg-font)",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 5,
            textShadow: `0 0 8px ${NW.gold}88`,
          }}>
            <PegIcon id="eagle" size={10} />
            ✦ PEAGLE 98 — CHOISISSEZ VOTRE OISEAU ✦
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

        <div style={{ padding: "18px 16px 14px" }}>
          {/* Rappel des règles */}
          <div
            style={{
              fontSize: 7,
              color: NW.textMuted,
              textAlign: "center",
              marginBottom: 10,
              lineHeight: 1.6,
              fontFamily: "var(--pg-font)",
              padding: "6px 10px",
              borderWidth: 1,
              borderStyle: "solid",
              borderTopColor: NW.sh,
              borderLeftColor: NW.sh,
              borderBottomColor: NW.hi,
              borderRightColor: NW.hi,
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <span style={{ color: NW.gold }}>Comment jouer :</span>{" "}
            Visez et lancez l'œuf avec la souris.
            Cassez toutes les <span style={{ color: NW.amber }}>cibles oranges</span> avant de manquer d'œufs.
            Les <span style={{ color: NW.forestBr }}>cibles vertes</span> donnent des pouvoirs bonus.
            Le panier en bas récupère un œuf si vous l&apos;attrapez.
          </div>

          {/* Sous-titre clignotant */}
          <div
            style={{
              fontSize: 7,
              color: NW.goldLight,
              textAlign: "center",
              marginBottom: 14,
              letterSpacing: "0.15em",
              fontFamily: "var(--pg-font)",
              animation: "pg-blink 2.5s step-end infinite",
              textShadow: `0 0 10px ${NW.gold}88`,
            }}
          >
            ✦ L&apos;AIGLE ATTEND VOTRE DÉCISION ✦
          </div>

          {/* Cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {classes.map((cls, i) => {
              const color = CLASS_COLORS[cls.id] ?? NW.gold;
              const stats = CLASS_STATS[cls.id] ?? [];
              return (
                <button
                  key={cls.id}
                  onClick={() => onPick(cls.id)}
                  style={{
                    flex: 1,
                    padding: "14px 12px",
                    fontFamily: "var(--pg-font)",
                    fontSize: 7,
                    cursor: "pointer",
                    background: CLASS_BG[cls.id],
                    color: NW.text,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderTopColor: NW.hi,
                    borderLeftColor: NW.hi,
                    borderBottomColor: NW.sh,
                    borderRightColor: NW.sh,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    animation: `pg-card-in 0.3s ease-out ${i * 0.07}s both`,
                    transition: "box-shadow 0.15s, filter 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 0 24px ${CLASS_GLOW[cls.id] ?? "rgba(200,134,10,0.25)"}, inset 0 0 12px rgba(255,255,255,0.03)`;
                    e.currentTarget.style.filter = "brightness(1.12)";
                    e.currentTarget.style.borderTopColor = NW.goldLight;
                    e.currentTarget.style.borderLeftColor = NW.goldLight;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.filter = "";
                    e.currentTarget.style.borderTopColor = NW.hi;
                    e.currentTarget.style.borderLeftColor = NW.hi;
                  }}
                >
                  {/* Icon + nom */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        padding: 6,
                        background: "rgba(0,0,0,0.35)",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderTopColor: NW.sh,
                        borderLeftColor: NW.sh,
                        borderBottomColor: NW.hi,
                        borderRightColor: NW.hi,
                      }}
                    >
                      <PegIcon id={cls.id} size={26} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color,
                          lineHeight: 1.3,
                          textShadow: `0 0 10px ${color}88`,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {cls.name.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 6, color: NW.textMuted, marginTop: 3, letterSpacing: "0.05em" }}>
                        {cls.id === "canonnier" ? "12 ŒUFS · FACILE"
                          : cls.id === "alchimiste" ? "9 ŒUFS · CHAOS"
                          : "10 ŒUFS · PRÉCISION"}
                      </div>
                    </div>
                  </div>

                  {/* Stats bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {stats.map(s => (
                      <StatBar key={s.label} label={s.label} value={s.value} max={s.max} color={color} />
                    ))}
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      fontSize: 7,
                      color: NW.text,
                      lineHeight: 1.6,
                      padding: "6px 8px",
                      background: "rgba(0,0,0,0.45)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderTopColor: NW.sh,
                      borderLeftColor: NW.sh,
                      borderBottomColor: NW.hi,
                      borderRightColor: NW.hi,
                    }}
                  >
                    {cls.desc}
                  </div>

                  {/* Reliques de départ */}
                  {cls.id === "alchimiste" ? (
                    <div
                      style={{
                        fontSize: 7,
                        color: NW.duskBr,
                        padding: "4px 8px",
                        border: `1px solid ${NW.duskBr}44`,
                        background: `${NW.duskBr}11`,
                        letterSpacing: "0.04em",
                      }}
                    >
                      ✦ 2 RELIQUES ALÉATOIRES
                    </div>
                  ) : cls.startRelics.length > 0 ? (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {cls.startRelics.map(rid => {
                        const r = RELICS[rid]!;
                        return (
                          <span
                            key={rid}
                            title={`${r.name}: ${r.desc}`}
                            style={{
                              fontSize: 7,
                              padding: "3px 7px",
                              background: r.color + "22",
                              color: r.color,
                              borderWidth: 1,
                              borderStyle: "solid",
                              borderColor: r.color + "66",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <PegIcon id={rid} size={10} /> {r.name.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 7, color: NW.textMuted }}>AUCUNE RELIQUE</div>
                  )}

                  {/* Flavor */}
                  <div
                    style={{
                      fontSize: 6,
                      color: `${color}99`,
                      fontStyle: "italic",
                      lineHeight: 1.4,
                      borderTop: `1px solid ${NW.border}`,
                      paddingTop: 6,
                      fontFamily: "var(--font-vt323), monospace",
                    }}
                  >
                    &ldquo;{cls.flavorText}&rdquo;
                  </div>
                </button>
              );
            })}
          </div>

          {/* Séparateur doré */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(to right, transparent, ${NW.gold}44, transparent)`,
              marginBottom: 10,
            }}
          />

          <div style={{ fontSize: 7, color: NW.textMuted, textAlign: "center", fontFamily: "var(--pg-font)" }}>
            CLIQUEZ SUR UN OISEAU POUR DÉMARRER · L&apos;AIGLE NE JUGERA PAS VOTRE CHOIX (mensonge)
          </div>
        </div>
      </div>
    </div>
  );
}
