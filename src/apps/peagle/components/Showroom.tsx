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
export const PEAGLE_LIVE_PEG_SKIN_KEY = "peagle_live_peg_skin";
export const PEAGLE_LIVE_DECOR_SKIN_KEY = "peagle_live_decor_skin";

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

type SkinDef = { id: string; name: string; desc: string };

const PEG_DEFS: { id: string; name: string; description: string; color: string; skinCount: number }[] = [
  { id: "normal", name: "Peg Normal",  description: "Le peg de base. À détruire.",              color: "#2233aa", skinCount: 5 },
  { id: "orange", name: "Peg Orange",  description: "Objectif principal de chaque niveau.",     color: "#ff5500", skinCount: 5 },
  { id: "green",  name: "Peg Vert",    description: "Bonus aléatoire au contact.",              color: "#009922", skinCount: 5 },
  { id: "boss",   name: "Boss Peg",    description: "5 HP. Pulsant. Redoutable.",               color: "#cc8800", skinCount: 3 },
  { id: "bomb",   name: "Bombe",       description: "Explose et élimine les pegs voisins.",     color: "#ff1133", skinCount: 3 },
  { id: "armor",  name: "Blindé",      description: "Résiste à plusieurs impacts.",             color: "#888899", skinCount: 3 },
  { id: "warp",   name: "Warp",        description: "Téléporte la balle vers son peg jumeau.", color: "#6600cc", skinCount: 3 },
];

const DECOR_DEFS: { id: string; name: string; description: string; color: string; skinCount: number }[] = [
  { id: "bumper", name: "Bumper",  description: "Renvoie la balle avec force. Idéal pour les combos.", color: "#3355dd", skinCount: 3 },
  { id: "plank",  name: "Planche", description: "Surface inclinée qui guide la trajectoire.",           color: "#aa7733", skinCount: 3 },
  { id: "arc",    name: "Arc",     description: "Courbe qui dévie doucement la balle.",                 color: "#5544cc", skinCount: 3 },
  { id: "spike",  name: "Pointe",  description: "Obstacle tranchant — la balle rebondit dessus.",       color: "#cc3355", skinCount: 3 },
];

export const PEG_SKINS: Record<string, SkinDef[]> = {
  normal: [
    { id: "peg_normal_1", name: "Classique", desc: "Le peg bleu de base. Solide." },
    { id: "peg_normal_2", name: "Ardoise",   desc: "Gris-bleu froid, reflet métallique." },
    { id: "peg_normal_3", name: "Minuit",    desc: "Bleu sombre, presque invisible." },
    { id: "peg_normal_4", name: "Acier",     desc: "Argent brossé, industriel." },
    { id: "peg_normal_5", name: "Fantôme",   desc: "Contours pointillés, à peine là." },
  ],
  orange: [
    { id: "peg_orange_1", name: "Classique", desc: "Orange vif. L'objectif absolu." },
    { id: "peg_orange_2", name: "Soleil",    desc: "Rayons dorés, cœur éclatant." },
    { id: "peg_orange_3", name: "Braise",    desc: "Rouge-orange, bords noircis." },
    { id: "peg_orange_4", name: "Lava",      desc: "Volcanique, cracks internes." },
    { id: "peg_orange_5", name: "Doré",      desc: "Édition légendaire. Or pur." },
  ],
  green: [
    { id: "peg_green_1", name: "Classique", desc: "Vert avec checkmark. Bonus garanti." },
    { id: "peg_green_2", name: "Trèfle",    desc: "Motif feuille vert foncé. Chanceux." },
    { id: "peg_green_3", name: "Émeraude",  desc: "Vert précieux, facettes brillantes." },
    { id: "peg_green_4", name: "Toxic",     desc: "Vert acide. Ne pas avaler." },
    { id: "peg_green_5", name: "Nature",    desc: "Texture mousse organique." },
  ],
  boss: [
    { id: "peg_boss_1", name: "Couronne", desc: "Or et couronne. Le roi des pegs." },
    { id: "peg_boss_2", name: "Démon",    desc: "Rouge sang, crocs apparents." },
    { id: "peg_boss_3", name: "Obsidienne", desc: "Noir profond, runes violettes." },
  ],
  bomb: [
    { id: "peg_bomb_1", name: "Dynamite", desc: "Rouge vif, mèche en feu." },
    { id: "peg_bomb_2", name: "Grenade",  desc: "Verte militaire, nervures." },
    { id: "peg_bomb_3", name: "Mine",     desc: "Noire avec croix rouge. Discret." },
  ],
  armor: [
    { id: "peg_armor_1", name: "Métal",  desc: "Gris métal, rivets apparents." },
    { id: "peg_armor_2", name: "Titane", desc: "Bleu acier. Quasi indestructible." },
    { id: "peg_armor_3", name: "Bois",   desc: "Planche clouée. Rustique mais solide." },
  ],
  warp: [
    { id: "peg_warp_1", name: "Spirale", desc: "Violet pulsant, vortex central." },
    { id: "peg_warp_2", name: "Portail", desc: "Bleu électrique, anneau ouvert." },
    { id: "peg_warp_3", name: "Néon",    desc: "Rose flashy, halo éblouissant." },
  ],
};

