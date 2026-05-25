"use client";

import { useState } from "react";
import { PegIcon } from "./PegIcon";
import { CLASSES, CLASS_COLORS } from "../engine/roguelite";

interface PegDef {
  id: string; name: string; description: string;
  color: string; hi: string; dark: string; glow?: string; symbol?: string;
}

const PEG_DEFS: PegDef[] = [
  { id: "normal", name: "Peg Normal",  description: "Le peg de base. À détruire.",              color: "#2233aa", hi: "#4455ff", dark: "#000d44" },
  { id: "orange", name: "Peg Orange",  description: "Objectif principal de chaque niveau.",     color: "#ff5500", hi: "#ffdd44", dark: "#882200", glow: "rgba(255,100,0,0.5)" },
  { id: "green",  name: "Peg Vert",    description: "Bonus aléatoire au contact.",              color: "#009922", hi: "#aaffcc", dark: "#003311", glow: "rgba(0,255,68,0.4)", symbol: "✓" },
  { id: "boss",   name: "Boss Peg",    description: "5 HP. Pulsant. Redoutable.",               color: "#cc8800", hi: "#ffff88", dark: "#664400", glow: "rgba(255,204,0,0.6)", symbol: "♛" },
  { id: "bomb",   name: "Bombe",       description: "Explose et élimine les pegs voisins.",     color: "#ff1133", hi: "#ff8899", dark: "#880011", glow: "rgba(255,20,60,0.5)", symbol: "!" },
  { id: "armor",  name: "Blindé",      description: "Résiste à plusieurs impacts.",             color: "#888899", hi: "#dddde8", dark: "#333340" },
  { id: "warp",   name: "Warp",        description: "Téléporte la balle vers son peg jumeau.", color: "#6600cc", hi: "#ee88ff", dark: "#330066", glow: "rgba(204,0,255,0.6)" },
];

const DECOR_DEFS = [
  { id: "bumper", name: "Bumper",  description: "Renvoie la balle avec force. Idéal pour les combos.", color: "#3355dd" },
  { id: "plank",  name: "Planche", description: "Surface inclinée qui guide la trajectoire.",           color: "#aa7733" },
  { id: "arc",    name: "Arc",     description: "Courbe qui dévie doucement la balle.",                 color: "#5544cc" },
  { id: "spike",  name: "Pointe",  description: "Obstacle tranchant — la balle rebondit dessus.",       color: "#cc3355" },
];

function CssPeg({ def }: { def: PegDef }) {
  return (
    <div style={{
      width: 36, height: 36, flexShrink: 0,
      backgroundColor: def.color,
      borderTop: `2px solid ${def.hi}`, borderLeft: `2px solid ${def.hi}`,
      borderBottom: `2px solid ${def.dark}`, borderRight: `2px solid ${def.dark}`,
      boxShadow: def.glow ? `0 0 10px ${def.glow}, 0 0 4px ${def.glow}` : "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "monospace", fontSize: "0.9rem", color: "rgba(255,255,255,0.85)",
    }}>
      {def.symbol ?? ""}
    </div>
  );
}

function CssDecor({ def }: { def: typeof DECOR_DEFS[number] }) {
  if (def.id === "bumper") {
    return <div style={{ width: 40, height: 40, flexShrink: 0, backgroundColor: def.color, borderRadius: 6, border: `2px solid ${def.color}cc`, boxShadow: `0 0 10px ${def.color}88` }} />;
  }
  if (def.id === "plank") {
    return (
      <div style={{ width: 60, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 54, height: 10, backgroundColor: def.color, border: `1px solid ${def.color}cc`, transform: "rotate(-18deg)", boxShadow: "1px 2px 0 rgba(0,0,0,0.4)" }} />
      </div>
    );
  }
  if (def.id === "arc") {
    return (
      <div style={{ width: 60, height: 35, display: "flex", alignItems: "flex-end", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 52, height: 26, border: `4px solid ${def.color}`, borderBottomColor: "transparent", borderRadius: "30px 30px 0 0", boxShadow: `0 0 8px ${def.color}66` }} />
      </div>
    );
  }
  if (def.id === "spike") {
    return <div style={{ width: 0, height: 0, flexShrink: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: `30px solid ${def.color}`, filter: `drop-shadow(0 0 4px ${def.color}88)` }} />;
  }
  return null;
}

export function PeagleAssetsGrid() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedPeg,   setSelectedPeg]   = useState<string | null>(null);
  const [selectedDecor, setSelectedDecor] = useState<string | null>(null);

  const classArr = Object.values(CLASSES);

  const subHeader = (label: string, count: number) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 4,
      borderBottom: `1px solid #2a1a4a`, paddingBottom: 4,
    }}>
      <span style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 8, color: "#cc88ff", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color: "#6655aa" }}>{count} éléments</span>
    </div>
  );

  const cardStyle = (isSelected: boolean, color: string): React.CSSProperties => ({
    border: "2px solid",
    borderTopColor: isSelected ? color : "#2a1a4a",
    borderLeftColor: isSelected ? color : "#2a1a4a",
    borderBottomColor: isSelected ? color : "#0a0520",
    borderRightColor: isSelected ? color : "#0a0520",
    background: isSelected ? `${color}14` : "#100828",
    overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Classes */}
      <div>
        {subHeader("CLASSES (LANCEUR)", classArr.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {classArr.map((cls) => {
            const color = CLASS_COLORS[cls.id];
            const isSelected = selectedClass === cls.id;
            return (
              <div key={cls.id} onClick={() => setSelectedClass(isSelected ? null : cls.id)} style={cardStyle(isSelected, color)}>
                <div style={{ height: 72, background: "#0a0a1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <PegIcon id={cls.id as "canonnier" | "alchimiste" | "sniper"} size={28} />
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color, letterSpacing: "0.08em" }}>{cls.name.toUpperCase()}</div>
                </div>
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color: "#e0d0ff" }}>{cls.desc}</div>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#6655aa", fontStyle: "italic", lineHeight: 1.4 }}>&quot;{cls.flavorText}&quot;</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peg types */}
      <div>
        {subHeader("TYPES DE PEGS", PEG_DEFS.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          {PEG_DEFS.map((def) => {
            const isSelected = selectedPeg === def.id;
            return (
              <div key={def.id} onClick={() => setSelectedPeg(isSelected ? null : def.id)} style={cardStyle(isSelected, def.color)}>
                <div style={{ height: 64, background: "#0a0a1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CssPeg def={def} />
                </div>
                <div style={{ padding: "5px 7px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color: "#e0d0ff" }}>{def.name}</div>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#6655aa", lineHeight: 1.4 }}>{def.description}</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                    <div style={{ width: 10, height: 10, backgroundColor: def.color, flexShrink: 0, boxShadow: def.glow ? `0 0 4px ${def.glow}` : "none" }} />
                    <span style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#6655aa" }}>{def.color}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Décors */}
      <div>
        {subHeader("DÉCORS (NON-POPPABLES)", DECOR_DEFS.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          {DECOR_DEFS.map((def) => {
            const isSelected = selectedDecor === def.id;
            return (
              <div key={def.id} onClick={() => setSelectedDecor(isSelected ? null : def.id)} style={cardStyle(isSelected, def.color)}>
                <div style={{ height: 64, background: "#0a0a1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CssDecor def={def} />
                </div>
                <div style={{ padding: "5px 7px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color: "#e0d0ff" }}>{def.name}</div>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#6655aa", lineHeight: 1.4 }}>{def.description}</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                    <div style={{ width: 10, height: 10, backgroundColor: def.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#6655aa" }}>{def.color}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
