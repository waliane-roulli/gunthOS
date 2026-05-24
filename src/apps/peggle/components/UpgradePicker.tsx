"use client";

import type { UpgradeId, RelicId } from "../engine/roguelite";
import { UPGRADES, RELICS } from "../engine/roguelite";
import { captionBtn } from "../styles";

interface UpgradePickerProps {
  offers: UpgradeId[];
  relics: RelicId[];
  level: number;
  score: number;
  bossKilled: boolean;
  onPick: (id: UpgradeId) => void;
  onSkip: () => void;
}

const rarityStyle: Record<string, { border: string; badge: string; bg: string }> = {
  common: { border: "#808080", badge: "#808080", bg: "var(--t-app-bg)" },
  rare:   { border: "#4488ff", badge: "#4488ff", bg: "#0a1a33" },
  epic:   { border: "#cc44ff", badge: "#cc44ff", bg: "#1a0a33" },
};
const rarityLabel: Record<string, string> = {
  common: "COMMUN",
  rare: "RARE",
  epic: "ÉPIQUE",
};

export function UpgradePicker({
  offers, relics, level, score, bossKilled, onPick, onSkip,
}: UpgradePickerProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        zIndex: 10,
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
          width: 460,
          maxWidth: "calc(100vw - 32px)",
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
            🎉 Niveau {level} terminé ! — Choisissez une amélioration
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={captionBtn}>{ch}</div>
          ))}
        </div>

        <div style={{ padding: "16px 16px 14px" }}>
          {/* Score + boss banner */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                padding: "4px 10px",
                borderWidth: 1,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
                background: "var(--t-app-bg)",
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-muted)",
              }}
            >
              Score : <strong style={{ color: "var(--t-text)" }}>{score.toLocaleString()}</strong>
            </div>
            {bossKilled && (
              <div
                style={{
                  padding: "4px 10px",
                  background: "#1a1000",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "#ffd700",
                  fontSize: "var(--t-text-xs)",
                  color: "#ffd700",
                  fontWeight: "bold",
                  letterSpacing: "0.05em",
                }}
              >
                👑 BOSS VAINCU
              </div>
            )}
          </div>

          {/* Upgrade cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {offers.map((id) => {
              const u = UPGRADES[id];
              if (!u) return null;
              const rs = rarityStyle[u.rarity] ?? rarityStyle.common!;
              return (
                <button
                  key={id}
                  onClick={() => onPick(id)}
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    fontFamily: "var(--t-font-display)",
                    fontSize: "var(--t-text-xs)",
                    cursor: "pointer",
                    background: rs.bg,
                    color: "var(--t-text)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: rs.border,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    position: "relative",
                    transition: "filter 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.15)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "")}
                >
                  {/* Rarity badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 6,
                      fontSize: 8,
                      color: rs.badge,
                      letterSpacing: "0.06em",
                      fontWeight: "bold",
                    }}
                  >
                    {rarityLabel[u.rarity]}
                  </div>

                  {/* Emoji + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{u.emoji}</span>
                    <div
                      style={{
                        fontSize: "var(--t-text-sm)",
                        fontWeight: "bold",
                        color: rs.border,
                        lineHeight: 1.2,
                        paddingRight: 40,
                      }}
                    >
                      {u.name}
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
                      padding: "5px 7px",
                    }}
                  >
                    {u.desc}
                  </div>

                  {/* Category chip */}
                  <div
                    style={{
                      fontSize: 9,
                      color: "var(--t-text-muted)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {u.category === "ball" ? "⚽ BALLE" : u.category === "score" ? "📊 SCORE" : "🔧 UTILITAIRE"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active relics */}
          {relics.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--t-text-muted)",
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                RELIQUES ACTIVES
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {relics.map(rid => {
                  const r = RELICS[rid];
                  if (!r) return null;
                  return (
                    <span
                      key={rid}
                      title={`${r.name}: ${r.desc}`}
                      style={{
                        fontSize: 9,
                        padding: "2px 7px",
                        background: r.color + "22",
                        color: r.color,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: r.color + "66",
                        cursor: "help",
                      }}
                    >
                      {r.emoji} {r.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Separator */}
          <div
            style={{
              height: 0,
              borderTop: "1px solid var(--t-border-dark)",
              borderBottom: "1px solid var(--t-border-light)",
              marginBottom: 10,
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
              Cliquez sur une carte pour l&apos;activer
            </div>
            <button
              onClick={onSkip}
              style={{
                padding: "4px 12px",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-xs)",
                cursor: "pointer",
                background: "var(--t-bg)",
                color: "var(--t-text-muted)",
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-light)",
                borderLeftColor: "var(--t-border-light)",
                borderBottomColor: "var(--t-border-dark)",
                borderRightColor: "var(--t-border-dark)",
              }}
            >
              Passer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
