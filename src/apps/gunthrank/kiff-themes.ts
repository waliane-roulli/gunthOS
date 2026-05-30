export interface KiffTheme {
  id: string;
  name: string;
  emoji: string;
  /** How platform color renders on grid cards */
  cardPlatform: "border" | "fill" | "none";
  /** How platform color renders on list rows */
  rowPlatform: "bar" | "left-border" | "none";
  preview: {
    bg: string;
    titlebarFrom: string;
    titlebarTo: string;
    titlebarText: string;
    accent: string;
    text: string;
  };
  vars: Record<string, string>;
}

export const KIFF_THEMES: KiffTheme[] = [
  // ── Mode OS ──────────────────────────────────────────────
  {
    id: "os", name: "Mode OS", emoji: "🖥️",
    cardPlatform: "border", rowPlatform: "bar",
    preview: { bg: "#c0c0c0", titlebarFrom: "#000080", titlebarTo: "#1084d0", titlebarText: "#ffffff", accent: "#000080", text: "#000000" },
    vars: {},
  },

  // ── Mode 2.0 ────────────────────────────────────────────
  {
    id: "mode-20", name: "Mode 2.0", emoji: "✨",
    cardPlatform: "border", rowPlatform: "bar",
    preview: { bg: "#fafafa", titlebarFrom: "#87ceeb", titlebarTo: "#5bbce2", titlebarText: "#ffffff", accent: "#87ceeb", text: "#0f172a" },
    vars: {
      "--t-bg": "#fafafa", "--t-bg-light": "#ffffff", "--t-bg-dark": "#f5f5f5", "--t-bg-darker": "#eeeeee",
      "--t-border-light": "transparent", "--t-border-dark": "transparent",
      "--t-titlebar-from": "#87ceeb", "--t-titlebar-to": "#5bbce2", "--t-titlebar-text": "#ffffff",
      "--t-accent": "#87ceeb", "--t-accent-hover": "#b0e0f0",
      "--t-text": "#0f172a", "--t-text-muted": "#64748b", "--t-text-subtle": "#94a3b8",
      "--t-marquee-bg": "#f5f5f5", "--t-marquee-text": "#5bbce2",
      "--t-card-bg": "#ffffff", "--t-card-hover": "#fafafa", "--t-card-hover-border": "#87ceeb",
      "--t-page-from": "#ffffff", "--t-page-to": "#fafafa",
      "--t-badge-bg": "#87ceeb", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#fafafa", "--t-inset-to": "#f5f5f5",
      "--t-app-bg": "#ffffff", "--t-app-text": "#0f172a", "--t-app-text-muted": "#64748b",
      "--t-progress-from": "#87ceeb", "--t-progress-to": "#5bbce2",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"SF Mono\", \"Cascadia Code\", monospace",
      "--t-window-radius": "12px", "--t-titlebar-radius": "12px",
      "--t-window-shadow": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
      "--t-dialog-shadow": "0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      "--t-taskbar-bg": "rgba(255,255,255,0.7)", "--t-taskbar-blur": "blur(20px)",
      "--t-glass-bg": "rgba(255,255,255,0.8)", "--t-glass-blur": "blur(20px)", "--t-glass-border": "transparent",
      "--t-scanlines": "0.00",
      "--t-start-btn-bg": "#87ceeb", "--t-start-btn-text": "#0f172a",
    },
  },

  // ── Ogus ─────────────────────────────────────────────────
  {
    id: "ogus", name: "Ogus", emoji: "💖",
    cardPlatform: "fill", rowPlatform: "left-border",
    preview: { bg: "#fff0f3", titlebarFrom: "#ff4088", titlebarTo: "#d6336c", titlebarText: "#ffffff", accent: "#ff4088", text: "#4a1530" },
    vars: {
      "--t-bg": "#fff0f3", "--t-bg-light": "#ffffff", "--t-bg-dark": "#ffe0e8", "--t-bg-darker": "#ffd0da",
      "--t-border-light": "transparent", "--t-border-dark": "transparent",
      "--t-titlebar-from": "#ff4088", "--t-titlebar-to": "#d6336c", "--t-titlebar-text": "#ffffff",
      "--t-accent": "#ff4088", "--t-accent-hover": "#ff6ba3",
      "--t-text": "#4a1530", "--t-text-muted": "#8a5070", "--t-text-subtle": "#c090a8",
      "--t-marquee-bg": "#ffe0e8", "--t-marquee-text": "#ff4088",
      "--t-card-bg": "#ffffff", "--t-card-hover": "#fff5f7", "--t-card-hover-border": "#ff4088",
      "--t-page-from": "#ffffff", "--t-page-to": "#fff0f3",
      "--t-badge-bg": "#ff4088", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#fff0f3", "--t-inset-to": "#ffe0e8",
      "--t-app-bg": "#ffffff", "--t-app-text": "#4a1530", "--t-app-text-muted": "#8a5070",
      "--t-progress-from": "#ffb8c8", "--t-progress-to": "#ff8da8",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"SF Mono\", \"Cascadia Code\", monospace",
      "--t-window-radius": "16px", "--t-titlebar-radius": "16px",
      "--t-window-shadow": "0 1px 3px rgba(255,64,136,0.05), 0 1px 2px rgba(255,64,136,0.03)",
      "--t-dialog-shadow": "0 4px 20px rgba(255,64,136,0.08), 0 0 0 1px rgba(255,64,136,0.06)",
      "--t-taskbar-bg": "rgba(255,240,243,0.7)", "--t-taskbar-blur": "blur(20px)",
      "--t-glass-bg": "rgba(255,240,243,0.8)", "--t-glass-blur": "blur(20px)", "--t-glass-border": "transparent",
      "--t-scanlines": "0.00",
      "--t-start-btn-bg": "linear-gradient(135deg, #ffb8c8, #ff8da8)", "--t-start-btn-text": "#ffffff",
    },
  },

  // ── Gameboy ──────────────────────────────────────────────
  {
    id: "gameboy", name: "Gameboy", emoji: "👾",
    cardPlatform: "fill", rowPlatform: "left-border",
    preview: { bg: "#8bac0f", titlebarFrom: "#306230", titlebarTo: "#0f380f", titlebarText: "#9bbc0f", accent: "#0f380f", text: "#0f380f" },
    vars: {
      "--t-bg": "#8bac0f", "--t-bg-light": "#9bbc0f", "--t-bg-dark": "#306230", "--t-bg-darker": "#0f380f",
      "--t-border-light": "#9bbc0f", "--t-border-dark": "#0f380f",
      "--t-titlebar-from": "#306230", "--t-titlebar-to": "#0f380f", "--t-titlebar-text": "#9bbc0f",
      "--t-accent": "#0f380f", "--t-accent-hover": "#1a4a1a",
      "--t-text": "#0f380f", "--t-text-muted": "#306230", "--t-text-subtle": "#4a7a30",
      "--t-marquee-bg": "#0f380f", "--t-marquee-text": "#9bbc0f",
      "--t-card-bg": "#9bbc0f", "--t-card-hover": "#a8cc1a", "--t-card-hover-border": "#0f380f",
      "--t-page-from": "#8bac0f", "--t-page-to": "#78a010",
      "--t-badge-bg": "#0f380f", "--t-badge-text": "#9bbc0f",
      "--t-inset-from": "#7a9c0d", "--t-inset-to": "#68900b",
      "--t-app-bg": "#8bac0f", "--t-app-text": "#0f380f", "--t-app-text-muted": "#306230",
      "--t-progress-from": "#306230", "--t-progress-to": "#0f380f",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 #0f380f", "--t-dialog-shadow": "6px 6px 0 #0f380f",
      "--t-taskbar-bg": "#306230", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#8bac0f", "--t-glass-blur": "none", "--t-glass-border": "#306230",
      "--t-scanlines": "0.12",
      "--t-start-btn-bg": "linear-gradient(to bottom, #306230, #0f380f)", "--t-start-btn-text": "#9bbc0f",
    },
  },

  // ── NES ──────────────────────────────────────────────────
  {
    id: "nes", name: "NES", emoji: "🎮",
    cardPlatform: "border", rowPlatform: "bar",
    preview: { bg: "#cccccc", titlebarFrom: "#444444", titlebarTo: "#222222", titlebarText: "#ff4444", accent: "#cc0000", text: "#111111" },
    vars: {
      "--t-bg": "#cccccc", "--t-bg-light": "#e0e0e0", "--t-bg-dark": "#aaaaaa", "--t-bg-darker": "#888888",
      "--t-border-light": "#e0e0e0", "--t-border-dark": "#888888",
      "--t-titlebar-from": "#444444", "--t-titlebar-to": "#222222", "--t-titlebar-text": "#ff4444",
      "--t-accent": "#cc0000", "--t-accent-hover": "#ee2222",
      "--t-text": "#111111", "--t-text-muted": "#555555", "--t-text-subtle": "#888888",
      "--t-marquee-bg": "#111111", "--t-marquee-text": "#ff4444",
      "--t-card-bg": "#dddddd", "--t-card-hover": "#eeeeee", "--t-card-hover-border": "#cc0000",
      "--t-page-from": "#cccccc", "--t-page-to": "#bbbbbb",
      "--t-badge-bg": "#cc0000", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#c0c0c0", "--t-inset-to": "#aaaaaa",
      "--t-app-bg": "#cccccc", "--t-app-text": "#111111", "--t-app-text-muted": "#555555",
      "--t-progress-from": "#444444", "--t-progress-to": "#222222",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(0,0,0,0.5)", "--t-dialog-shadow": "6px 6px 0 rgba(0,0,0,0.5)",
      "--t-taskbar-bg": "#aaaaaa", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#cccccc", "--t-glass-blur": "none", "--t-glass-border": "#888888",
      "--t-scanlines": "0.06",
      "--t-start-btn-bg": "linear-gradient(to bottom, #444444, #222222)", "--t-start-btn-text": "#ff4444",
    },
  },

  // ── SNES ─────────────────────────────────────────────────
  {
    id: "snes", name: "Super Nintendo", emoji: "🌈",
    cardPlatform: "border", rowPlatform: "bar",
    preview: { bg: "#d8d8d8", titlebarFrom: "#5a5a6e", titlebarTo: "#3a3a4e", titlebarText: "#8866cc", accent: "#8866cc", text: "#1a1a2e" },
    vars: {
      "--t-bg": "#d8d8d8", "--t-bg-light": "#e8e8e8", "--t-bg-dark": "#b8b8c8", "--t-bg-darker": "#9898a8",
      "--t-border-light": "#e8e8e8", "--t-border-dark": "#9898a8",
      "--t-titlebar-from": "#5a5a6e", "--t-titlebar-to": "#3a3a4e", "--t-titlebar-text": "#c8a8ff",
      "--t-accent": "#8866cc", "--t-accent-hover": "#9a7add",
      "--t-text": "#1a1a2e", "--t-text-muted": "#555570", "--t-text-subtle": "#8888a0",
      "--t-marquee-bg": "#1a1a2e", "--t-marquee-text": "#c8a8ff",
      "--t-card-bg": "#e8e8e8", "--t-card-hover": "#f0f0f8", "--t-card-hover-border": "#8866cc",
      "--t-page-from": "#d8d8d8", "--t-page-to": "#c8c8d8",
      "--t-badge-bg": "#8866cc", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#d0d0d8", "--t-inset-to": "#c0c0c8",
      "--t-app-bg": "#d8d8d8", "--t-app-text": "#1a1a2e", "--t-app-text-muted": "#555570",
      "--t-progress-from": "#5a5a6e", "--t-progress-to": "#3a3a4e",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(90,90,110,0.4)", "--t-dialog-shadow": "6px 6px 0 rgba(90,90,110,0.5)",
      "--t-taskbar-bg": "#c8c8d8", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#d8d8d8", "--t-glass-blur": "none", "--t-glass-border": "#9898a8",
      "--t-scanlines": "0.04",
      "--t-start-btn-bg": "linear-gradient(to bottom, #5a5a6e, #3a3a4e)", "--t-start-btn-text": "#c8a8ff",
    },
  },

  // ── Gris ─────────────────────────────────────────────────
  {
    id: "gris", name: "Gris", emoji: "🎨",
    cardPlatform: "none", rowPlatform: "none",
    preview: { bg: "#dce8f0", titlebarFrom: "#7b9fbf", titlebarTo: "#4a6d8c", titlebarText: "#ffffff", accent: "#e8a0b0", text: "#2a3a4a" },
    vars: {
      "--t-bg": "#dce8f0", "--t-bg-light": "#eef4f8", "--t-bg-dark": "#c0d4e4", "--t-bg-darker": "#a0b8cc",
      "--t-border-light": "#7b9fbf", "--t-border-dark": "#3a5068",
      "--t-titlebar-from": "#7b9fbf", "--t-titlebar-to": "#4a6d8c", "--t-titlebar-text": "#ffffff",
      "--t-accent": "#e8a0b0", "--t-accent-hover": "#f0c0cc",
      "--t-text": "#2a3a4a", "--t-text-muted": "#5a6a7a", "--t-text-subtle": "#8a9aaa",
      "--t-marquee-bg": "#2a3a4a", "--t-marquee-text": "#dce8f0",
      "--t-card-bg": "#eef4f8", "--t-card-hover": "#ffffff", "--t-card-hover-border": "#e8a0b0",
      "--t-page-from": "#dce8f0", "--t-page-to": "#c0d4e4",
      "--t-badge-bg": "#e8a0b0", "--t-badge-text": "#2a3a4a",
      "--t-inset-from": "#e0eaf2", "--t-inset-to": "#d0dce8",
      "--t-app-bg": "#dce8f0", "--t-app-text": "#2a3a4a", "--t-app-text-muted": "#5a6a7a",
      "--t-progress-from": "#7b9fbf", "--t-progress-to": "#4a6d8c",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(74,109,140,0.3)", "--t-dialog-shadow": "6px 6px 0 rgba(74,109,140,0.4)",
      "--t-taskbar-bg": "#c0d4e4", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#dce8f0", "--t-glass-blur": "none", "--t-glass-border": "#7b9fbf",
      "--t-scanlines": "0.00",
      "--t-start-btn-bg": "linear-gradient(to bottom, #7b9fbf, #4a6d8c)", "--t-start-btn-text": "#ffffff",
    },
  },

  // ── Celeste ──────────────────────────────────────────────
  {
    id: "celeste", name: "Celeste", emoji: "🏔️",
    cardPlatform: "fill", rowPlatform: "left-border",
    preview: { bg: "#1a1a4e", titlebarFrom: "#6a5acd", titlebarTo: "#2e2050", titlebarText: "#ffffff", accent: "#ff69b4", text: "#e8e8ff" },
    vars: {
      "--t-bg": "#1a1a4e", "--t-bg-light": "#2a2a6e", "--t-bg-dark": "#101038", "--t-bg-darker": "#0a0a28",
      "--t-border-light": "#6a5acd", "--t-border-dark": "#2e2050",
      "--t-titlebar-from": "#6a5acd", "--t-titlebar-to": "#2e2050", "--t-titlebar-text": "#ffffff",
      "--t-accent": "#ff69b4", "--t-accent-hover": "#ff8dc8",
      "--t-text": "#e8e8ff", "--t-text-muted": "#a0a0d0", "--t-text-subtle": "#606090",
      "--t-marquee-bg": "#0a0a28", "--t-marquee-text": "#ff69b4",
      "--t-card-bg": "#252560", "--t-card-hover": "#303078", "--t-card-hover-border": "#ff69b4",
      "--t-page-from": "#1e1e58", "--t-page-to": "#161648",
      "--t-badge-bg": "#ff69b4", "--t-badge-text": "#1a1a4e",
      "--t-inset-from": "#222258", "--t-inset-to": "#181840",
      "--t-app-bg": "#1a1a4e", "--t-app-text": "#e8e8ff", "--t-app-text-muted": "#a0a0d0",
      "--t-progress-from": "#6a5acd", "--t-progress-to": "#2e2050",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(106,90,205,0.4)", "--t-dialog-shadow": "6px 6px 0 rgba(106,90,205,0.5)",
      "--t-taskbar-bg": "#101038", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#1a1a4e", "--t-glass-blur": "none", "--t-glass-border": "#6a5acd",
      "--t-scanlines": "0.04",
      "--t-start-btn-bg": "linear-gradient(to bottom, #6a5acd, #2e2050)", "--t-start-btn-text": "#ffffff",
    },
  },

  // ── Cuphead ──────────────────────────────────────────────
  {
    id: "cuphead", name: "Cuphead", emoji: "🎷",
    cardPlatform: "none", rowPlatform: "bar",
    preview: { bg: "#f5e6c8", titlebarFrom: "#8b4513", titlebarTo: "#5c2d0a", titlebarText: "#f5e6c8", accent: "#cc0000", text: "#2a1506" },
    vars: {
      "--t-bg": "#f5e6c8", "--t-bg-light": "#fff8ee", "--t-bg-dark": "#e0c898", "--t-bg-darker": "#c8a878",
      "--t-border-light": "#8b4513", "--t-border-dark": "#3a1a00",
      "--t-titlebar-from": "#8b4513", "--t-titlebar-to": "#5c2d0a", "--t-titlebar-text": "#f5e6c8",
      "--t-accent": "#cc0000", "--t-accent-hover": "#ff2222",
      "--t-text": "#2a1506", "--t-text-muted": "#5c3a1a", "--t-text-subtle": "#8a6a4a",
      "--t-marquee-bg": "#2a1506", "--t-marquee-text": "#f5e6c8",
      "--t-card-bg": "#fff8ee", "--t-card-hover": "#ffffff", "--t-card-hover-border": "#cc0000",
      "--t-page-from": "#f5e6c8", "--t-page-to": "#e0c898",
      "--t-badge-bg": "#cc0000", "--t-badge-text": "#f5e6c8",
      "--t-inset-from": "#e8d8b0", "--t-inset-to": "#d8c098",
      "--t-app-bg": "#f5e6c8", "--t-app-text": "#2a1506", "--t-app-text-muted": "#5c3a1a",
      "--t-progress-from": "#8b4513", "--t-progress-to": "#5c2d0a",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(0,0,0,0.5)", "--t-dialog-shadow": "6px 6px 0 rgba(0,0,0,0.5)",
      "--t-taskbar-bg": "#e0c898", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#f5e6c8", "--t-glass-blur": "none", "--t-glass-border": "#8b4513",
      "--t-scanlines": "0.04",
      "--t-start-btn-bg": "linear-gradient(to bottom, #8b4513, #5c2d0a)", "--t-start-btn-text": "#f5e6c8",
    },
  },

  // ── Subnautica ───────────────────────────────────────────
  {
    id: "subnautica", name: "Subnautica", emoji: "🌊",
    cardPlatform: "fill", rowPlatform: "left-border",
    preview: { bg: "#001a20", titlebarFrom: "#00838f", titlebarTo: "#003540", titlebarText: "#ffffff", accent: "#ff6f00", text: "#80deea" },
    vars: {
      "--t-bg": "#001a20", "--t-bg-light": "#002a35", "--t-bg-dark": "#001015", "--t-bg-darker": "#00080a",
      "--t-border-light": "#00838f", "--t-border-dark": "#002530",
      "--t-titlebar-from": "#00838f", "--t-titlebar-to": "#003540", "--t-titlebar-text": "#ffffff",
      "--t-accent": "#ff6f00", "--t-accent-hover": "#ff8f30",
      "--t-text": "#80deea", "--t-text-muted": "#4d9aa8", "--t-text-subtle": "#1e5a68",
      "--t-marquee-bg": "#00080a", "--t-marquee-text": "#00e5ff",
      "--t-card-bg": "#002830", "--t-card-hover": "#003540", "--t-card-hover-border": "#ff6f00",
      "--t-page-from": "#001a20", "--t-page-to": "#001015",
      "--t-badge-bg": "#ff6f00", "--t-badge-text": "#001a20",
      "--t-inset-from": "#002028", "--t-inset-to": "#001418",
      "--t-app-bg": "#001a20", "--t-app-text": "#80deea", "--t-app-text-muted": "#4d9aa8",
      "--t-progress-from": "#00838f", "--t-progress-to": "#003540",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(0,131,143,0.4)", "--t-dialog-shadow": "6px 6px 0 rgba(0,131,143,0.5)",
      "--t-taskbar-bg": "#001015", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#001a20", "--t-glass-blur": "none", "--t-glass-border": "#00838f",
      "--t-scanlines": "0.04",
      "--t-start-btn-bg": "linear-gradient(to bottom, #00838f, #003540)", "--t-start-btn-text": "#ffffff",
    },
  },

  // ── Half-Life: Alyx ──────────────────────────────────────
  {
    id: "hl-alyx", name: "Half-Life: Alyx", emoji: "🦀",
    cardPlatform: "border", rowPlatform: "bar",
    preview: { bg: "#1a1e22", titlebarFrom: "#3a4c5d", titlebarTo: "#1a2835", titlebarText: "#e8ecef", accent: "#ff6600", text: "#d0d8e0" },
    vars: {
      "--t-bg": "#1a1e22", "--t-bg-light": "#252a30", "--t-bg-dark": "#101418", "--t-bg-darker": "#0a0c10",
      "--t-border-light": "#4a5c6d", "--t-border-dark": "#1a2835",
      "--t-titlebar-from": "#3a4c5d", "--t-titlebar-to": "#1a2835", "--t-titlebar-text": "#e8ecef",
      "--t-accent": "#ff6600", "--t-accent-hover": "#ff8833",
      "--t-text": "#d0d8e0", "--t-text-muted": "#8090a0", "--t-text-subtle": "#506070",
      "--t-marquee-bg": "#0a0c10", "--t-marquee-text": "#ff6600",
      "--t-card-bg": "#20262c", "--t-card-hover": "#283038", "--t-card-hover-border": "#ff6600",
      "--t-page-from": "#1a1e22", "--t-page-to": "#101418",
      "--t-badge-bg": "#ff6600", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#1e2428", "--t-inset-to": "#161a1e",
      "--t-app-bg": "#1a1e22", "--t-app-text": "#d0d8e0", "--t-app-text-muted": "#8090a0",
      "--t-progress-from": "#3a4c5d", "--t-progress-to": "#1a2835",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(0,0,0,0.6)", "--t-dialog-shadow": "6px 6px 0 rgba(0,0,0,0.6)",
      "--t-taskbar-bg": "#101418", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#1a1e22", "--t-glass-blur": "none", "--t-glass-border": "#3a4c5d",
      "--t-scanlines": "0.06",
      "--t-start-btn-bg": "linear-gradient(to bottom, #3a4c5d, #1a2835)", "--t-start-btn-text": "#e8ecef",
    },
  },

  // ── Hi-Fi Rush ───────────────────────────────────────────
  {
    id: "hi-fi-rush", name: "Hi-Fi Rush", emoji: "🎸",
    cardPlatform: "border", rowPlatform: "bar",
    preview: { bg: "#ffffff", titlebarFrom: "#ff1744", titlebarTo: "#b71c1c", titlebarText: "#ffffff", accent: "#2979ff", text: "#1a1a1a" },
    vars: {
      "--t-bg": "#ffffff", "--t-bg-light": "#ffffff", "--t-bg-dark": "#e0e0e0", "--t-bg-darker": "#c0c0c0",
      "--t-border-light": "#ff1744", "--t-border-dark": "#880000",
      "--t-titlebar-from": "#ff1744", "--t-titlebar-to": "#b71c1c", "--t-titlebar-text": "#ffffff",
      "--t-accent": "#2979ff", "--t-accent-hover": "#5a9fff",
      "--t-text": "#1a1a1a", "--t-text-muted": "#555555", "--t-text-subtle": "#888888",
      "--t-marquee-bg": "#1a1a1a", "--t-marquee-text": "#ff1744",
      "--t-card-bg": "#f5f5f5", "--t-card-hover": "#ffffff", "--t-card-hover-border": "#ff1744",
      "--t-page-from": "#ffffff", "--t-page-to": "#e0e0e0",
      "--t-badge-bg": "#ff1744", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#e8e8e8", "--t-inset-to": "#d0d0d0",
      "--t-app-bg": "#ffffff", "--t-app-text": "#1a1a1a", "--t-app-text-muted": "#555555",
      "--t-progress-from": "#ff1744", "--t-progress-to": "#b71c1c",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(0,0,0,0.4)", "--t-dialog-shadow": "6px 6px 0 rgba(0,0,0,0.4)",
      "--t-taskbar-bg": "#e0e0e0", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#ffffff", "--t-glass-blur": "none", "--t-glass-border": "#ff1744",
      "--t-scanlines": "0.00",
      "--t-start-btn-bg": "linear-gradient(to bottom, #ff1744, #b71c1c)", "--t-start-btn-text": "#ffffff",
    },
  },

  // ── Street Fighter II ────────────────────────────────────
  {
    id: "street-fighter-2", name: "Street Fighter II", emoji: "🥊",
    cardPlatform: "fill", rowPlatform: "left-border",
    preview: { bg: "#0a0a20", titlebarFrom: "#2244aa", titlebarTo: "#112266", titlebarText: "#ffcc00", accent: "#ee0044", text: "#ffffff" },
    vars: {
      "--t-bg": "#0a0a20", "--t-bg-light": "#181840", "--t-bg-dark": "#060615", "--t-bg-darker": "#03030c",
      "--t-border-light": "#2244aa", "--t-border-dark": "#0a1550",
      "--t-titlebar-from": "#2244aa", "--t-titlebar-to": "#112266", "--t-titlebar-text": "#ffcc00",
      "--t-accent": "#ee0044", "--t-accent-hover": "#ff2255",
      "--t-text": "#ffffff", "--t-text-muted": "#aabbee", "--t-text-subtle": "#5566aa",
      "--t-marquee-bg": "#03030c", "--t-marquee-text": "#ffcc00",
      "--t-card-bg": "#141438", "--t-card-hover": "#1c1c48", "--t-card-hover-border": "#ffcc00",
      "--t-page-from": "#0e0e28", "--t-page-to": "#08081c",
      "--t-badge-bg": "#ee0044", "--t-badge-text": "#ffffff",
      "--t-inset-from": "#101030", "--t-inset-to": "#0a0a24",
      "--t-app-bg": "#0a0a20", "--t-app-text": "#ffffff", "--t-app-text-muted": "#aabbee",
      "--t-progress-from": "#2244aa", "--t-progress-to": "#112266",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(0,0,0,0.7)", "--t-dialog-shadow": "6px 6px 0 rgba(0,0,0,0.7)",
      "--t-taskbar-bg": "#060615", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#0a0a20", "--t-glass-blur": "none", "--t-glass-border": "#2244aa",
      "--t-scanlines": "0.08",
      "--t-start-btn-bg": "linear-gradient(to bottom, #2244aa, #112266)", "--t-start-btn-text": "#ffcc00",
    },
  },

  // ── Cyberpunk 2077 ───────────────────────────────────────
  {
    id: "cyberpunk-2077", name: "Cyberpunk 2077", emoji: "🤖",
    cardPlatform: "fill", rowPlatform: "left-border",
    preview: { bg: "#0d0d0d", titlebarFrom: "#fcee0a", titlebarTo: "#c8a900", titlebarText: "#0d0d0d", accent: "#00f0ff", text: "#fcee0a" },
    vars: {
      "--t-bg": "#0d0d0d", "--t-bg-light": "#1a1a1a", "--t-bg-dark": "#050505", "--t-bg-darker": "#000000",
      "--t-border-light": "#fcee0a", "--t-border-dark": "#554400",
      "--t-titlebar-from": "#fcee0a", "--t-titlebar-to": "#c8a900", "--t-titlebar-text": "#0d0d0d",
      "--t-accent": "#00f0ff", "--t-accent-hover": "#66f5ff",
      "--t-text": "#e0e0e0", "--t-text-muted": "#909090", "--t-text-subtle": "#505050",
      "--t-marquee-bg": "#000000", "--t-marquee-text": "#fcee0a",
      "--t-card-bg": "#161616", "--t-card-hover": "#202020", "--t-card-hover-border": "#fcee0a",
      "--t-page-from": "#0d0d0d", "--t-page-to": "#080808",
      "--t-badge-bg": "#fcee0a", "--t-badge-text": "#0d0d0d",
      "--t-inset-from": "#1a1a1a", "--t-inset-to": "#0f0f0f",
      "--t-app-bg": "#0d0d0d", "--t-app-text": "#e0e0e0", "--t-app-text-muted": "#909090",
      "--t-progress-from": "#fcee0a", "--t-progress-to": "#c8a900",
      "--t-font-display": "var(--font-vt323)", "--t-font-body": "var(--font-fredoka)", "--t-font-mono": "\"Courier New\", monospace",
      "--t-window-radius": "0px", "--t-titlebar-radius": "0px",
      "--t-window-shadow": "4px 4px 0 rgba(252,238,10,0.5)", "--t-dialog-shadow": "6px 6px 0 rgba(252,238,10,0.6)",
      "--t-taskbar-bg": "#0d0d0d", "--t-taskbar-blur": "none",
      "--t-glass-bg": "#0d0d0d", "--t-glass-blur": "none", "--t-glass-border": "#fcee0a",
      "--t-scanlines": "0.08",
      "--t-start-btn-bg": "linear-gradient(to bottom, #fcee0a, #c8a900)", "--t-start-btn-text": "#0d0d0d",
    },
  },
];

export function getKiffTheme(id: string): KiffTheme {
  return KIFF_THEMES.find((t) => t.id === id) ?? KIFF_THEMES[0]!;
}