export const DECOR_SKINS: Record<string, SkinDef[]> = {
  bumper: [
    { id: "decor_bumper_1", name: "Classique", desc: "Bleu standard. Rebondit bien." },
    { id: "decor_bumper_2", name: "Néon",      desc: "Rouge pulsant. Dangereux à l'œil." },
    { id: "decor_bumper_3", name: "Or",        desc: "Doré, prestige. Rebondit mieux." },
  ],
  plank: [
    { id: "decor_plank_1", name: "Bois",   desc: "Planche en bois avec nœud visible." },
    { id: "decor_plank_2", name: "Métal",  desc: "Plaque d'acier grise, industrielle." },
    { id: "decor_plank_3", name: "Pierre", desc: "Dalle de roc. Inébranlable." },
  ],
  arc: [
    { id: "decor_arc_1", name: "Bois",  desc: "Courbe organique, naturelle." },
    { id: "decor_arc_2", name: "Acier", desc: "Arc métallique brillant." },
    { id: "decor_arc_3", name: "Néon",  desc: "Arc lumineux rose. Bien visible." },
  ],
  spike: [
    { id: "decor_spike_1", name: "Rouge",  desc: "Classique rouge tranchant." },
    { id: "decor_spike_2", name: "Glace",  desc: "Pointe bleue translucide." },
    { id: "decor_spike_3", name: "Or",     desc: "Dorée, précieuse et mortelle." },
  ],
};

interface PeagleAssetsGridProps {
  cfg: DevConfig;
  onLaunch: (cfg: DevConfig) => void;
  onApplyTheme: (themeId: string) => void;
}

