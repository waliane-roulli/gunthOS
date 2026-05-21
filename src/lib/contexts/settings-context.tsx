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
import { CURSOR_MAP, type CursorId } from "@/lib/cursors";
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  DENSITY_CSS,
  type AppSettings,
  type Density,
} from "@/lib/settings";
import { WALLPAPERS, WALLPAPER_MAP, type WallpaperId } from "@/lib/wallpapers";
import { useAuth } from "@/lib/contexts/auth-context";

const THEME_MAP = new Map(THEMES.map((t) => [t.id, t]));

interface SettingsContextValue {
  settings: AppSettings;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
  setSoundEnabled: (v: boolean) => void;
  setAmbientVolume: (v: number) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setDensity: (v: Density) => void;
  setScanlinesEnabled: (v: boolean) => void;
  setCursorId: (v: CursorId) => void;
  setWallpaperId: (v: WallpaperId) => void;
  resetWallpaperToTheme: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  theme: THEME_MAP.get(DEFAULT_SETTINGS.themeId) as Theme,
  setTheme: () => {},
  setSoundEnabled: () => {},
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

  // Chargement initial depuis localStorage
  useEffect(() => {
    setSettings(loadSettings());
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Quand un user se connecte → on charge ses settings depuis l'API et on écrase le local
  useEffect(() => {
    if (!user) {
      // Déconnexion → on recharge le localStorage
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

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute("data-theme", settings.themeId);
  }, [theme, settings.themeId]);

  useEffect(() => {
    const root = document.documentElement;
    const vars = DENSITY_CSS[settings.density];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute("data-density", settings.density);
  }, [settings.density]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-animations",
      settings.animationsEnabled ? "on" : "off"
    );
  }, [settings.animationsEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    if (!settings.scanlinesEnabled) {
      root.style.setProperty("--t-scanlines", "0");
    } else {
      // Restore the theme's original scanlines value
      const themeVal = theme.vars["--t-scanlines"] ?? "0";
      root.style.setProperty("--t-scanlines", themeVal);
    }
  }, [settings.scanlinesEnabled, theme]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);

      // Si connecté, sync vers l'API en debounce 600ms
      if (prevUserIdRef.current) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fetch("/api/user/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          }).catch(() => {});
        }, 600);
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const cursor = CURSOR_MAP.get(settings.cursorId);
    document.documentElement.style.cursor = cursor?.css ?? "default";
    return () => { document.documentElement.style.cursor = ""; };
  }, [settings.cursorId]);

  const setTheme = useCallback((id: ThemeId) => {
    const themeObj = THEME_MAP.get(id);
    setSettings((prev) => {
      const wallpaperPatch: Partial<AppSettings> =
        !prev.wallpaperOverridden && themeObj?.defaultWallpaperId && WALLPAPER_MAP.has(themeObj.defaultWallpaperId)
          ? { wallpaperId: themeObj.defaultWallpaperId }
          : {};
      const next = { ...prev, themeId: id, ...wallpaperPatch };
      saveSettings(next);
      if (prevUserIdRef.current) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fetch("/api/user/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          }).catch(() => {});
        }, 600);
      }
      return next;
    });
  }, []);

  const setSoundEnabled = useCallback((v: boolean) => updateSettings({ soundEnabled: v }), [updateSettings]);
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
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ settings, theme, setTheme, setSoundEnabled, setAmbientVolume, setAnimationsEnabled, setDensity, setScanlinesEnabled, setCursorId, setWallpaperId, resetWallpaperToTheme, updateSettings }),
    [settings, theme, setTheme, setSoundEnabled, setAmbientVolume, setAnimationsEnabled, setDensity, setScanlinesEnabled, setCursorId, setWallpaperId, resetWallpaperToTheme, updateSettings]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

/** Compat shim — remplace useTheme() pour les composants qui ne lisent que le thème */
export function useTheme() {
  const { settings, theme, setTheme } = useSettings();
  return { theme, themeId: settings.themeId, setTheme };
}
