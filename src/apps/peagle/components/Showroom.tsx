"use client";

import { useState } from "react";
import { PegIcon } from "./PegIcon";
import { CLASSES, CLASS_COLORS } from "../engine/roguelite";
import { GAME_THEMES } from "../engine/game-theme";
import type { DevConfig } from "./DevPanel";
import { btnRaised, PG } from "../styles";
import { useOpenApp } from "@/lib/hooks/use-open-app";

export const PEAGLE_LIVE_THEME_KEY = "peagle_live_theme";
export const PEAGLE_LIVE_SKIN_KEY = "peagle_live_skin";

// 5 skin options per class — maps classId to array of PegIconId skins
export const CLASS_SKINS: Record<string, { id: string; name: string; desc: string }[]> = {
  canonnier: [
    { id: "pelican_1", name: "Classique",   desc: "Le pélican de base. Fier de sa poche." },
    { id: "pelican_2", name: "Tropical",    desc: "Bec orange flamboyant, plumes de vacances." },
    { id: "pelican_3", name: "Rosé",        desc: "Une teinte rosée suspecte. Il a mangé des crevettes." },
    { id: "pelican_4", name: "Terreux",     desc: "Brun, solide, fiable. Ou juste sale." },
    { id: "pelican_5", name: "Dorée",       desc: "Édition légendaire. Plumes or, ego XXL." },
  ],
  alchimiste: [
    { id: "corbeau_1", name: "Classique",   desc: "Le corbeau de base. Regardé de travers." },
    { id: "corbeau_2", name: "Détective",   desc: "Chapeau, air mystérieux, zéro réponse." },
    { id: "corbeau_3", name: "Sorcier",     desc: "Plumes violettes. Pratique la magie noire." },
    { id: "corbeau_4", name: "Pirate",      desc: "Bandeau sur l'œil. L'autre aussi est fermé." },
    { id: "corbeau_5", name: "Albinos",     desc: "Blanc rare. L'exception qui confirme la règle." },
  ],
  sniper: [
    { id: "faucon_1",  name: "Pèlerin",     desc: "Le classique. Masque noir, regard d'acier." },
    { id: "faucon_2",  name: "Crécerelle",  desc: "Rouille et feu. Imprévisible en descente." },
    { id: "faucon_3",  name: "Royal",       desc: "Plumes blanches et or. Ne rate jamais." },
    { id: "faucon_4",  name: "Gerfaut",     desc: "Arctique. Blanc immaculé. Discret et mortel." },
    { id: "faucon_5",  name: "Cyber",       desc: "Yeux laser. Version 3.0. Mise à jour en cours." },
  ],
};

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

interface PeagleAssetsGridProps {
  cfg: DevConfig;
  onLaunch: (cfg: DevConfig) => void;
  onApplyTheme: (themeId: string) => void;
}

