"use client";

import { useState } from "react";
import { useSettings } from "@/lib/contexts/settings-context";
import { WALLPAPERS, DEFAULT_WALLPAPER_ID } from "@/lib/wallpapers";
import { THEMES } from "@/lib/themes";
import { ICON_THEMES } from "@/lib/icon-themes";
import { CURSORS } from "@/lib/cursors";
import { FONT_PAIRS } from "@/lib/font-pairs";
import { SOUND_SCHEMES, type SoundSchemeId } from "@/lib/sound-schemes";
import { OsIcon } from "@/components/ui/os-icon";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { PegIcon } from "./PegIcon";
import { CLASSES, CLASS_COLORS } from "../engine/roguelite";

type ShowroomCategory = "wallpapers" | "themes" | "icons" | "cursors" | "fonts" | "sounds" | "peagle";

const SHOWROOM_TABS: { id: ShowroomCategory; label: string; icon: string }[] = [
  { id: "wallpapers", label: "Fonds d'écran", icon: "🖼️" },
  { id: "themes",     label: "Thèmes",        icon: "🎨" },
  { id: "icons",      label: "Icônes",        icon: "✦" },
  { id: "cursors",    label: "Curseurs",       icon: "🖱️" },
  { id: "fonts",      label: "Polices",        icon: "🔤" },
  { id: "sounds",     label: "Sons",           icon: "🔊" },
  { id: "peagle",     label: "Peagle 98",      icon: "🥚" },
];

const btn = (variant: "default" | "accent" = "default"): React.CSSProperties => {
  const filled = variant === "accent";
  return {
    background: filled ? "var(--t-accent)" : "var(--t-bg)",
    border: "2px solid",
    borderTopColor: filled ? "rgba(255,255,255,0.25)" : "var(--t-border-light)",
    borderLeftColor: filled ? "rgba(255,255,255,0.25)" : "var(--t-border-light)",
    borderBottomColor: filled ? "rgba(0,0,0,0.3)" : "var(--t-border-dark)",
    borderRightColor: filled ? "rgba(0,0,0,0.3)" : "var(--t-border-dark)",
    fontFamily: "var(--t-font-body)",
    fontSize: "var(--t-text-xs)",
    color: filled ? "#fff" : "var(--t-text)",
    padding: "3px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };
};

function AssetCard({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      border: "2px solid",
      borderTopColor: active ? "var(--t-accent)" : "var(--t-border-dark)",
      borderLeftColor: active ? "var(--t-accent)" : "var(--t-border-dark)",
      borderBottomColor: active ? "var(--t-accent)" : "var(--t-border-light)",
      borderRightColor: active ? "var(--t-accent)" : "var(--t-border-light)",
      background: "var(--t-bg)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {children}
    </div>
  );
}

function ActiveBadge() {
  return (
    <div style={{
      position: "absolute", top: 4, right: 4,
      background: "var(--t-accent)", color: "#fff",
      fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)",
      padding: "1px 5px",
    }}>ACTIF</div>
  );
}

function CardInfo({ name, description, active, onApply }: {
  name: string; description: string; active: boolean; onApply: () => void;
}) {
  return (
    <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <div style={{
        fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{name}</div>
      <div style={{
        fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)",
        lineHeight: 1.3, flex: 1,
      }}>{description}</div>
      <button style={active ? btn("accent") : btn()} disabled={active} onClick={onApply}>
        {active ? "✔ Actif" : "Appliquer"}
      </button>
    </div>
  );
}

// ── Wallpapers ─────────────────────────────────────────────────────────────────
function WallpapersGrid() {
  const { settings, setWallpaperId } = useSettings();
  const currentId = settings.wallpaperId ?? DEFAULT_WALLPAPER_ID;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
      {WALLPAPERS.map((wp) => {
        const isActive = wp.id === currentId;
        return (
          <AssetCard key={wp.id} active={isActive}>
            <div style={{ height: 90, position: "relative", overflow: "hidden", flexShrink: 0, ...wp.style }}>
              {isActive && <ActiveBadge />}
              {wp.animated && (
                <div style={{
                  position: "absolute", top: 4, left: 4,
                  background: "rgba(0,0,0,0.55)", color: "#fff",
                  fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", padding: "1px 5px",
                }}>▶ ANIMÉ</div>
              )}
              <div style={{
                position: "absolute", bottom: 4, left: 6, fontSize: "1.6rem", lineHeight: 1,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
              }}>{wp.emoji}</div>
            </div>
            <CardInfo name={wp.name} description={wp.description} active={isActive} onApply={() => setWallpaperId(wp.id)} />
          </AssetCard>
        );
      })}
    </div>
  );
}

