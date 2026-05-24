// Win98 palette — used for UI chrome
export const FACE   = "#c0c0c0";
export const HI     = "#ffffff";
export const SHD    = "#808080";
export const DARK   = "#404040";
export const TEAL   = "#008080";
export const NAVY   = "#000080";
export const BLUE_T = "#1084d0";

// Peggle canvas theme — single source of truth for all canvas colors.
// Changing these propagates to pegs, particles, effects, and flash.
export const PEGGLE_THEME = {
  peg: {
    normal: FACE,
    orangeBase: NAVY,
    orangeMid: BLUE_T,
    orangeFever: "#0099ee",
    orangeGlow: "#00ccff",
    green: "#44aa22",
    bomb: "#cc2200",
    warp: "#8800dd",
    boss: "#cc8800",
  },
  popRing: {
    normal: SHD,
    orange: BLUE_T,
    bomb: "#ff6600",
    warp: "#cc88ff",
    boss: "#ffd700",
    green: "#44ff88",
    armor: SHD,
  },
  particles: {
    orange: ["#4488ff", "#88bbff", "#0044cc", "#ffffff", "#000080"] as readonly string[],
    normal: ["#c0c0c0", "#e0e0e0", "#808080", "#ffffff", "#606060"] as readonly string[],
    bomb:   ["#ff6600", "#ffcc00", "#ff2200", "#ffeeaa", "#ffffff"] as readonly string[],
  },
  flash: {
    normal: "#ffffff",
    fever: "#0000cc",
  },
} as const;
