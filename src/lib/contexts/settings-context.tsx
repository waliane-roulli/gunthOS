"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { THEMES, type ThemeId, type Theme } from "@/lib/themes";
import { type CursorId } from "@/lib/cursors";
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  type AppSettings,
} from "@/lib/settings";
import { WALLPAPERS, WALLPAPER_MAP, type WallpaperId } from "@/lib/wallpapers";
import { FONT_PAIRS, type FontPairId } from "@/lib/font-pairs";
import { type SoundSchemeId } from "@/lib/sound-schemes";
import { type IconThemeId } from "@/lib/icon-themes";
import { useAuth } from "@/lib/contexts/auth-context";
import { useThemeApplication } from "@/lib/hooks/use-theme-application";

const THEME_MAP = new Map(THEMES.map((t) => [t.id, t]));

interface SettingsStateContextValue {
  settings: AppSettings;
  theme: Theme;
}

interface SettingsActionsContextValue {
  setTheme: (id: ThemeId) => void;
  setSoundEnabled: (v: boolean) => void;
  setMasterVolume: (v: number) => void;
  setAmbientVolume: (v: number) => void;
  setSoundScheme: (v: SoundSchemeId) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setScanlinesEnabled: (v: boolean) => void;
  setPixelizeEnabled: (v: boolean) => void;
  setPerformanceModeEnabled: (v: boolean) => void;
  setCursorId: (v: CursorId) => void;
  setWallpaperId: (v: WallpaperId) => void;
  resetWallpaperToTheme: () => void;
  setFontPairId: (v: FontPairId) => void;
  setFontSize: (v: number) => void;
  setIconTheme: (v: IconThemeId) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsStateContext = createContext<SettingsStateContextValue>({
  settings: DEFAULT_SETTINGS,
  theme: THEME_MAP.get(DEFAULT_SETTINGS.themeId) as Theme,
});

const SettingsActionsContext = createContext<SettingsActionsContextValue>({
  setTheme: () => {},
  setSoundEnabled: () => {},
  setMasterVolume: () => {},
  setAmbientVolume: () => {},
  setSoundScheme: () => {},
  setAnimationsEnabled: () => {},
  setScanlinesEnabled: () => {},
  setPixelizeEnabled: () => {},
  setPerformanceModeEnabled: () => {},
  setCursorId: () => {},
  setWallpaperId: () => {},
  resetWallpaperToTheme: () => {},
  setFontPairId: () => {},
  setFontSize: () => {},
  setIconTheme: () => {},
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    if (!user) {
      if (prevUserIdRef.current !== null) {
        setSettings(loadSettings());
      }
      prevUserIdRef.current = null;
      return;
    }
    if (prevUserIdRef.current === user.id) return;
    prevUserIdRef.current = user.id;

    const controller = new AbortController();
    fetch("/api/user/settings", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { settings: Partial<AppSettings> | null }) => {
        const local = loadSettings();
        const remote = data.settings ?? {};

        // Local wins on a key if it differs from the default (user changed it anonymously)
        const merged: AppSettings = {
          themeId: local.themeId !== DEFAULT_SETTINGS.themeId
            ? local.themeId
            : (remote.themeId && THEMES.some((t) => t.id === remote.themeId) ? remote.themeId : DEFAULT_SETTINGS.themeId),
          soundEnabled: local.soundEnabled !== DEFAULT_SETTINGS.soundEnabled
            ? local.soundEnabled
            : (remote.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled),
          masterVolume: local.masterVolume !== DEFAULT_SETTINGS.masterVolume
            ? local.masterVolume
            : (typeof remote.masterVolume === "number" ? Math.max(0, Math.min(100, remote.masterVolume)) : DEFAULT_SETTINGS.masterVolume),
          ambientVolume: local.ambientVolume !== DEFAULT_SETTINGS.ambientVolume
            ? local.ambientVolume
            : (typeof remote.ambientVolume === "number" ? Math.max(0, Math.min(1, remote.ambientVolume)) : DEFAULT_SETTINGS.ambientVolume),
          animationsEnabled: local.animationsEnabled !== DEFAULT_SETTINGS.animationsEnabled
            ? local.animationsEnabled
            : (remote.animationsEnabled ?? DEFAULT_SETTINGS.animationsEnabled),
          scanlinesEnabled: local.scanlinesEnabled !== DEFAULT_SETTINGS.scanlinesEnabled
            ? local.scanlinesEnabled
            : (remote.scanlinesEnabled ?? DEFAULT_SETTINGS.scanlinesEnabled),
          pixelizeEnabled: local.pixelizeEnabled !== DEFAULT_SETTINGS.pixelizeEnabled
            ? local.pixelizeEnabled
            : (remote.pixelizeEnabled ?? DEFAULT_SETTINGS.pixelizeEnabled),
          performanceModeEnabled: local.performanceModeEnabled !== DEFAULT_SETTINGS.performanceModeEnabled
            ? local.performanceModeEnabled
            : (remote.performanceModeEnabled ?? DEFAULT_SETTINGS.performanceModeEnabled),
          cursorId: local.cursorId !== DEFAULT_SETTINGS.cursorId
            ? local.cursorId
            : (remote.cursorId ?? DEFAULT_SETTINGS.cursorId),
          wallpaperId: local.wallpaperOverridden
            ? local.wallpaperId
            : (remote.wallpaperId && WALLPAPERS.some((w) => w.id === remote.wallpaperId)
              ? remote.wallpaperId
              : local.wallpaperId),
          wallpaperOverridden: local.wallpaperOverridden || (remote.wallpaperOverridden ?? false),
          fontPairId: local.fontPairId !== DEFAULT_SETTINGS.fontPairId
            ? local.fontPairId
            : (remote.fontPairId && FONT_PAIRS.some((p) => p.id === remote.fontPairId)
              ? remote.fontPairId as FontPairId
              : DEFAULT_SETTINGS.fontPairId),
          fontSize: local.fontSize !== DEFAULT_SETTINGS.fontSize
            ? local.fontSize
            : (typeof remote.fontSize === "number" ? Math.max(0.85, Math.min(1.3, remote.fontSize)) : DEFAULT_SETTINGS.fontSize),
          soundSchemeId: local.soundSchemeId !== DEFAULT_SETTINGS.soundSchemeId
            ? local.soundSchemeId
            : (remote.soundSchemeId ?? DEFAULT_SETTINGS.soundSchemeId),
          iconThemeId: local.iconThemeId !== DEFAULT_SETTINGS.iconThemeId
            ? local.iconThemeId
            : (remote.iconThemeId ?? DEFAULT_SETTINGS.iconThemeId),
        };
        setSettings(merged);
        saveSettings(merged);
        // Push local-originated changes back only if something actually differs from remote
        const hasLocalChanges = (Object.keys(merged) as (keyof AppSettings)[]).some(
          (k) => merged[k] !== (remote as Partial<AppSettings>)[k]
        );
        if (hasLocalChanges) {
          fetch("/api/user/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(merged),
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [user]);

  const theme = useMemo(
    () => (THEME_MAP.get(settings.themeId) ?? THEME_MAP.get(DEFAULT_SETTINGS.themeId)) as Theme,
    [settings.themeId]
  );

  useThemeApplication(settings, theme);

  const syncToApi = useCallback((next: AppSettings) => {
    if (!prevUserIdRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
    }, 600);
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      syncToApi(next);
      return next;
    });
  }, [syncToApi]);

  const setTheme = useCallback((id: ThemeId) => {
    const themeObj = THEME_MAP.get(id);
    setSettings((prev) => {
      const wallpaperPatch: Partial<AppSettings> =
        !prev.wallpaperOverridden && themeObj?.defaultWallpaperId && WALLPAPER_MAP.has(themeObj.defaultWallpaperId)
          ? { wallpaperId: themeObj.defaultWallpaperId }
          : {};
      const next = { ...prev, themeId: id, ...wallpaperPatch };
      saveSettings(next);
      syncToApi(next);
      return next;
    });
  }, [syncToApi]);

  const setSoundEnabled = useCallback((v: boolean) => updateSettings({ soundEnabled: v }), [updateSettings]);
  const setMasterVolume = useCallback((v: number) => updateSettings({ masterVolume: Math.max(0, Math.min(100, v)) }), [updateSettings]);
  const setAmbientVolume = useCallback((v: number) => updateSettings({ ambientVolume: Math.max(0, Math.min(1, v)) }), [updateSettings]);
  const setSoundScheme = useCallback((v: SoundSchemeId) => updateSettings({ soundSchemeId: v }), [updateSettings]);
  const setAnimationsEnabled = useCallback((v: boolean) => updateSettings({ animationsEnabled: v }), [updateSettings]);
  const setScanlinesEnabled = useCallback((v: boolean) => updateSettings({ scanlinesEnabled: v }), [updateSettings]);
  const setPixelizeEnabled = useCallback((v: boolean) => updateSettings({ pixelizeEnabled: v }), [updateSettings]);
  const setPerformanceModeEnabled = useCallback((v: boolean) => updateSettings({ performanceModeEnabled: v }), [updateSettings]);
  const setCursorId = useCallback((v: CursorId) => updateSettings({ cursorId: v }), [updateSettings]);
  const setWallpaperId = useCallback((v: WallpaperId) => updateSettings({ wallpaperId: v, wallpaperOverridden: true }), [updateSettings]);
  const setFontPairId = useCallback((v: FontPairId) => updateSettings({ fontPairId: v }), [updateSettings]);
  const setFontSize = useCallback((v: number) => updateSettings({ fontSize: Math.max(0.85, Math.min(1.3, v)) }), [updateSettings]);
  const setIconTheme = useCallback((v: IconThemeId) => updateSettings({ iconThemeId: v }), [updateSettings]);
  const resetWallpaperToTheme = useCallback(() => {
    setSettings((prev) => {
      const themeObj = THEME_MAP.get(prev.themeId);
      const wallpaperId =
        themeObj?.defaultWallpaperId && WALLPAPER_MAP.has(themeObj.defaultWallpaperId)
          ? themeObj.defaultWallpaperId
          : prev.wallpaperId;
      const next = { ...prev, wallpaperId, wallpaperOverridden: false };
      saveSettings(next);
      syncToApi(next);
      return next;
    });
  }, [syncToApi]);

  const stateValue = useMemo(() => ({ settings, theme }), [settings, theme]);

  const actionsValue = useMemo(
    () => ({ setTheme, setSoundEnabled, setMasterVolume, setAmbientVolume, setSoundScheme, setAnimationsEnabled, setScanlinesEnabled, setPixelizeEnabled, setPerformanceModeEnabled, setCursorId, setWallpaperId, resetWallpaperToTheme, setFontPairId, setFontSize, setIconTheme, updateSettings }),
    [setTheme, setSoundEnabled, setMasterVolume, setAmbientVolume, setSoundScheme, setAnimationsEnabled, setScanlinesEnabled, setPixelizeEnabled, setPerformanceModeEnabled, setCursorId, setWallpaperId, resetWallpaperToTheme, setFontPairId, setFontSize, setIconTheme, updateSettings]
  );

  return (
    <SettingsStateContext.Provider value={stateValue}>
      <SettingsActionsContext.Provider value={actionsValue}>
        {children}
      </SettingsActionsContext.Provider>
    </SettingsStateContext.Provider>
  );
}

/** State seulement — re-render à chaque changement de settings */
export function useSettingsState() {
  return useContext(SettingsStateContext);
}

/** Actions seulement — jamais de re-render */
export function useSettingsActions() {
  return useContext(SettingsActionsContext);
}

/** Full hook — state + actions (comportement identique à l'ancien useSettings) */
export function useSettings() {
  const state = useContext(SettingsStateContext);
  const actions = useContext(SettingsActionsContext);
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}

/** Compat shim — remplace useTheme() pour les composants qui ne lisent que le thème */
export function useTheme() {
  const { settings, theme } = useSettingsState();
  const { setTheme } = useSettingsActions();
  return { theme, themeId: settings.themeId, setTheme };
}
