export type FontPairId = "classic" | "pixel" | "orbitron" | "righteous" | "terminal" | "retrowave" | "serif-retro" | "chunky";

export interface FontPair {
  id: FontPairId;
  name: string;
  emoji: string;
  description: string;
  displayVar: string;
  bodyVar: string;
  /** Sample text rendered in display font for the preview */
  sample: string;
  /**
   * Optical size scale applied to ALL --t-text-* variables.
   * Press Start 2P is visually huge at 1rem → needs 0.55.
   * VT323 is visually small at 1rem → needs 1.0.
   * Used to inject --t-font-scale on :root so every component adjusts automatically.
   */
  scale: number;
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "🖥️",
    description: "VT323 + Fredoka",
    displayVar: "var(--font-vt323), monospace",
    bodyVar: "var(--font-fredoka), sans-serif",
    sample: "GunthOS",
    scale: 1.0,
  },
  {
    id: "pixel",
    name: "Pixel",
    emoji: "👾",
    description: "Press Start 2P",
    displayVar: "var(--font-press-start), monospace",
    bodyVar: "var(--font-press-start), monospace",
    sample: "8-BIT",
    scale: 0.6,
  },
  {
    id: "orbitron",
    name: "Orbitron",
    emoji: "🚀",
    description: "Orbitron + Exo 2",
    displayVar: "var(--font-orbitron), sans-serif",
    bodyVar: "var(--font-exo2), sans-serif",
    sample: "SCI-FI",
    scale: 0.85,
  },
  {
    id: "righteous",
    name: "Righteous",
    emoji: "✌️",
    description: "Righteous + Nunito",
    displayVar: "var(--font-righteous), cursive",
    bodyVar: "var(--font-nunito), sans-serif",
    sample: "Groovy",
    scale: 0.9,
  },
  {
    id: "terminal",
    name: "Terminal",
    emoji: "💻",
    description: "Share Tech Mono + Ubuntu Mono",
    displayVar: "var(--font-share-tech-mono), monospace",
    bodyVar: "var(--font-ubuntu-mono), monospace",
    sample: "$ root_",
    scale: 0.95,
  },
  {
    id: "retrowave",
    name: "Retrowave",
    emoji: "🌆",
    description: "Audiowide + Rajdhani",
    displayVar: "var(--font-audiowide), sans-serif",
    bodyVar: "var(--font-rajdhani), sans-serif",
    sample: "SYNTH",
    scale: 0.8,
  },
  {
    id: "serif-retro",
    name: "Serif Retro",
    emoji: "📰",
    description: "Playfair Display + Lora",
    displayVar: "var(--font-playfair-display), serif",
    bodyVar: "var(--font-lora), serif",
    sample: "Gazette",
    scale: 0.95,
  },
  {
    id: "chunky",
    name: "Chunky",
    emoji: "🧱",
    description: "Bungee + IBM Plex Mono",
    displayVar: "var(--font-bungee), cursive",
    bodyVar: "var(--font-ibm-plex-mono), monospace",
    sample: "BOLD",
    scale: 0.85,
  },
];

export const FONT_PAIR_MAP = new Map(FONT_PAIRS.map((p) => [p.id, p]));
export const DEFAULT_FONT_PAIR_ID: FontPairId = "classic";
