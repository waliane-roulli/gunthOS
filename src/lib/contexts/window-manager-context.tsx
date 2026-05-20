"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type WindowState = "normal" | "minimized" | "maximized";

export interface WindowInstance {
  id: string;
  appSlug: string;
  title: string;
  icon: string;
  state: WindowState;
  zIndex: number;
  position: { x: number; y: number };
  size: { w: number; h: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { w: number; h: number };
}

interface WindowManagerContextValue {
  windows: WindowInstance[];
  activeWindowId: string | null;
  openWindow: (appSlug: string, title: string, icon: string) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number, x?: number, y?: number) => void;
}

const WindowManagerContext = createContext<WindowManagerContextValue>({
  windows: [],
  activeWindowId: null,
  openWindow: () => "",
  closeWindow: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  restoreWindow: () => {},
  focusWindow: () => {},
  moveWindow: () => {},
  resizeWindow: () => {},
});

const BASE_Z = 100;
let idCounter = 0;

function getDefaultPosition(index: number): { x: number; y: number } {
  const offset = (index % 8) * 32;
  return { x: 80 + offset, y: 60 + offset }; // 40px taskbar + 20px margin
}

function getDefaultSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: 760, h: 600 };
  return {
    w: Math.min(760, window.innerWidth - 40),
    h: Math.min(600, window.innerHeight - 100),
  };
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const topZRef = useRef(BASE_Z);
  const windowsRef = useRef<WindowInstance[]>(windows);
  windowsRef.current = windows;

  const openWindow = useCallback(
    (appSlug: string, title: string, icon: string): string => {
      const existing = windowsRef.current.find((w) => w.appSlug === appSlug);
      if (existing) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existing.id
              ? { ...w, state: "normal", zIndex: ++topZRef.current }
              : w
          )
        );
        setActiveWindowId(existing.id);
        return existing.id;
      }

      const id = `win-${++idCounter}`;
      const position = getDefaultPosition(windowsRef.current.length);
      const size = getDefaultSize();

      setWindows((prev) => [
        ...prev,
        {
          id,
          appSlug,
          title,
          icon,
          state: "normal",
          zIndex: ++topZRef.current,
          position,
          size,
        } satisfies WindowInstance,
      ]);
      setActiveWindowId(id);
      return id;
    },
    []
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((cur) => (cur === id ? null : cur));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, state: "minimized" } : w))
    );
    setActiveWindowId((cur) => (cur === id ? null : cur));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.state === "maximized") {
          return {
            ...w,
            state: "normal",
            position: w.prevPosition ?? w.position,
            size: w.prevSize ?? w.size,
            prevPosition: undefined,
            prevSize: undefined,
            zIndex: ++topZRef.current,
          };
        }
        return {
          ...w,
          state: "maximized",
          prevPosition: w.position,
          prevSize: w.size,
          zIndex: ++topZRef.current,
        };
      })
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              state: "normal",
              position: w.prevPosition ?? w.position,
              size: w.prevSize ?? w.size,
              prevPosition: undefined,
              prevSize: undefined,
              zIndex: ++topZRef.current,
            }
          : w
      )
    );
    setActiveWindowId(id);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, zIndex: ++topZRef.current } : w
      )
    );
    setActiveWindowId(id);
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: { x, y } } : w))
    );
  }, []);

  const resizeWindow = useCallback((id: string, w: number, h: number, x?: number, y?: number) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? {
              ...win,
              size: { w: Math.max(240, w), h: Math.max(160, h) },
              position: x !== undefined && y !== undefined ? { x, y } : win.position,
            }
          : win
      )
    );
  }, []);

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  return useContext(WindowManagerContext);
}
