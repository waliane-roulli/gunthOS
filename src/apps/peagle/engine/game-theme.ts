// ─── Peagle 98 — Game theme system ───────────────────────────────────────────
// Defines the full visual contract of the renderer.
// Every color that appears on the game canvas comes from a GameTheme instance.

import type { PegType } from "./types";

// ── Sub-interfaces ────────────────────────────────────────────────────────────

export interface PegTheme {
  // Normal
  normal: string; normalHi: string; normalDark: string;
  // Orange (2 states: normal + fever)
  orange: string; orangeHi: string; orangeDark: string;
  orangeFever: string; orangeGlow: string;
  // Green
  green: string; greenHi: string; greenDark: string;
  // Bomb — bombDark = bevel shadow edge; bombHit = fill when hit (darker)
  bomb: string; bombHi: string; bombDark: string; bombHit: string;
  // Warp — warpDark = bevel shadow edge; warpHit = fill when hit (darker)
  warp: string; warpHi: string; warpDark: string; warpHit: string;
  // Boss
  boss: string; bossHi: string; bossDark: string;
  // Armor
  armor: string; armorHi: string; armorDark: string;
  // Pop ring color per peg type (expansion flash on hit)
  popRing: Record<PegType, string>;
}

export interface BgTheme {
  // Sky: 12-band horizontal gradient, top → bottom (normal + fever)
  skyTop:      readonly [number, number, number];
  skyBot:      readonly [number, number, number];
  skyTopFever: readonly [number, number, number];
  skyBotFever: readonly [number, number, number];
  // Ground bands
  groundColor:       string;
  groundColorFever:  string;
  subGroundColor:    string;
  subGroundColorFever: string;
  // Ground mist: two depth layers (near @ groundY-8, far @ groundY-16)
  mistColor:          string;  // near layer, normal
  mistColorFever:     string;  // near layer, fever
  mistFarColor:       string;  // far layer, normal  (lower opacity)
  mistFarColorFever:  string;  // far layer, fever   (lower opacity)
  // Decorative elements
  hasTrees:     boolean;
  hasFireflies: boolean;
}

export interface GameTheme {
  id:          string;
  name:        string;
  description: string;
  /** CSS-based preview for Showroom cards */
  preview: {
    gradient: string; // CSS gradient for the card thumbnail
    accent:   string; // Highlight / primary peg color
  };
  peg:    PegTheme;
  bg:     BgTheme;
  flash:  { normal: string; fever: string };
}

// ── Preset themes ─────────────────────────────────────────────────────────────

export const THEME_FORET: GameTheme = {
  id: "foret",
  name: "Forêt",
  description: "Terrain par défaut. Pixels verts, ciel azur, lucioles.",
  preview: {
    gradient: "linear-gradient(to bottom, #3a6e8c 0%, #4eb038 100%)",
    accent:   "#ff5500",
  },
  peg: {
    normal:   "#2233aa", normalHi:   "#4455ff", normalDark: "#000d44",
    orange:   "#ff5500", orangeHi:   "#ffdd44", orangeDark: "#882200",
    orangeFever: "#ff00cc", orangeGlow: "#ff88ee",
    green:    "#009922", greenHi:    "#aaffcc", greenDark:  "#003311",
    bomb:     "#ff1133", bombHi:     "#ff8899", bombDark:   "#880011", bombHit: "#440000",
    warp:     "#6600cc", warpHi:     "#ee88ff", warpDark:   "#330066", warpHit: "#220033",
    boss:     "#cc8800", bossHi:     "#ffff88", bossDark:   "#664400",
    armor:    "#888899", armorHi:    "#dddde8", armorDark:  "#333340",
    popRing: {
      normal: "#4455ff", orange: "#ffaa00", bomb:  "#ff1133",
      warp:   "#cc00ff", boss:   "#ffcc00", green: "#00ff44", armor: "#aaaacc",
    },
  },
  bg: {
    skyTop:      [58, 110, 140], skyBot:      [106, 170, 68],
    skyTopFever: [8,  4,   28],  skyBotFever: [18,  10,  52],
    groundColor:        "#3a8c28", groundColorFever:      "#0a0a28",
    subGroundColor:     "#1e6016", subGroundColorFever:   "#050514",
    mistColor:         "rgba(180,240,160,0.07)",
    mistColorFever:    "rgba(100,80,200,0.06)",
    mistFarColor:      "rgba(180,240,160,0.04)",
    mistFarColorFever: "rgba(80,60,180,0.04)",
    hasTrees: true, hasFireflies: true,
  },
  flash: { normal: "#4455ff", fever: "#ff00cc" },
};

