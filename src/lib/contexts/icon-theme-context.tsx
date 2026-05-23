"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getIconTheme, type IconTheme } from "@/lib/icon-themes";
import { useSettingsState } from "./settings-context";

const IconThemeContext = createContext<IconTheme>(getIconTheme("win98"));

export function IconThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettingsState();
  const theme = useMemo(
    () => getIconTheme(settings.iconThemeId),
    [settings.iconThemeId]
  );
  return (
    <IconThemeContext.Provider value={theme}>
      {children}
    </IconThemeContext.Provider>
  );
}

export function useIconTheme(): IconTheme {
  return useContext(IconThemeContext);
}
