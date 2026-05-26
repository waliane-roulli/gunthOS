// ─── Peagle 98 — Peg & Decor skin system ─────────────────────────────────────
// Reads active skin choices from localStorage and produces color overrides
// applied at render time, exactly like the bird skin system in ui.ts.

import type { PegTheme } from "../engine/game-theme";

// ── Peg skin palette overrides ────────────────────────────────────────────────
// Each entry maps a skin id → partial PegTheme colors for that peg type.
// Only the fields relevant to the peg type need to be specified.

interface PegSkinColors {
  main: string;
  hi: string;
  dark: string;
  glow?: string;
}

const PEG_SKIN_COLORS: Record<string, PegSkinColors> = {
  // ── Normal ──────────────────────────────────────────────────────────────────
  peg_normal_1: { main: "#2233aa", hi: "#4455ff", dark: "#000d44" },
  peg_normal_2: { main: "#445577", hi: "#aabbcc", dark: "#1a2233" },
  peg_normal_3: { main: "#0a0a2e", hi: "#1133aa", dark: "#000008" },
  peg_normal_4: { main: "#8899bb", hi: "#ddeeff", dark: "#334466" },
  peg_normal_5: { main: "#334488", hi: "#6677cc", dark: "#0a0a22" },

  // ── Orange ──────────────────────────────────────────────────────────────────
  peg_orange_1: { main: "#ff5500", hi: "#ffdd44", dark: "#882200", glow: "rgba(255,100,0,0.5)" },
  peg_orange_2: { main: "#ff7700", hi: "#ffee66", dark: "#883300", glow: "rgba(255,150,0,0.5)" },
  peg_orange_3: { main: "#ff3300", hi: "#ffaa44", dark: "#882200", glow: "rgba(255,60,0,0.5)" },
  peg_orange_4: { main: "#cc3300", hi: "#ff8800", dark: "#661100", glow: "rgba(200,80,0,0.4)" },
  peg_orange_5: { main: "#ff8800", hi: "#ffee88", dark: "#884400", glow: "rgba(255,200,0,0.6)" },

  // ── Green ───────────────────────────────────────────────────────────────────
  peg_green_1: { main: "#009922", hi: "#aaffcc", dark: "#003311", glow: "rgba(0,255,68,0.4)" },
  peg_green_2: { main: "#00cc44", hi: "#88ffaa", dark: "#004422", glow: "rgba(0,220,80,0.4)" },
  peg_green_3: { main: "#00aa44", hi: "#88ffbb", dark: "#005522", glow: "rgba(0,180,80,0.4)" },
  peg_green_4: { main: "#44cc00", hi: "#aaff00", dark: "#224400", glow: "rgba(100,255,0,0.4)" },
  peg_green_5: { main: "#006622", hi: "#00ff88", dark: "#003311", glow: "rgba(0,255,120,0.4)" },

  // ── Boss ────────────────────────────────────────────────────────────────────
  peg_boss_1: { main: "#cc8800", hi: "#ffff88", dark: "#664400", glow: "rgba(255,204,0,0.6)" },
  peg_boss_2: { main: "#aa0000", hi: "#ff4400", dark: "#440000", glow: "rgba(255,60,0,0.6)" },
  peg_boss_3: { main: "#111122", hi: "#cc44ff", dark: "#000008", glow: "rgba(180,0,255,0.5)" },

  // ── Bomb ────────────────────────────────────────────────────────────────────
  peg_bomb_1: { main: "#cc1133", hi: "#ff4466", dark: "#880011", glow: "rgba(255,20,60,0.5)" },
  peg_bomb_2: { main: "#336611", hi: "#66aa22", dark: "#223300", glow: "rgba(80,180,0,0.4)" },
  peg_bomb_3: { main: "#111111", hi: "#ff2244", dark: "#000000", glow: "rgba(255,0,40,0.4)" },

  // ── Armor ───────────────────────────────────────────────────────────────────
  peg_armor_1: { main: "#888899", hi: "#dddde8", dark: "#333340" },
  peg_armor_2: { main: "#334466", hi: "#aabbdd", dark: "#111a2a" },
  peg_armor_3: { main: "#886644", hi: "#ccaa88", dark: "#442211" },

  // ── Warp ────────────────────────────────────────────────────────────────────
  peg_warp_1: { main: "#6600cc", hi: "#ee88ff", dark: "#330066", glow: "rgba(204,0,255,0.6)" },
  peg_warp_2: { main: "#0044cc", hi: "#88ccff", dark: "#001166", glow: "rgba(0,100,255,0.5)" },
  peg_warp_3: { main: "#cc0088", hi: "#ff44cc", dark: "#660044", glow: "rgba(255,0,180,0.5)" },
};

