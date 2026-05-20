"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEMES, type ThemeId, type Theme } from "@/lib/themes";
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  DENSITY_CSS,
  type AppSettings,
  type Density,
} from "@/lib/settings";

const THEME_MAP = new Map(THEMES.map((t) => [t.id, t]));

interface SettingsContextValue {
  settings: AppSettings;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
  setSoundEnabled: (v: boolean) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setDensity: (v: Density) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  theme: THEME_MAP.get(DEFAULT_SETTINGS.themeId) as Theme,
  setTheme: () => {},
  setSoundEnabled: () => {},
  setAnimationsEnabled: () => {},
  setDensity: () => {},
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

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

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((id: ThemeId) => updateSettings({ themeId: id }), [updateSettings]);
  const setSoundEnabled = useCallback((v: boolean) => updateSettings({ soundEnabled: v }), [updateSettings]);
  const setAnimationsEnabled = useCallback((v: boolean) => updateSettings({ animationsEnabled: v }), [updateSettings]);
  const setDensity = useCallback((v: Density) => updateSettings({ density: v }), [updateSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, theme, setTheme, setSoundEnabled, setAnimationsEnabled, setDensity, updateSettings }}
    >
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