// ── Themes ─────────────────────────────────────────────────────────────────────
function ThemesGrid() {
  const { settings, setTheme } = useSettings();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
      {THEMES.map((t) => {
        const isActive = settings.themeId === t.id;
        const p = t.preview;
        return (
          <AssetCard key={t.id} active={isActive}>
            <div style={{ height: 90, position: "relative", background: p.bg, flexShrink: 0, overflow: "hidden" }}>
              {isActive && <ActiveBadge />}
              <div style={{
                position: "absolute", top: 14, left: 10, right: 10,
                border: "2px solid rgba(0,0,0,0.3)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
              }}>
                <div style={{
                  background: `linear-gradient(to right, ${p.titlebarFrom}, ${p.titlebarTo})`,
                  padding: "3px 5px", display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: "0.7rem" }}>{t.emoji}</span>
                  <span style={{
                    fontFamily: "var(--t-font-display)", fontSize: "0.55rem",
                    color: p.titlebarText, flex: 1, whiteSpace: "nowrap", overflow: "hidden",
                  }}>{t.name}</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {["_", "□", "×"].map((c) => (
                      <div key={c} style={{
                        width: 10, height: 10, background: p.bg,
                        border: "1px solid rgba(0,0,0,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.4rem", color: p.text,
                      }}>{c}</div>
                    ))}
                  </div>
                </div>
                <div style={{ background: p.bg, padding: "4px 5px", minHeight: 22 }}>
                  <div style={{ width: "60%", height: 5, background: p.accent, marginBottom: 3 }} />
                  <div style={{ width: "40%", height: 4, background: p.text, opacity: 0.3 }} />
                </div>
              </div>
            </div>
            <CardInfo name={t.name} description={t.description} active={isActive} onApply={() => setTheme(t.id)} />
          </AssetCard>
        );
      })}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const ICON_PREVIEW_SLUGS = ["settings", "msn", "radio", "notepad", "trash"];

function IconsGrid() {
  const { settings, setIconTheme } = useSettings();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
      {ICON_THEMES.map((theme) => {
        const isActive = settings.iconThemeId === theme.id;
        return (
          <AssetCard key={theme.id} active={isActive}>
            <div style={{
              height: 80, position: "relative", flexShrink: 0, overflow: "hidden",
              background: "var(--t-app-bg)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 8px",
            }}>
              {isActive && <ActiveBadge />}
              {ICON_PREVIEW_SLUGS.map((slug) => (
                <OsIcon key={slug} slug={slug} size={28} theme={theme} />
              ))}
            </div>
            <CardInfo name={theme.displayName} description={theme.description} active={isActive} onApply={() => setIconTheme(theme.id)} />
          </AssetCard>
        );
      })}
    </div>
  );
}

// ── Cursors ────────────────────────────────────────────────────────────────────
function CursorsGrid() {
  const { settings, setCursorId } = useSettings();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
      {CURSORS.map((c) => {
        const isActive = settings.cursorId === c.id;
        return (
          <AssetCard key={c.id} active={isActive}>
            <div style={{
              height: 80, position: "relative", flexShrink: 0, overflow: "hidden",
              background: "var(--t-app-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: c.css,
            }}>
              {isActive && <ActiveBadge />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", lineHeight: 1, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}>
                  {c.emoji}
                </div>
                <div style={{
                  fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)",
                  color: "var(--t-text-muted)", marginTop: 4,
                }}>survole pour tester</div>
              </div>
            </div>
            <CardInfo name={c.label} description={c.description} active={isActive} onApply={() => setCursorId(c.id)} />
          </AssetCard>
        );
      })}
    </div>
  );
}