// ── Decor skin color overrides ────────────────────────────────────────────────

const DECOR_SKIN_COLORS: Record<string, string> = {
  decor_bumper_1: "#3355dd",
  decor_bumper_2: "#cc1133",
  decor_bumper_3: "#cc8800",

  decor_plank_1: "#aa7733",
  decor_plank_2: "#778899",
  decor_plank_3: "#666677",

  decor_arc_1: "#5544cc",
  decor_arc_2: "#667788",
  decor_arc_3: "#cc0088",

  decor_spike_1: "#cc3355",
  decor_spike_2: "#3388cc",
  decor_spike_3: "#cc8800",
};

// ── Default skin ids (first option = "Classique") ────────────────────────────

const DEFAULT_PEG_SKINS: Record<string, string> = {
  normal: "peg_normal_1",
  orange: "peg_orange_1",
  green:  "peg_green_1",
  boss:   "peg_boss_1",
  bomb:   "peg_bomb_1",
  armor:  "peg_armor_1",
  warp:   "peg_warp_1",
};

const DEFAULT_DECOR_SKINS: Record<string, string> = {
  bumper: "decor_bumper_1",
  plank:  "decor_plank_1",
  arc:    "decor_arc_1",
  spike:  "decor_spike_1",
};

// ── Runtime readers ────────────────────────────────────────────────────────────

function readStoredPegSkins(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("peagle_active_peg_skins") ?? "{}") as Record<string, string>; }
  catch { return {}; }
}

function readStoredDecorSkins(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("peagle_active_decor_skins") ?? "{}") as Record<string, string>; }
  catch { return {}; }
}

function getActivePegSkinColors(pegType: string): PegSkinColors | undefined {
  const stored = readStoredPegSkins();
  const skinId = stored[pegType] ?? DEFAULT_PEG_SKINS[pegType];
  return skinId ? PEG_SKIN_COLORS[skinId] : undefined;
}

function getActiveDecorSkinColor(decorKind: string): string | undefined {
  const stored = readStoredDecorSkins();
  const skinId = stored[decorKind] ?? DEFAULT_DECOR_SKINS[decorKind];
  return skinId ? DECOR_SKIN_COLORS[skinId] : undefined;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns a copy of the given PegTheme with all skin color overrides applied.
 * Call once per frame before passing the theme to drawPegs.
 */
export function applyPegSkinOverrides(base: PegTheme): PegTheme {
  const t = { ...base };

  const normal = getActivePegSkinColors("normal");
  if (normal) { t.normal = normal.main; t.normalHi = normal.hi; t.normalDark = normal.dark; }

  const orange = getActivePegSkinColors("orange");
  if (orange) {
    t.orange = orange.main; t.orangeHi = orange.hi; t.orangeDark = orange.dark;
    // fever state: brighten main color
    t.orangeFever = orange.glow ? orange.main : base.orangeFever;
    t.orangeGlow  = orange.glow ?? base.orangeGlow;
  }

  const green = getActivePegSkinColors("green");
  if (green) { t.green = green.main; t.greenHi = green.hi; t.greenDark = green.dark; }

  const boss = getActivePegSkinColors("boss");
  if (boss) { t.boss = boss.main; t.bossHi = boss.hi; t.bossDark = boss.dark; }

  const bomb = getActivePegSkinColors("bomb");
  if (bomb) { t.bomb = bomb.main; t.bombHi = bomb.hi; t.bombDark = bomb.dark; t.bombHit = bomb.dark; }

  const armor = getActivePegSkinColors("armor");
  if (armor) { t.armor = armor.main; t.armorHi = armor.hi; t.armorDark = armor.dark; }

  const warp = getActivePegSkinColors("warp");
  if (warp) { t.warp = warp.main; t.warpHi = warp.hi; t.warpDark = warp.dark; t.warpHit = warp.dark; }

  return t;
}

/**
 * Returns the skin color override for a decor kind, or the base color if no
 * skin is active.
 */
export function getDecorColor(kind: string, baseColor: string): string {
  return getActiveDecorSkinColor(kind) ?? baseColor;
}
