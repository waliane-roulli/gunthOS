import { THEMES, DEFAULT_THEME_ID, type ThemeId } from "@/lib/themes";
import { CURSORS, DEFAULT_CURSOR_ID, type CursorId } from "@/lib/cursors";
import { WALLPAPERS, DEFAULT_WALLPAPER_ID, type WallpaperId } from "@/lib/wallpapers";

export type Density = "compact" | "normal" | "large";

export interface AppSettings {
  themeId: ThemeId;
  soundEnabled: boolean;
  ambientVolume: number; // 0–1, volume du bruit de fond machine
  animationsEnabled: boolean;
  density: Density;
  scanlinesEnabled: boolean;
  cursorId: CursorId;
  wallpaperId: WallpaperId;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeId: DEFAULT_THEME_ID,
  soundEnabled: true,
  ambientVolume: 0.5,
  animationsEnabled: true,
  density: "normal",
  scanlinesEnabled: true,
  cursorId: DEFAULT_CURSOR_ID,
  wallpaperId: DEFAULT_WALLPAPER_ID,
};

const STORAGE_KEY = "gunth-settings";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateFromLegacy();
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      themeId:
        parsed.themeId && THEMES.some((t) => t.id === parsed.themeId)
          ? parsed.themeId
          : DEFAULT_SETTINGS.themeId,
      soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
      ambientVolume: typeof parsed.ambientVolume === "number"
        ? Math.max(0, Math.min(1, parsed.ambientVolume))
        : DEFAULT_SETTINGS.ambientVolume,
      animationsEnabled: parsed.animationsEnabled ?? DEFAULT_SETTINGS.animationsEnabled,
      density: (["compact", "normal", "large"] as Density[]).includes(parsed.density as Density)
        ? (parsed.density as Density)
        : DEFAULT_SETTINGS.density,
      scanlinesEnabled: parsed.scanlinesEnabled ?? DEFAULT_SETTINGS.scanlinesEnabled,
      cursorId: CURSORS.some((c) => c.id === parsed.cursorId)
        ? (parsed.cursorId as CursorId)
        : DEFAULT_SETTINGS.cursorId,
      wallpaperId: WALLPAPERS.some((w) => w.id === parsed.wallpaperId)
        ? (parsed.wallpaperId as WallpaperId)
        : DEFAULT_SETTINGS.wallpaperId,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function migrateFromLegacy(): AppSettings {
  const legacyTheme = localStorage.getItem("site-theme") as ThemeId | null;
  if (legacyTheme && THEMES.some((t) => t.id === legacyTheme)) {
    localStorage.removeItem("site-theme");
    return { ...DEFAULT_SETTINGS, themeId: legacyTheme };
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const DENSITY_CSS: Record<Density, Record<string, string>> = {
  compact: {
    "--t-density-gap": "0.25rem",
    "--t-density-pad": "0.5rem",
    "--t-density-text": "0.8rem",
  },
  normal: {
    "--t-density-gap": "0.5rem",
    "--t-density-pad": "0.75rem",
    "--t-density-text": "1rem",
  },
  large: {
    "--t-density-gap": "0.75rem",
    "--t-density-pad": "1rem",
    "--t-density-text": "1.1rem",
  },
};
