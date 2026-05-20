"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { THEMES, DEFAULT_THEME_ID, type ThemeId, type Theme } from "@/lib/themes";

const DEFAULT_THEME = THEMES.find((t) => t.id === DEFAULT_THEME_ID) as Theme;

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  themeId: DEFAULT_THEME_ID,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    const saved = localStorage.getItem("site-theme") as ThemeId | null;
    if (saved && THEMES.find((t) => t.id === saved)) {
      setThemeId(saved);
    }
  }, []);

  const theme = (THEMES.find((t) => t.id === themeId) ?? DEFAULT_THEME) as Theme;

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute("data-theme", themeId);
  }, [theme, themeId]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem("site-theme", id);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
