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
import { THEMES, DEFAULT_THEME_ID, type ThemeId, type Theme } from "@/lib/themes";

const THEME_MAP = new Map(THEMES.map((t) => [t.id, t]));
const DEFAULT_THEME = THEME_MAP.get(DEFAULT_THEME_ID) as Theme;

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
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME_ID;
    const saved = localStorage.getItem("site-theme") as ThemeId | null;
    return saved && THEME_MAP.has(saved) ? saved : DEFAULT_THEME_ID;
  });

  const theme = useMemo(
    () => (THEME_MAP.get(themeId) ?? DEFAULT_THEME) as Theme,
    [themeId]
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute("data-theme", themeId);
  }, [theme, themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem("site-theme", id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
