"use client";

import "../peagle.css";
import type { ClassId } from "../engine/roguelite";
import { CLASSES, CLASS_COLORS, RELICS } from "../engine/roguelite";
import { captionBtn, PG } from "../styles";
import { PegIcon } from "./PegIcon";

interface ClassPickerProps {
  onPick: (classId: ClassId) => void;
}

const CLASS_BG: Record<ClassId, string> = {
  canonnier:  "linear-gradient(160deg, #0a1a3a 0%, #122244 100%)",
  alchimiste: "linear-gradient(160deg, #1a0a2a 0%, #2a1040 100%)",
  sniper:     "linear-gradient(160deg, #0a2a1a 0%, #103322 100%)",
};

const CLASS_GLOW: Record<ClassId, string> = {
  canonnier:  "rgba(68,136,255,0.25)",
  alchimiste: "rgba(204,68,255,0.25)",
  sniper:     "rgba(68,255,170,0.25)",
};

const CLASS_STATS: Record<ClassId, { label: string; value: number; max: number }[]> = {
  canonnier:  [
    { label: "BALLES",   value: 12, max: 12 },
    { label: "VISÉE",    value: 5,  max: 10 },
    { label: "BOMBE",    value: 0,  max: 10 },
  ],
  alchimiste: [
    { label: "BALLES",   value: 9,  max: 12 },
    { label: "VISÉE",    value: 5,  max: 10 },
    { label: "RELIQUES", value: 10, max: 10 },
  ],
  sniper:     [
    { label: "BALLES",   value: 10, max: 12 },
    { label: "VISÉE",    value: 10, max: 10 },
    { label: "TAILLE",   value: 3,  max: 10 },
  ],
};

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: PG.textMuted, fontFamily: "var(--pg-font)" }}>
        <span>{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div
        style={{
          height: 6,
          background: PG.bg,
          borderWidth: 1,
          borderStyle: "solid",
          borderTopColor: PG.sh,
          borderLeftColor: PG.sh,
          borderBottomColor: PG.hi,
          borderRightColor: PG.hi,
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
        background: PG.bg,
        overflow: "hidden",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Starfield */}
      <div className="pg-starfield" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Dialog */}
      <div className="pg-dialog" style={{ width: 520, flexShrink: 0, zIndex: 2 }}>
        {/* Titlebar */}
        <div className="pg-titlebar">
          <span style={{ fontSize: 8, color: "#aaaaee", flex: 1, fontFamily: "var(--pg-font)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 5 }}>
            <PegIcon id="gamepad" size={10} /> PEAGLE 98 — CHOISISSEZ VOTRE CLASSE
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={captionBtn}>{ch}</div>
          ))}
        </div>

        <div style={{ padding: "20px 18px 16px" }}>
          {/* Sous-titre clignotant */}
          <div
            style={{
              fontSize: 7,
              color: PG.cyan,
              textAlign: "center",
              marginBottom: 18,
              letterSpacing: "0.15em",
              fontFamily: "var(--pg-font)",
              animation: "pg-blink 2.5s step-end infinite",
            }}
          >
            ▼ SÉLECTIONNEZ VOTRE STYLE DE JEU ▼
          </div>

          {/* Cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {classes.map((cls, i) => {
              const color = CLASS_COLORS[cls.id] ?? PG.cyan;
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
                    color: PG.text,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderTopColor: PG.hi,
                    borderLeftColor: PG.hi,
                    borderBottomColor: PG.sh,
                    borderRightColor: PG.sh,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    animation: `pg-card-in 0.3s ease-out ${i * 0.07}s both`,
                    transition: "box-shadow 0.15s, filter 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 0 20px ${CLASS_GLOW[cls.id] ?? "rgba(0,229,255,0.2)"}, inset 0 0 10px rgba(255,255,255,0.04)`;
                    e.currentTarget.style.filter = "brightness(1.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.filter = "";
                  }}
                >
                  {/* Icon + nom */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PegIcon id={cls.id} size={26} />
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color,
                          lineHeight: 1.3,
                          textShadow: `0 0 8px ${color}88`,
                        }}
                      >
                        {cls.name.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 6, color: PG.textMuted, marginTop: 3, letterSpacing: "0.05em" }}>
                        {cls.id === "canonnier" ? "12 BALLES DE DÉPART"
                          : cls.id === "alchimiste" ? "9 BALLES DE DÉPART"
                          : "10 BALLES DE DÉPART"}
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
                      color: "#aaaacc",
                      lineHeight: 1.6,
                      padding: "6px 8px",
                      background: "rgba(0,0,0,0.4)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderTopColor: PG.sh,
                      borderLeftColor: PG.sh,
                      borderBottomColor: PG.hi,
                      borderRightColor: PG.hi,
                    }}
                  >
                    {cls.desc}
                  </div>

                  {/* Reliques de départ */}
                  {cls.id === "alchimiste" ? (
                    <div
                      style={{
                        fontSize: 7,
                        color: PG.purple,
                        padding: "4px 8px",
                        border: `1px solid ${PG.purple}44`,
                        background: `${PG.purple}11`,
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
                    <div style={{ fontSize: 7, color: PG.textMuted }}>AUCUNE RELIQUE</div>
                  )}

                  {/* Flavor */}
                  <div
                    style={{
                      fontSize: 6,
                      color: `${color}99`,
                      fontStyle: "italic",
                      lineHeight: 1.4,
                      borderTop: `1px solid ${PG.border}`,
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

          {/* Separator */}
          <div className="pg-sep" style={{ marginBottom: 12 }} />

          <div style={{ fontSize: 7, color: PG.textMuted, textAlign: "center", fontFamily: "var(--pg-font)" }}>
            CLIQUEZ SUR UNE CLASSE POUR DÉMARRER LE RUN
          </div>
        </div>
      </div>
    </div>
  );
}
