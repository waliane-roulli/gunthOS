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
  type Density,
} from "@/lib/settings";
import { WALLPAPERS, WALLPAPER_MAP, type WallpaperId } from "@/lib/wallpapers";
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
  setAnimationsEnabled: (v: boolean) => void;
  setDensity: (v: Density) => void;
  setScanlinesEnabled: (v: boolean) => void;
  setCursorId: (v: CursorId) => void;
  setWallpaperId: (v: WallpaperId) => void;
  resetWallpaperToTheme: () => void;
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
  setAnimationsEnabled: () => {},
  setDensity: () => {},
  setScanlinesEnabled: () => {},
  setCursorId: () => {},
  setWallpaperId: () => {},
  resetWallpaperToTheme: () => {},
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
        if (!data.settings) return;
        const merged: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...data.settings,
          themeId: THEMES.some((t) => t.id === data.settings!.themeId)
            ? data.settings!.themeId!
            : DEFAULT_SETTINGS.themeId,
          ambientVolume: typeof data.settings.ambientVolume === "number"
            ? Math.max(0, Math.min(1, data.settings.ambientVolume))
            : DEFAULT_SETTINGS.ambientVolume,
          wallpaperId: WALLPAPERS.some((w) => w.id === data.settings!.wallpaperId)
            ? data.settings!.wallpaperId!
            : DEFAULT_SETTINGS.wallpaperId,
        };
        setSettings(merged);
        saveSettings(merged);
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
  const setAnimationsEnabled = useCallback((v: boolean) => updateSettings({ animationsEnabled: v }), [updateSettings]);
  const setDensity = useCallback((v: Density) => updateSettings({ density: v }), [updateSettings]);
  const setScanlinesEnabled = useCallback((v: boolean) => updateSettings({ scanlinesEnabled: v }), [updateSettings]);
  const setCursorId = useCallback((v: CursorId) => updateSettings({ cursorId: v }), [updateSettings]);
  const setWallpaperId = useCallback((v: WallpaperId) => updateSettings({ wallpaperId: v, wallpaperOverridden: true }), [updateSettings]);
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
    () => ({ setTheme, setSoundEnabled, setMasterVolume, setAmbientVolume, setAnimationsEnabled, setDensity, setScanlinesEnabled, setCursorId, setWallpaperId, resetWallpaperToTheme, updateSettings }),
    [setTheme, setSoundEnabled, setMasterVolume, setAmbientVolume, setAnimationsEnabled, setDensity, setScanlinesEnabled, setCursorId, setWallpaperId, resetWallpaperToTheme, updateSettings]
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