export function PeagleAssetsGrid({ cfg, onLaunch, onApplyTheme }: PeagleAssetsGridProps) {
  const [selectedPeg,   setSelectedPeg]   = useState<string | null>(null);
  const [selectedDecor, setSelectedDecor] = useState<string | null>(null);
  const [activeSkins, setActiveSkins] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("peagle_active_skins") ?? "{}") as Record<string, string>; }
    catch { return {}; }
  });
  const { openApp } = useOpenApp();

  function broadcastAndApplyTheme(themeId: string) {
    localStorage.setItem(PEAGLE_LIVE_THEME_KEY, themeId);
    window.dispatchEvent(new StorageEvent("storage", { key: PEAGLE_LIVE_THEME_KEY, newValue: themeId }));
    onApplyTheme(themeId);
  }

  function applySkin(classId: string, skinId: string) {
    const next = { ...activeSkins, [classId]: skinId };
    setActiveSkins(next);
    localStorage.setItem("peagle_active_skins", JSON.stringify(next));
    localStorage.setItem(PEAGLE_LIVE_SKIN_KEY, JSON.stringify({ classId, skinId }));
    window.dispatchEvent(new StorageEvent("storage", { key: PEAGLE_LIVE_SKIN_KEY, newValue: JSON.stringify({ classId, skinId }) }));
  }

  function openPreview() {
    openApp("peagle-showroom");
  }

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

      {/* Live preview button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color: PG.textMuted, lineHeight: 1.5 }}>
          Les thèmes s'appliquent en live dans une fenêtre de préview.
        </span>
        <button
          style={{
            ...btnRaised,
            fontSize: 7,
            padding: "5px 10px",
            flexShrink: 0,
            borderTopColor: PG.cyan,
            borderLeftColor: PG.cyan,
            color: PG.cyan,
            whiteSpace: "nowrap",
          }}
          onClick={openPreview}
        >
          ⧉ OUVRIR PREVIEW
        </button>
      </div>

      {/* Themes visuels */}
      <div>
        {subHeader("THÈMES VISUELS", GAME_THEMES.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {GAME_THEMES.map(theme => {
            const isActive = cfg.gameThemeId === theme.id;
            return (
              <div key={theme.id} style={cardStyle(isActive, theme.preview.accent)}>
                {/* Gradient thumbnail with peg color swatches */}
                <div style={{
                  height: 56, background: theme.preview.gradient,
                  position: "relative", display: "flex",
                  alignItems: "flex-end", padding: "0 8px 7px",
                  gap: 4,
                }}>
                  {isActive && (
                    <div style={{
                      position: "absolute", top: 4, right: 4,
                      background: theme.preview.accent, color: "#000",
                      fontFamily: "var(--font-press-start), monospace",
                      fontSize: 6, padding: "2px 5px",
                    }}>ACTIF</div>
                  )}
                  {/* Mini peg swatches */}
                  {([theme.peg.normal, theme.peg.orange, theme.peg.green, theme.peg.warp] as const).map((color, i) => (
                    <div key={i} style={{
                      width: 9, height: 9, background: color,
                      boxShadow: `0 0 4px ${color}`,
                    }} />
                  ))}
                </div>
                <div style={{ padding: "5px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 7, color: "#e0d0ff" }}>{theme.name}</div>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: PG.textMuted, lineHeight: 1.4 }}>{theme.description}</div>
                  <button
                    style={{
                      ...btnRaised, fontSize: 6, padding: "3px 0", width: "100%", marginTop: 2,
                      background: isActive ? `linear-gradient(to bottom, ${theme.preview.accent}cc, ${theme.preview.accent}88)` : undefined,
                      color: isActive ? "#000" : theme.preview.accent,
                      borderTopColor: theme.preview.accent,
                      borderLeftColor: theme.preview.accent,
                    }}
                    disabled={isActive}
                    onClick={() => broadcastAndApplyTheme(theme.id)}
                  >
                    {isActive ? "✔ ACTIF" : "▶ APPLIQUER"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Classes + skins */}
      <div>
        {subHeader("CLASSES (LANCEUR)", classArr.length)}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {classArr.map((cls) => {
            const color = CLASS_COLORS[cls.id];
            const isActiveClass = cfg.classId === cls.id;
            const skins = CLASS_SKINS[cls.id] ?? [];
            const activeSkinId = activeSkins[cls.id] ?? skins[0]?.id ?? cls.id;

            return (
              <div key={cls.id} style={{
                border: "2px solid",
                borderTopColor: isActiveClass ? color : "#2a1a4a",
                borderLeftColor: isActiveClass ? color : "#2a1a4a",
                borderBottomColor: isActiveClass ? color : "#0a0520",
                borderRightColor: isActiveClass ? color : "#0a0520",
                background: isActiveClass ? `${color}0a` : "#100828",
              }}>
                {/* Classe header */}
                <div style={{
                  padding: "6px 10px", display: "flex", alignItems: "center",
                  gap: 8, borderBottom: `1px solid #2a1a4a`,
                  background: isActiveClass ? `${color}18` : "#0a0820",
                }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 8, color, letterSpacing: "0.08em" }}>
                    {cls.name.toUpperCase()}
                  </div>
                  {isActiveClass && (
                    <div style={{ background: color, color: "#000", fontFamily: "var(--font-press-start), monospace", fontSize: 6, padding: "1px 5px" }}>
                      ACTIF
                    </div>
                  )}
                  <div style={{ flex: 1 }} />
                  <button
                    style={{
                      ...btnRaised, fontSize: 6, padding: "3px 8px",
                      background: isActiveClass ? `linear-gradient(to bottom, ${color}cc, ${color}88)` : undefined,
                      color: isActiveClass ? "#000" : color,
                      borderTopColor: color, borderLeftColor: color,
                    }}
                    onClick={() => onLaunch({ ...cfg, classId: cls.id })}
                  >
                    {isActiveClass ? "▶ RELANCER" : "▶ JOUER"}
                  </button>
                </div>

                {/* Classe description */}
                <div style={{ padding: "4px 10px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#e0d0ff", lineHeight: 1.5 }}>{cls.desc}</div>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#6655aa", fontStyle: "italic", lineHeight: 1.4 }}>&quot;{cls.flavorText}&quot;</div>
                </div>

                {/* Skins grid */}
                <div style={{ padding: "0 8px 8px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                  {skins.map((skin) => {
                    const isSkinActive = activeSkinId === skin.id;
                    return (
                      <div
                        key={skin.id}
                        title={`${skin.name} — ${skin.desc}`}
                        onClick={() => applySkin(cls.id, skin.id)}
                        style={{
                          cursor: "pointer",
                          border: "2px solid",
                          borderTopColor: isSkinActive ? color : "#2a1a4a",
                          borderLeftColor: isSkinActive ? color : "#2a1a4a",
                          borderBottomColor: isSkinActive ? "#0a0520" : "#0a0520",
                          borderRightColor: isSkinActive ? "#0a0520" : "#0a0520",
                          background: isSkinActive ? `${color}22` : "#0a0a1e",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 4, padding: "6px 2px 5px",
                          position: "relative",
                        }}
                      >
                        {isSkinActive && (
                          <div style={{
                            position: "absolute", top: 1, right: 2,
                            fontFamily: "monospace", fontSize: 7, color,
                          }}>✔</div>
                        )}
                        <PegIcon id={skin.id as Parameters<typeof PegIcon>[0]["id"]} size={32} />
                        <div style={{
                          fontFamily: "var(--font-press-start), monospace",
                          fontSize: 5, color: isSkinActive ? color : "#6655aa",
                          textAlign: "center", lineHeight: 1.3,
                          wordBreak: "break-word",
                        }}>{skin.name}</div>
                      </div>
                    );
                  })}
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
