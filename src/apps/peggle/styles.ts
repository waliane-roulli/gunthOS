import type { CSSProperties } from "react";

// ─── Peggle 98 design tokens ──────────────────────────────────────────────────
// Couleurs référencées ici pour le code inline qui ne peut pas utiliser CSS classes.
// Pour tout le reste, utiliser les classes dans peggle.css.

export const PG = {
  bg:        "#0d0d1a",
  surface:   "#12122a",
  surface2:  "#1a1a3a",
  border:    "#2a2a5a",
  hi:        "#4a4a7a",
  sh:        "#06060f",
  orange:    "#ff6b35",
  orangeGlow:"#ff9f68",
  cyan:      "#00e5ff",
  cyanDim:   "#0099aa",
  gold:      "#ffd700",
  red:       "#ff2244",
  green:     "#39ff14",
  purple:    "#cc44ff",
  barFrom:   "#000080",
  barTo:     "#1a0050",
  text:      "#e0e0ff",
  textMuted: "#6666aa",
} as const;

export const captionBtn: CSSProperties = {
  width: 16,
  height: 14,
  background: PG.surface2,
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: PG.hi,
  borderLeftColor: PG.hi,
  borderBottomColor: PG.sh,
  borderRightColor: PG.sh,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 7,
  color: "#aaaacc",
  userSelect: "none",
  cursor: "default",
  lineHeight: 1,
  flexShrink: 0,
};

export const btnRaised: CSSProperties = {
  padding: "7px 14px",
  fontFamily: "var(--font-press-start), monospace",
  fontSize: 8,
  cursor: "pointer",
  background: PG.surface2,
  color: PG.text,
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: PG.hi,
  borderLeftColor: PG.hi,
  borderBottomColor: PG.sh,
  borderRightColor: PG.sh,
  whiteSpace: "nowrap",
  lineHeight: 1.4,
  letterSpacing: "0.04em",
};

export const btnPrimary: CSSProperties = {
  ...btnRaised,
  background: `linear-gradient(to bottom, ${PG.orange}, #cc4400)`,
  color: "#fff",
  borderTopColor: PG.orangeGlow,
  borderLeftColor: PG.orangeGlow,
  borderBottomColor: "#882200",
  borderRightColor: "#882200",
  textShadow: "0 1px 0 rgba(0,0,0,0.6)",
};

export const titlebar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: `linear-gradient(to right, ${PG.barFrom}, ${PG.barTo})`,
  padding: "5px 6px 5px 8px",
  gap: 4,
  borderBottom: `1px solid ${PG.cyanDim}`,
};

export const dialogBox: CSSProperties = {
  background: PG.surface,
  borderWidth: 3,
  borderStyle: "solid",
  borderTopColor: PG.hi,
  borderLeftColor: PG.hi,
  borderBottomColor: PG.sh,
  borderRightColor: PG.sh,
  boxShadow: `6px 6px 0 rgba(0,0,0,0.8), 0 0 40px rgba(0,229,255,0.08)`,
};

export const sunken: CSSProperties = {
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: PG.sh,
  borderLeftColor: PG.sh,
  borderBottomColor: PG.hi,
  borderRightColor: PG.hi,
  background: PG.bg,
};
