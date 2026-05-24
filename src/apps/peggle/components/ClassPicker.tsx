"use client";

import type { ClassId } from "../engine/roguelite";
import { CLASSES, CLASS_COLORS, RELICS } from "../engine/roguelite";
import { captionBtn } from "../styles";

interface ClassPickerProps {
  onPick: (classId: ClassId) => void;
}

export function ClassPicker({ onPick }: ClassPickerProps) {
  const classes = Object.values(CLASSES);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#008080",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "var(--t-font-display)",
      }}
    >
      {/* Win98 dialog */}
      <div
        style={{
          background: "var(--t-bg)",
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
          boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
          width: 480,
          flexShrink: 0,
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            padding: "4px 6px 4px 8px",
            gap: 4,
          }}
        >
          <span style={{ fontSize: "var(--t-text-xs)", color: "#fff", flex: 1 }}>
            🎮 Peggle 98 — Choisissez votre classe
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={captionBtn}>{ch}</div>
          ))}
        </div>

        <div style={{ padding: "20px 20px 16px" }}>
          <div
            style={{
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
              textAlign: "center",
              marginBottom: 16,
              letterSpacing: "0.05em",
            }}
          >
            SÉLECTIONNEZ VOTRE STYLE DE JEU
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => onPick(cls.id)}
                style={{
                  flex: 1,
                  padding: "14px 10px",
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-xs)",
                  cursor: "pointer",
                  background: "var(--t-app-bg)",
                  color: "var(--t-text)",
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderTopColor: "var(--t-border-light)",
                  borderLeftColor: "var(--t-border-light)",
                  borderBottomColor: "var(--t-border-dark)",
                  borderRightColor: "var(--t-border-dark)",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: "filter 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "")}
              >
                {/* Class emoji + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{cls.emoji}</span>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--t-text-sm)",
                        fontWeight: "bold",
                        color: CLASS_COLORS[cls.id] ?? "var(--t-text)",
                        lineHeight: 1.2,
                      }}
                    >
                      {cls.name}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div
                  style={{
                    fontSize: "var(--t-text-xs)",
                    color: "var(--t-text)",
                    lineHeight: 1.4,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderTopColor: "var(--t-border-dark)",
                    borderLeftColor: "var(--t-border-dark)",
                    borderBottomColor: "var(--t-border-light)",
                    borderRightColor: "var(--t-border-light)",
                    background: "var(--t-bg)",
                    padding: "6px 8px",
                  }}
                >
                  {cls.desc}
                </div>

                {/* Starting relics */}
                {cls.id === "alchimiste" ? (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--t-text-muted)", marginBottom: 3 }}>
                      RELIQUES DE DÉPART
                    </div>
                    <div style={{ fontSize: 9, color: "#cc44ff", fontStyle: "italic" }}>
                      2 reliques aléatoires
                    </div>
                  </div>
                ) : cls.startRelics.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--t-text-muted)", marginBottom: 3, letterSpacing: "0.05em" }}>
                      RELIQUE DE DÉPART
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {cls.startRelics.map(rid => {
                        const r = RELICS[rid]!;
                        return (
                          <span
                            key={rid}
                            title={`${r.name}: ${r.desc}`}
                            style={{
                              fontSize: 9,
                              padding: "2px 6px",
                              background: r.color + "33",
                              color: r.color,
                              borderWidth: 1,
                              borderStyle: "solid",
                              borderColor: r.color + "88",
                            }}
                          >
                            {r.emoji} {r.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Flavor */}
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--t-text-muted)",
                    fontStyle: "italic",
                    marginTop: 2,
                    lineHeight: 1.3,
                  }}
                >
                  &ldquo;{cls.flavorText}&rdquo;
                </div>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div
            style={{
              height: 0,
              borderTop: "1px solid var(--t-border-dark)",
              borderBottom: "1px solid var(--t-border-light)",
              marginBottom: 12,
            }}
          />

          <div
            style={{
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
              textAlign: "center",
            }}
          >
            Cliquez sur une classe pour démarrer le run
          </div>
        </div>
      </div>
    </div>
  );
}