export function PeagleAssetsGrid({ cfg, onLaunch, onApplyTheme }: PeagleAssetsGridProps) {
  const [activeSkins, setActiveSkins] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("peagle_active_skins") ?? "{}") as Record<string, string>; }
    catch { return {}; }
  });
  const [activePegSkins, setActivePegSkins] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("peagle_active_peg_skins") ?? "{}") as Record<string, string>; }
    catch { return {}; }
  });
  const [activeDecorSkins, setActiveDecorSkins] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("peagle_active_decor_skins") ?? "{}") as Record<string, string>; }
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

  function applyPegSkin(pegId: string, skinId: string) {
    const next = { ...activePegSkins, [pegId]: skinId };
    setActivePegSkins(next);
    localStorage.setItem("peagle_active_peg_skins", JSON.stringify(next));
    localStorage.setItem(PEAGLE_LIVE_PEG_SKIN_KEY, JSON.stringify({ pegId, skinId }));
    window.dispatchEvent(new StorageEvent("storage", { key: PEAGLE_LIVE_PEG_SKIN_KEY, newValue: JSON.stringify({ pegId, skinId }) }));
  }

  function applyDecorSkin(decorId: string, skinId: string) {
    const next = { ...activeDecorSkins, [decorId]: skinId };
    setActiveDecorSkins(next);
    localStorage.setItem("peagle_active_decor_skins", JSON.stringify(next));
    localStorage.setItem(PEAGLE_LIVE_DECOR_SKIN_KEY, JSON.stringify({ decorId, skinId }));
    window.dispatchEvent(new StorageEvent("storage", { key: PEAGLE_LIVE_DECOR_SKIN_KEY, newValue: JSON.stringify({ decorId, skinId }) }));
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PEG_DEFS.map((def) => {
            const color = def.color;
            const skins = PEG_SKINS[def.id] ?? [];
            const activeSkinId = activePegSkins[def.id] ?? skins[0]?.id;
            const cols = skins.length <= 3 ? skins.length : 5;
            return (
              <div key={def.id} style={{
                border: "2px solid",
                borderTopColor: color, borderLeftColor: color,
                borderBottomColor: "#0a0520", borderRightColor: "#0a0520",
                background: "#100828",
              }}>
                <div style={{
                  padding: "6px 10px", display: "flex", alignItems: "center",
                  gap: 8, borderBottom: "1px solid #2a1a4a", background: "#0a0820",
                }}>
                  <div style={{ width: 8, height: 8, backgroundColor: color, flexShrink: 0 }} />
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 8, color, letterSpacing: "0.08em" }}>
                    {def.name.toUpperCase()}
                  </div>
                </div>
                <div style={{ padding: "4px 10px 6px" }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#e0d0ff", lineHeight: 1.5 }}>{def.description}</div>
                </div>
                <div style={{ padding: "0 8px 8px", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
                  {skins.map((skin) => {
                    const isSkinActive = activeSkinId === skin.id;
                    return (
                      <div
                        key={skin.id}
                        title={`${skin.name} — ${skin.desc}`}
                        onClick={() => applyPegSkin(def.id, skin.id)}
                        style={{
                          cursor: "pointer",
                          border: "2px solid",
                          borderTopColor: isSkinActive ? color : "#2a1a4a",
                          borderLeftColor: isSkinActive ? color : "#2a1a4a",
                          borderBottomColor: "#0a0520", borderRightColor: "#0a0520",
                          background: isSkinActive ? `${color}22` : "#0a0a1e",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 4, padding: "6px 2px 5px",
                          position: "relative",
                        }}
                      >
                        {isSkinActive && (
                          <div style={{ position: "absolute", top: 1, right: 2, fontFamily: "monospace", fontSize: 7, color }}>✔</div>
                        )}
                        <PegIcon id={skin.id as Parameters<typeof PegIcon>[0]["id"]} size={32} />
                        <div style={{
                          fontFamily: "var(--font-press-start), monospace",
                          fontSize: 5, color: isSkinActive ? color : "#6655aa",
                          textAlign: "center", lineHeight: 1.3, wordBreak: "break-word",
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

      {/* Décors */}
      <div>
        {subHeader("DÉCORS (NON-POPPABLES)", DECOR_DEFS.length)}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DECOR_DEFS.map((def) => {
            const color = def.color;
            const skins = DECOR_SKINS[def.id] ?? [];
            const activeSkinId = activeDecorSkins[def.id] ?? skins[0]?.id;
            return (
              <div key={def.id} style={{
                border: "2px solid",
                borderTopColor: color, borderLeftColor: color,
                borderBottomColor: "#0a0520", borderRightColor: "#0a0520",
                background: "#100828",
              }}>
                <div style={{
                  padding: "6px 10px", display: "flex", alignItems: "center",
                  gap: 8, borderBottom: "1px solid #2a1a4a", background: "#0a0820",
                }}>
                  <div style={{ width: 8, height: 8, backgroundColor: color, flexShrink: 0 }} />
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 8, color, letterSpacing: "0.08em" }}>
                    {def.name.toUpperCase()}
                  </div>
                </div>
                <div style={{ padding: "4px 10px 6px" }}>
                  <div style={{ fontFamily: "var(--font-press-start), monospace", fontSize: 6, color: "#e0d0ff", lineHeight: 1.5 }}>{def.description}</div>
                </div>
                <div style={{ padding: "0 8px 8px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                  {skins.map((skin) => {
                    const isSkinActive = activeSkinId === skin.id;
                    return (
                      <div
                        key={skin.id}
                        title={`${skin.name} — ${skin.desc}`}
                        onClick={() => applyDecorSkin(def.id, skin.id)}
                        style={{
                          cursor: "pointer",
                          border: "2px solid",
                          borderTopColor: isSkinActive ? color : "#2a1a4a",
                          borderLeftColor: isSkinActive ? color : "#2a1a4a",
                          borderBottomColor: "#0a0520", borderRightColor: "#0a0520",
                          background: isSkinActive ? `${color}22` : "#0a0a1e",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 4, padding: "6px 2px 5px",
                          position: "relative",
                        }}
                      >
                        {isSkinActive && (
                          <div style={{ position: "absolute", top: 1, right: 2, fontFamily: "monospace", fontSize: 7, color }}>✔</div>
                        )}
                        <PegIcon id={skin.id as Parameters<typeof PegIcon>[0]["id"]} size={32} />
                        <div style={{
                          fontFamily: "var(--font-press-start), monospace",
                          fontSize: 5, color: isSkinActive ? color : "#6655aa",
                          textAlign: "center", lineHeight: 1.3, wordBreak: "break-word",
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
    </div>
  );
}