// ── Fonts ──────────────────────────────────────────────────────────────────────
function FontsGrid() {
  const { settings, setFontPairId } = useSettings();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
      {FONT_PAIRS.map((fp) => {
        const isActive = settings.fontPairId === fp.id;
        return (
          <AssetCard key={fp.id} active={isActive}>
            <div style={{
              height: 90, position: "relative", flexShrink: 0, overflow: "hidden",
              background: "var(--t-app-bg)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, padding: "8px",
            }}>
              {isActive && <ActiveBadge />}
              <div style={{
                fontFamily: fp.displayVar,
                fontSize: `calc(1.6rem * ${fp.scale})`,
                color: "var(--t-text)", lineHeight: 1, whiteSpace: "nowrap",
              }}>{fp.sample}</div>
              <div style={{
                fontFamily: fp.bodyVar,
                fontSize: `calc(0.75rem * ${fp.scale})`,
                color: "var(--t-text-muted)", whiteSpace: "nowrap",
              }}>The quick brown fox</div>
            </div>
            <CardInfo name={fp.name} description={fp.description} active={isActive} onApply={() => setFontPairId(fp.id)} />
          </AssetCard>
        );
      })}
    </div>
  );
}

// ── Sounds ─────────────────────────────────────────────────────────────────────
function SoundsGrid() {
  const { settings, setSoundScheme } = useSettings();
  const { init, playClick } = useSoundContext();
  const [testing, setTesting] = useState<SoundSchemeId | null>(null);

  const handleTest = (id: SoundSchemeId) => {
    init();
    setSoundScheme(id);
    setTesting(id);
    setTimeout(() => { playClick(); setTesting(null); }, 80);
  };

  const WAVE_PROFILES: Record<string, number[]> = {
    win98:     [3, 7, 12, 8, 14, 10, 6, 9, 13, 7, 11, 5],
    soft:      [4, 6, 9, 7, 11, 8, 6, 8, 10, 6, 8, 5],
    chiptune:  [2, 14, 2, 14, 2, 14, 2, 14, 2, 14, 2, 14],
    futuriste: [5, 9, 14, 11, 8, 13, 10, 7, 12, 9, 6, 11],
    drole:     [6, 12, 4, 14, 3, 11, 8, 13, 2, 10, 7, 5],
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
      {SOUND_SCHEMES.map((s) => {
        const isActive = settings.soundSchemeId === s.id;
        const bars = WAVE_PROFILES[s.id] ?? [6, 8, 10, 8, 6, 8, 10, 8, 6, 8, 10, 8];
        return (
          <AssetCard key={s.id} active={isActive}>
            <div style={{
              height: 80, position: "relative", flexShrink: 0,
              background: "var(--t-app-bg)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              gap: 3, padding: "10px 12px 8px",
            }}>
              {isActive && <ActiveBadge />}
              {bars.map((h, i) => (
                <div key={i} style={{
                  width: 6, height: `${h * 4}px`,
                  background: isActive || testing === s.id ? "var(--t-accent)" : "var(--t-text-muted)",
                  opacity: testing === s.id ? 0.9 : 0.6,
                  transition: "height 0.2s ease",
                }} />
              ))}
            </div>
            <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.3 }}>{s.description}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ ...btn(), flex: 1 }} onClick={() => handleTest(s.id)} disabled={testing !== null}>
                  {testing === s.id ? "…" : "🔊 Tester"}
                </button>
                {!isActive && <button style={btn("accent")} onClick={() => setSoundScheme(s.id)}>Garder</button>}
                {isActive  && <button style={btn("accent")} disabled>✔</button>}
              </div>
            </div>
          </AssetCard>
        );
      })}
    </div>
  );
}

// ── Peagle assets ──────────────────────────────────────────────────────────────
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