export const THEME_ABIME: GameTheme = {
  id: "abime",
  name: "Abîme",
  description: "Espace infini. Néon pur, zéro végétation.",
  preview: {
    gradient: "linear-gradient(to bottom, #020008 0%, #080018 100%)",
    accent:   "#4488ff",
  },
  peg: {
    normal:   "#1144cc", normalHi:   "#4488ff", normalDark: "#00082a",
    orange:   "#ff7700", orangeHi:   "#ffcc44", orangeDark: "#883300",
    orangeFever: "#ff00ff", orangeGlow: "#ff88ff",
    green:    "#00ffaa", greenHi:    "#aaffee", greenDark:  "#004433",
    bomb:     "#ff2255", bombHi:     "#ff88aa", bombDark:   "#880022", bombHit: "#440011",
    warp:     "#9900ff", warpHi:     "#cc88ff", warpDark:   "#440077", warpHit: "#220044",
    boss:     "#ffee00", bossHi:     "#ffffaa", bossDark:   "#776600",
    armor:    "#667788", armorHi:    "#aabbcc", armorDark:  "#223344",
    popRing: {
      normal: "#4488ff", orange: "#ffaa00", bomb:  "#ff2255",
      warp:   "#9900ff", boss:   "#ffee00", green: "#00ffaa", armor: "#aabbcc",
    },
  },
  bg: {
    skyTop:      [2,  0,  10], skyBot:      [6,  0,  18],
    skyTopFever: [6,  0,  18], skyBotFever: [12, 4,  36],
    groundColor:        "#04000c", groundColorFever:      "#080018",
    subGroundColor:     "#020008", subGroundColorFever:   "#04000e",
    mistColor:         "rgba(80,0,180,0.08)",
    mistColorFever:    "rgba(180,0,255,0.10)",
    mistFarColor:      "rgba(60,0,150,0.05)",
    mistFarColorFever: "rgba(140,0,200,0.07)",
    hasTrees: false, hasFireflies: false,
  },
  flash: { normal: "#4488ff", fever: "#ff00ff" },
};

export const THEME_ENFER: GameTheme = {
  id: "enfer",
  name: "Enfer",
  description: "Ciel en feu, lave incandescente. Atmosphère volcanique.",
  preview: {
    gradient: "linear-gradient(to bottom, #2a0800 0%, #6a1800 100%)",
    accent:   "#ff4400",
  },
  peg: {
    normal:   "#882200", normalHi:   "#dd4400", normalDark: "#330800",
    orange:   "#ff8800", orangeHi:   "#ffcc00", orangeDark: "#884400",
    orangeFever: "#ff0000", orangeGlow: "#ff6600",
    green:    "#aaff00", greenHi:    "#eeff88", greenDark:  "#445500",
    bomb:     "#cc0000", bombHi:     "#ff4444", bombDark:   "#440000", bombHit: "#220000",
    warp:     "#ff00aa", warpHi:     "#ff88cc", warpDark:   "#660044", warpHit: "#330022",
    boss:     "#ffaa00", bossHi:     "#ffee88", bossDark:   "#664400",
    armor:    "#775544", armorHi:    "#aa8866", armorDark:  "#332211",
    popRing: {
      normal: "#dd4400", orange: "#ffcc00", bomb:  "#cc0000",
      warp:   "#ff00aa", boss:   "#ffaa00", green: "#aaff00", armor: "#aa8866",
    },
  },
  bg: {
    skyTop:      [38, 6,  2], skyBot:      [74,  18, 4],
    skyTopFever: [60, 4,  2], skyBotFever: [100, 10, 4],
    groundColor:        "#3d1208", groundColorFever:      "#220600",
    subGroundColor:     "#1a0602", subGroundColorFever:   "#0e0200",
    mistColor:         "rgba(200,60,0,0.08)",
    mistColorFever:    "rgba(255,40,0,0.12)",
    mistFarColor:      "rgba(180,40,0,0.05)",
    mistFarColorFever: "rgba(220,20,0,0.08)",
    hasTrees: false, hasFireflies: false,
  },
  flash: { normal: "#ff4400", fever: "#ff0000" },
};

export const THEME_GLACE: GameTheme = {
  id: "glace",
  name: "Glace",
  description: "Toundra cristalline. Bleus glacés, blanc immaculé.",
  preview: {
    gradient: "linear-gradient(to bottom, #8ab8d8 0%, #c8e8f0 100%)",
    accent:   "#44ccff",
  },
  peg: {
    normal:   "#224488", normalHi:   "#88aaff", normalDark: "#001133",
    orange:   "#ee6622", orangeHi:   "#ffcc88", orangeDark: "#883311",
    orangeFever: "#00ccff", orangeGlow: "#88eeff",
    green:    "#00ddcc", greenHi:    "#88ffee", greenDark:  "#004433",
    bomb:     "#2244aa", bombHi:     "#88aaff", bombDark:   "#001144", bombHit: "#000822",
    warp:     "#00eeff", warpHi:     "#aaffff", warpDark:   "#006677", warpHit: "#003344",
    boss:     "#ddeeff", bossHi:     "#ffffff", bossDark:   "#8899aa",
    armor:    "#aabbc8", armorHi:    "#ddeeff", armorDark:  "#445566",
    popRing: {
      normal: "#88aaff", orange: "#ffcc88", bomb:  "#2244aa",
      warp:   "#00eeff", boss:   "#ddeeff", green: "#00ddcc", armor: "#ddeeff",
    },
  },
  bg: {
    skyTop:      [140, 180, 210], skyBot:      [200, 225, 240],
    skyTopFever: [60,  100, 160], skyBotFever: [100, 150, 200],
    groundColor:        "#b0d8ee", groundColorFever:      "#5077aa",
    subGroundColor:     "#80b8d8", subGroundColorFever:   "#304466",
    mistColor:         "rgba(200,235,255,0.12)",
    mistColorFever:    "rgba(100,150,220,0.12)",
    mistFarColor:      "rgba(180,220,255,0.08)",
    mistFarColorFever: "rgba(80,120,200,0.08)",
    hasTrees: false, hasFireflies: false,
  },
  flash: { normal: "#44ccff", fever: "#00eeff" },
};

// ── Registry ──────────────────────────────────────────────────────────────────

export const GAME_THEMES: readonly GameTheme[] = [
  THEME_FORET,
  THEME_ABIME,
  THEME_ENFER,
  THEME_GLACE,
];

export const DEFAULT_THEME = THEME_FORET;

export function resolveTheme(id?: string): GameTheme {
  return GAME_THEMES.find(t => t.id === id) ?? DEFAULT_THEME;
}
