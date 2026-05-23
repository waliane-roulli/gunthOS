import { THEMES, DEFAULT_THEME_ID, type ThemeId } from "@/lib/themes";
import { CURSORS, DEFAULT_CURSOR_ID, type CursorId } from "@/lib/cursors";
import { WALLPAPERS, DEFAULT_WALLPAPER_ID, type WallpaperId } from "@/lib/wallpapers";
import { FONT_PAIRS, DEFAULT_FONT_PAIR_ID, type FontPairId } from "@/lib/font-pairs";
import { SOUND_SCHEMES, DEFAULT_SOUND_SCHEME_ID, type SoundSchemeId } from "@/lib/sound-schemes";
import { ICON_THEMES, DEFAULT_ICON_THEME_ID, type IconThemeId } from "@/lib/icon-themes";
export type { SoundSchemeId };

export interface AppSettings {
  themeId: ThemeId;
  soundEnabled: boolean;
  masterVolume: number; // 0–100, volume général
  ambientVolume: number; // 0–1, volume du bruit de fond machine
  soundSchemeId: SoundSchemeId;
  animationsEnabled: boolean;
  scanlinesEnabled: boolean;
  cursorId: CursorId;
  wallpaperId: WallpaperId;
  /** true = l'user a choisi manuellement un wallpaper, on ne le remplace plus automatiquement */
  wallpaperOverridden: boolean;
  fontPairId: FontPairId;
  /** Multiplicateur de taille de base 0.7–1.4, défaut 1.0 */
  fontSize: number;
  pixelizeEnabled: boolean;
  performanceModeEnabled: boolean;
  iconThemeId: IconThemeId;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeId: DEFAULT_THEME_ID,
  soundEnabled: true,
  masterVolume: 80,
  ambientVolume: 0.5,
  soundSchemeId: DEFAULT_SOUND_SCHEME_ID,
  animationsEnabled: true,
  scanlinesEnabled: false,
  cursorId: DEFAULT_CURSOR_ID,
  wallpaperId: DEFAULT_WALLPAPER_ID,
  wallpaperOverridden: false,
  fontPairId: DEFAULT_FONT_PAIR_ID,
  fontSize: 1.0,
  pixelizeEnabled: false,
  performanceModeEnabled: false,
  iconThemeId: DEFAULT_ICON_THEME_ID,
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
      masterVolume: typeof parsed.masterVolume === "number"
        ? Math.max(0, Math.min(100, parsed.masterVolume))
        : DEFAULT_SETTINGS.masterVolume,
      ambientVolume: typeof parsed.ambientVolume === "number"
        ? Math.max(0, Math.min(1, parsed.ambientVolume))
        : DEFAULT_SETTINGS.ambientVolume,
      soundSchemeId: SOUND_SCHEMES.some((s) => s.id === parsed.soundSchemeId)
        ? (parsed.soundSchemeId as SoundSchemeId)
        : DEFAULT_SETTINGS.soundSchemeId,
      animationsEnabled: parsed.animationsEnabled ?? DEFAULT_SETTINGS.animationsEnabled,
      scanlinesEnabled: parsed.scanlinesEnabled ?? DEFAULT_SETTINGS.scanlinesEnabled,
      cursorId: CURSORS.some((c) => c.id === parsed.cursorId)
        ? (parsed.cursorId as CursorId)
        : DEFAULT_SETTINGS.cursorId,
      wallpaperId: WALLPAPERS.some((w) => w.id === parsed.wallpaperId)
        ? (parsed.wallpaperId as WallpaperId)
        : DEFAULT_SETTINGS.wallpaperId,
      wallpaperOverridden: parsed.wallpaperOverridden ?? DEFAULT_SETTINGS.wallpaperOverridden,
      fontPairId: FONT_PAIRS.some((p) => p.id === parsed.fontPairId)
        ? (parsed.fontPairId as FontPairId)
        : DEFAULT_SETTINGS.fontPairId,
      fontSize: typeof parsed.fontSize === "number"
        ? Math.max(0.85, Math.min(1.3, parsed.fontSize))
        : DEFAULT_SETTINGS.fontSize,
      pixelizeEnabled: parsed.pixelizeEnabled ?? DEFAULT_SETTINGS.pixelizeEnabled,
      performanceModeEnabled: parsed.performanceModeEnabled ?? DEFAULT_SETTINGS.performanceModeEnabled,
      iconThemeId: ICON_THEMES.some((t) => t.id === parsed.iconThemeId)
        ? (parsed.iconThemeId as IconThemeId)
        : DEFAULT_SETTINGS.iconThemeId,
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

