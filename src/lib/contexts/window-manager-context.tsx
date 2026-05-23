"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TASKBAR_H_MOBILE } from "@/lib/constants/layout";

export type WindowState = "normal" | "minimized" | "maximized";

export interface WindowInstance {
  id: string;
  appSlug: string;
  title: string;
  icon: ReactNode;
  state: WindowState;
  zIndex: number;
  position: { x: number; y: number };
  size: { w: number; h: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { w: number; h: number };
}

interface WindowStateContextValue {
  windows: WindowInstance[];
  activeWindowId: string | null;
}

interface WindowActionsContextValue {
  openWindow: (appSlug: string, title: string, icon: ReactNode, opts?: { startMaximized?: boolean; defaultSize?: { w: number; h: number } }) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number, x?: number, y?: number) => void;
}

const WindowStateContext = createContext<WindowStateContextValue>({
  windows: [],
  activeWindowId: null,
});

const WindowActionsContext = createContext<WindowActionsContextValue>({
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

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

function getDefaultPosition(index: number): { x: number; y: number } {
  if (isMobileViewport()) return { x: 0, y: TASKBAR_H_MOBILE };
  const offset = (index % 8) * 32;
  return { x: 80 + offset, y: 60 + offset };
}

function getDefaultSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: 760, h: 600 };
  if (isMobileViewport()) return { w: window.innerWidth, h: window.innerHeight - TASKBAR_H_MOBILE };
  return {
    w: Math.min(760, window.innerWidth - 40),
    h: Math.min(600, window.innerHeight - 100),
  };
}

function getSizeForApp(defaultSize?: { w: number; h: number }): { w: number; h: number } {
  if (isMobileViewport()) return getDefaultSize();
  if (!defaultSize) return getDefaultSize();
  if (typeof window === "undefined") return defaultSize;
  return {
    w: defaultSize.w,
    h: Math.min(defaultSize.h, window.innerHeight - 80),
  };
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const topZRef = useRef(BASE_Z);
  const idCounterRef = useRef(0);
  const windowsRef = useRef<WindowInstance[]>(windows);
  windowsRef.current = windows;

  const openWindow = useCallback(
    (appSlug: string, title: string, icon: ReactNode, opts?: { startMaximized?: boolean; defaultSize?: { w: number; h: number } }): string => {
      const startMaximized = opts?.startMaximized;
      const existing = windowsRef.current.find((w) => w.appSlug === appSlug);
      if (existing) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existing.id
              ? { ...w, state: startMaximized ? "maximized" : "normal", zIndex: ++topZRef.current }
              : w
          )
        );
        setActiveWindowId(existing.id);
        return existing.id;
      }

      const id = `win-${++idCounterRef.current}`;
      const mobile = isMobileViewport();
      const position = getDefaultPosition(windowsRef.current.length);
      const size = getSizeForApp(opts?.defaultSize);

      setWindows((prev) => [
        ...prev,
        {
          id,
          appSlug,
          title,
          icon,
          state: (startMaximized || mobile) ? "maximized" : "normal",
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
      prev.map((w) => {
        if (w.id !== id) return w;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const clampedX = Math.max(-(w.size.w - 80), Math.min(vw - 80, x));
        const clampedY = Math.max(40, Math.min(vh - 40, y));
        return { ...w, position: { x: clampedX, y: clampedY } };
      })
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

  const stateValue = useMemo(
    () => ({ windows, activeWindowId }),
    [windows, activeWindowId]
  );

  const actionsValue = useMemo(
    () => ({ openWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, moveWindow, resizeWindow }),
    [openWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, moveWindow, resizeWindow]
  );

  return (
    <WindowStateContext.Provider value={stateValue}>
      <WindowActionsContext.Provider value={actionsValue}>
        {children}
      </WindowActionsContext.Provider>
    </WindowStateContext.Provider>
  );
}

/** State only — re-renders on every window change (position, size, z-index) */
export function useWindowState() {
  return useContext(WindowStateContext);
}

/** Actions only — never re-renders */
export function useWindowActions() {
  return useContext(WindowActionsContext);
}

/** Full context — use only when you need both state and actions in the same component */
export function useWindowManager() {
  const state = useWindowState();
  const actions = useWindowActions();
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
