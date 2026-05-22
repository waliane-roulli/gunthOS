"use client";

import { useEffect } from "react";
import { CURSOR_MAP } from "@/lib/cursors";
import type { AppSettings } from "@/lib/settings";
import type { Theme } from "@/lib/themes";
import { FONT_PAIR_MAP, DEFAULT_FONT_PAIR_ID } from "@/lib/font-pairs";

/**
 * Applique les CSS variables du thème, animations, scanlines et curseur
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

  useEffect(() => {
    const pair = FONT_PAIR_MAP.get(settings.fontPairId) ?? FONT_PAIR_MAP.get(DEFAULT_FONT_PAIR_ID)!;
    const root = document.documentElement;
    root.style.setProperty("--t-font-display", pair.displayVar);
    root.style.setProperty("--t-font-body", pair.bodyVar);
    root.style.setProperty("--t-font-scale", String(pair.scale));
  }, [settings.fontPairId]);

  useEffect(() => {
    const scale = settings.fontSize ?? 1;
    document.documentElement.style.setProperty("--t-font-size", String(scale));
    // Redéfinit le 1rem de base → tous les rem (Tailwind text-sm etc.) suivent
    document.documentElement.style.fontSize = `${scale * 100}%`;
  }, [settings.fontSize]);
}
