// ─── Peagle 98 — Pixel Art Coloré palette ─────────────────────────────────────
// Couleurs canvas uniquement. La UI React utilise styles.ts / peagle.css.

export const FACE   = "#0a0a1e";
export const HI     = "#5a5aaa";
export const SHD    = "#04040c";
export const DARK   = "#000006";
export const TEAL   = "#080818";
export const NAVY   = "#ff6b35";
export const BLUE_T = "#ff9f68";

export const PEAGLE_THEME = {
  peg: {
    normal:       "#2233aa",   // bleu cobalt pixel
    normalHi:     "#4455ff",   // reflet peg normal
    normalDark:   "#0011660",  // ombre peg normal
    orangeBase:   "#ff5500",   // orange foncé
    orangeMid:    "#ffaa00",   // orange chaud
    orangeHi:     "#ffdd44",   // reflet orange
    orangeFever:  "#ff00cc",   // fever — vire au rose électrique
    orangeGlow:   "#ff88ee",   // glow fever rose
    green:        "#00ff44",   // vert pixel néon
    greenHi:      "#aaffcc",   // reflet vert
    bomb:         "#ff1133",   // rouge vif
    bombHi:       "#ff8899",   // reflet bombe
    warp:         "#cc00ff",   // violet pur
    warpHi:       "#ee88ff",   // reflet warp
    boss:         "#ffcc00",   // doré
    bossHi:       "#ffff88",   // reflet boss
  },
  popRing: {
    normal: "#4455ff",
    orange: "#ffaa00",
    bomb:   "#ff1133",
    warp:   "#cc00ff",
    boss:   "#ffcc00",
    green:  "#00ff44",
    armor:  "#aaaacc",
  },
  particles: {
    orange: ["#ff5500", "#ffaa00", "#ffdd44", "#ffffff", "#ff2200"] as readonly string[],
    normal: ["#2233aa", "#4455ff", "#0011aa", "#aaaaff", "#1122cc"] as readonly string[],
    bomb:   ["#ff1133", "#ff8800", "#ffcc00", "#ffffff", "#cc0022"] as readonly string[],
  },
  flash: {
    normal: "#4455ff",
    fever:  "#ff00cc",
  },
} as const;
