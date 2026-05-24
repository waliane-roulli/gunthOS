"use client";

import "../peggle.css";
import type { UpgradeId, RelicId } from "../engine/roguelite";
import { UPGRADES, RELICS } from "../engine/roguelite";
import { captionBtn, PG } from "../styles";
import { PegIcon } from "./PegIcon";

interface UpgradePickerProps {
  offers: UpgradeId[];
  relics: RelicId[];
  level: number;
  score: number;
  bossKilled: boolean;
  onPick: (id: UpgradeId) => void;
  onSkip: () => void;
}

const rarityConfig: Record<string, { border: string; glow: string; bg: string; label: string; badge: string }> = {
  common: { border: PG.hi,      glow: "rgba(74,74,122,0.3)",    bg: PG.surface2,   label: "COMMUN",  badge: "#6666aa" },
  rare:   { border: "#4488ff",  glow: "rgba(68,136,255,0.35)",  bg: "#080e20",     label: "RARE",    badge: "#4488ff" },
  epic:   { border: PG.purple,  glow: "rgba(204,68,255,0.4)",   bg: "#0e0618",     label: "ÉPIQUE",  badge: PG.purple },
};

export function UpgradePicker({
  offers, relics, level, score, bossKilled, onPick, onSkip,
}: UpgradePickerProps) {
  return (
    <div
      className="peggle-root"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.82)",
        zIndex: 10,
      }}
    >
      {/* Lueur ambiante derrière le dialog */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 300,
          background: `radial-gradient(ellipse, ${PG.cyan}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Dialog */}
      <div
        className="pg-dialog"
        style={{
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          animation: "pg-slide-up 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Titlebar */}
        <div className="pg-titlebar">
          <span style={{ fontSize: 8, color: "#aaaaee", flex: 1, fontFamily: "var(--pg-font)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 5 }}>
            <PegIcon id="victory" size={10} /> NIVEAU {level} TERMINÉ — CHOISISSEZ UNE AMÉLIORATION
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={captionBtn}>{ch}</div>
          ))}
        </div>

        <div style={{ padding: "16px 14px 14px" }}>
          {/* Score + boss banner */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <div
              className="pg-sunken"
              style={{
                flex: 1,
                padding: "5px 10px",
                fontSize: 8,
                color: PG.textMuted,
                fontFamily: "var(--pg-font)",
              }}
            >
              SCORE :{" "}
              <strong style={{ color: PG.cyan }}>{score.toLocaleString()}</strong>
            </div>
            {bossKilled && (
              <div
                style={{
                  padding: "5px 12px",
                  background: "#1a0e00",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: PG.gold,
                  fontSize: 8,
                  color: PG.gold,
                  fontWeight: "bold",
                  letterSpacing: "0.05em",
                  fontFamily: "var(--pg-font)",
                  textShadow: `0 0 8px ${PG.gold}88`,
                  boxShadow: `0 0 12px ${PG.gold}33`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <PegIcon id="boss" size={10} /> BOSS VAINCU
              </div>
            )}
          </div>

          {/* Upgrade cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {offers.map((id, i) => {
              const u = UPGRADES[id];
              if (!u) return null;
              const rc = rarityConfig[u.rarity] ?? rarityConfig.common!;
              return (
                <button
                  key={id}
                  onClick={() => onPick(id)}
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    fontFamily: "var(--pg-font)",
                    fontSize: 7,
                    cursor: "pointer",
                    background: rc.bg,
                    color: PG.text,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: rc.border,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    position: "relative",
                    animation: `pg-card-in 0.3s ease-out ${i * 0.08}s both`,
                    transition: "box-shadow 0.15s, filter 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 0 20px ${rc.glow}, inset 0 0 8px rgba(255,255,255,0.03)`;
                    e.currentTarget.style.filter = "brightness(1.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.filter = "";
                  }}
                >
                  {/* Rarity badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 7,
                      fontSize: 6,
                      color: rc.badge,
                      letterSpacing: "0.1em",
                      fontWeight: "bold",
                      textShadow: `0 0 6px ${rc.badge}88`,
                    }}
                  >
                    {rc.label}
                  </div>

                  {/* Icon + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PegIcon id={id} size={22} />
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        color: rc.border,
                        lineHeight: 1.3,
                        paddingRight: 40,
                        textShadow: `0 0 8px ${rc.border}66`,
                      }}
                    >
                      {u.name.toUpperCase()}
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      fontSize: 7,
                      color: "#aaaacc",
                      lineHeight: 1.6,
                      padding: "5px 8px",
                      background: "rgba(0,0,0,0.5)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderTopColor: PG.sh,
                      borderLeftColor: PG.sh,
                      borderBottomColor: PG.hi,
                      borderRightColor: PG.hi,
                    }}
                  >
                    {u.desc}
                  </div>

                  {/* Category chip */}
                  <div
                    style={{
                      fontSize: 6,
                      color: PG.textMuted,
                      letterSpacing: "0.08em",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <PegIcon id={u.category === "ball" ? "ball_cat" : u.category === "score" ? "score_cat" : "utility_cat"} size={8} />
                    {u.category === "ball" ? "BALLE" : u.category === "score" ? "SCORE" : "UTILITAIRE"}
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
                  fontSize: 6,
                  color: PG.textMuted,
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                  fontFamily: "var(--pg-font)",
                }}
              >
                RELIQUES ACTIVES
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {relics.map(rid => {
                  const r = RELICS[rid];
                  if (!r) return null;
                  return (
                    <span
                      key={rid}
                      title={`${r.name}: ${r.desc}`}
                      style={{
                        fontSize: 7,
                        padding: "3px 8px",
                        background: r.color + "18",
                        color: r.color,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: r.color + "55",
                        cursor: "help",
                        fontFamily: "var(--pg-font)",
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
            </div>
          )}

          {/* Separator */}
          <div className="pg-sep" style={{ marginBottom: 10 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 7, color: PG.textMuted, fontFamily: "var(--pg-font)" }}>
              CLIQUEZ SUR UNE CARTE POUR L&apos;ACTIVER
            </div>
            <button
              onClick={onSkip}
              style={{
                padding: "5px 12px",
                fontFamily: "var(--pg-font)",
                fontSize: 7,
                cursor: "pointer",
                background: PG.surface2,
                color: PG.textMuted,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: PG.hi,
                borderLeftColor: PG.hi,
                borderBottomColor: PG.sh,
                borderRightColor: PG.sh,
                letterSpacing: "0.04em",
                transition: "color 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = PG.orange}
              onMouseLeave={e => e.currentTarget.style.color = PG.textMuted}
            >
              PASSER →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