function PeagleAssetsGrid({ onBack }: { onBack: () => void }) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedPeg,   setSelectedPeg]   = useState<string | null>(null);
  const [selectedDecor, setSelectedDecor] = useState<string | null>(null);

  const classArr = Object.values(CLASSES);

  const subHeader = (label: string, count: number) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 4,
      borderBottom: "1px solid var(--t-border-dark)", paddingBottom: 4,
    }}>
      <span style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-sm)", color: "var(--t-text)" }}>{label}</span>
      <span style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>{count} éléments</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Classes */}
      <div>
        {subHeader("Classes (Lanceur)", classArr.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {classArr.map((cls) => {
            const color = CLASS_COLORS[cls.id];
            const isSelected = selectedClass === cls.id;
            return (
              <div key={cls.id} onClick={() => setSelectedClass(isSelected ? null : cls.id)} style={{
                border: "2px solid",
                borderTopColor: isSelected ? color : "var(--t-border-dark)",
                borderLeftColor: isSelected ? color : "var(--t-border-dark)",
                borderBottomColor: isSelected ? color : "var(--t-border-light)",
                borderRightColor: isSelected ? color : "var(--t-border-light)",
                background: isSelected ? `${color}14` : "var(--t-bg)",
                overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
              }}>
                <div style={{ height: 80, background: "#0a0a1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <PegIcon id={cls.id as "canonnier" | "alchimiste" | "sniper"} size={32} />
                  <div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color, letterSpacing: "0.08em" }}>{cls.name.toUpperCase()}</div>
                </div>
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>{cls.name}</div>
                  <div style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.3 }}>{cls.desc}</div>
                  <div style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontStyle: "italic", lineHeight: 1.2 }}>&quot;{cls.flavorText}&quot;</div>
                  <button
                    style={isSelected ? { ...btn("accent"), borderColor: color, backgroundColor: color } : btn()}
                    onClick={(e) => { e.stopPropagation(); onBack(); }}
                  >🥚 Jouer</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peg types */}
      <div>
        {subHeader("Types de Pegs", PEG_DEFS.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {PEG_DEFS.map((def) => {
            const isSelected = selectedPeg === def.id;
            return (
              <div key={def.id} onClick={() => setSelectedPeg(isSelected ? null : def.id)} style={{
                border: "2px solid",
                borderTopColor: isSelected ? def.color : "var(--t-border-dark)",
                borderLeftColor: isSelected ? def.color : "var(--t-border-dark)",
                borderBottomColor: isSelected ? def.color : "var(--t-border-light)",
                borderRightColor: isSelected ? def.color : "var(--t-border-light)",
                background: isSelected ? `${def.color}18` : "var(--t-bg)",
                overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
              }}>
                <div style={{ height: 72, background: "#0a0a1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CssPeg def={def} />
                </div>
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>{def.name}</div>
                  <div style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.3 }}>{def.description}</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                    <div style={{ width: 10, height: 10, backgroundColor: def.color, flexShrink: 0, boxShadow: def.glow ? `0 0 4px ${def.glow}` : "none" }} />
                    <span style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>{def.color}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Décors */}
      <div>
        {subHeader("Décors (non-poppables)", DECOR_DEFS.length)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {DECOR_DEFS.map((def) => {
            const isSelected = selectedDecor === def.id;
            return (
              <div key={def.id} onClick={() => setSelectedDecor(isSelected ? null : def.id)} style={{
                border: "2px solid",
                borderTopColor: isSelected ? def.color : "var(--t-border-dark)",
                borderLeftColor: isSelected ? def.color : "var(--t-border-dark)",
                borderBottomColor: isSelected ? def.color : "var(--t-border-light)",
                borderRightColor: isSelected ? def.color : "var(--t-border-light)",
                background: isSelected ? `${def.color}18` : "var(--t-bg)",
                overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
              }}>
                <div style={{ height: 72, background: "#0a0a1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CssDecor def={def} />
                </div>
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>{def.name}</div>
                  <div style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.3 }}>{def.description}</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                    <div style={{ width: 10, height: 10, backgroundColor: def.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>{def.color}</span>
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

// ── Root ───────────────────────────────────────────────────────────────────────
export function Showroom({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<ShowroomCategory>("peagle");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "6px 10px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-bg)", flexShrink: 0,
      }}>
        <button style={btn()} onClick={onBack}>← Menu</button>
        <div>
          <div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-sm)", color: "var(--t-text)" }}>
            🎨 Showroom
          </div>
          <div style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            Personnalisez l&apos;OS et explorez Peagle 98
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 2,
        padding: "6px 10px 0",
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-bg)", flexShrink: 0,
      }}>
        {SHOWROOM_TABS.map((tab) => {
          const isActive = tab.id === category;
          return (
            <button key={tab.id} onClick={() => setCategory(tab.id)} style={{
              padding: "4px 10px", border: "2px solid",
              borderBottomColor: isActive ? "var(--t-bg)" : "var(--t-border-dark)",
              borderTopColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderLeftColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              background: isActive ? "var(--t-bg)" : "var(--t-app-bg)",
              fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text)",
              cursor: "pointer", marginBottom: isActive ? -2 : 0,
              position: "relative", zIndex: isActive ? 1 : 0,
            }}>
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
        {category === "wallpapers" && <WallpapersGrid />}
        {category === "themes"     && <ThemesGrid />}
        {category === "icons"      && <IconsGrid />}
        {category === "cursors"    && <CursorsGrid />}
        {category === "fonts"      && <FontsGrid />}
        {category === "sounds"     && <SoundsGrid />}
        {category === "peagle"     && <PeagleAssetsGrid onBack={onBack} />}
      </div>
    </div>
  );
}
