"use client";

import { useEffect } from "react";
import { CURSOR_MAP } from "@/lib/cursors";
import { DENSITY_CSS, type AppSettings } from "@/lib/settings";
import type { Theme } from "@/lib/themes";

/**
 * Applique les CSS variables du thème, densité, animations, scanlines et curseur
 * sur document.documentElement.
 *
 * Extrait de SettingsContext pour isoler les effets de bord DOM.
 */
export function useThemeApplication(settings: AppSettings, theme: Theme) {
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
      root.style.setProperty("--t-scanlines", theme.vars["--t-scanlines"] ?? "0");
    }
  }, [settings.scanlinesEnabled, theme]);

  useEffect(() => {
    const cursor = CURSOR_MAP.get(settings.cursorId);
    document.documentElement.style.cursor = cursor?.css ?? "default";
    return () => { document.documentElement.style.cursor = ""; };
  }, [settings.cursorId]);
}
