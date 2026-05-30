"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getKiffTheme, KIFF_THEMES, type KiffTheme } from "./kiff-themes";

const STORAGE_KEY = "gunthrank-kiff-theme";

function loadThemeId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "os";
  } catch {
    return "os";
  }
}

interface KiffThemeContextValue {
  theme: KiffTheme;
  setThemeId: (id: string) => void;
}

const KiffThemeContext = createContext<KiffThemeContextValue>({
  theme: KIFF_THEMES[0]!,
  setThemeId: () => {},
});

export function KiffThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<KiffTheme>(() => getKiffTheme(loadThemeId()));

  const setThemeId = useCallback((id: string) => {
    const t = getKiffTheme(id);
    setTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch { /* noop */ }
  }, []);

  return (
    <KiffThemeContext.Provider value={{ theme, setThemeId }}>
      {children}
    </KiffThemeContext.Provider>
  );
}

export function useKiffTheme() {
  return useContext(KiffThemeContext);
}
