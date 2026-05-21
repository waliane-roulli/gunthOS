"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import type { WindowInstance } from "@/lib/contexts/window-manager-context";
import { RetroTitlebarBtn } from "./retro-titlebar-btn";
import { useSoundContext } from "@/lib/contexts/sound-context";

interface OsWindowProps {
  win: WindowInstance;
  children: React.ReactNode;
}

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const CURSOR: Record<ResizeEdge, string> = {
  n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
  ne: "ne-resize", nw: "nw-resize", se: "se-resize", sw: "sw-resize",
};

const EDGE_SIZE = 6;
const MIN_W = 240;
const MIN_H = 160;

export function OsWindow({ win, children }: OsWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow, activeWindowId } =
    useWindowManager();
  const { playWindowClose, playWindowMinimize, playWindowOpen } = useSoundContext();

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizing = useRef<ResizeEdge | null>(null);
  const resizeStart = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });
  const winRef = useRef(win);
  winRef.current = win;

  const isActive = win.id === activeWindowId;
  const isMaximized = win.state === "maximized";

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (winRef.current.state === "maximized") return;
      e.preventDefault();
      focusWindow(winRef.current.id);
      dragging.current = true;
      dragOffset.current = {
        x: e.clientX - winRef.current.position.x,
        y: e.clientY - winRef.current.position.y,
      };
    },
    [focusWindow]
  );

  const onResizeMouseDown = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      if (winRef.current.state === "maximized") return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(winRef.current.id);
      resizing.current = edge;
      resizeStart.current = {
        mx: e.clientX,
        my: e.clientY,
        x: winRef.current.position.x,
        y: winRef.current.position.y,
        w: winRef.current.size.w,
        h: winRef.current.size.h,
      };
    },
    [focusWindow]
  );

  useEffect(() => {
    const winId = win.id;

    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) {
        const x = e.clientX - dragOffset.current.x;
        const y = Math.max(40, e.clientY - dragOffset.current.y);
        moveWindow(winId, x, y);
        return;
      }

      if (!resizing.current) return;
      const edge = resizing.current;
      const { mx, my, x, y, w, h } = resizeStart.current;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;

      let newX = x, newY = y, newW = w, newH = h;

      if (edge.includes("e")) newW = Math.max(MIN_W, w + dx);
      if (edge.includes("s")) newH = Math.max(MIN_H, h + dy);
      if (edge.includes("w")) {
        newW = Math.max(MIN_W, w - dx);
        newX = x + (w - newW);
      }
      if (edge.includes("n")) {
        newH = Math.max(MIN_H, h - dy);
        newY = Math.max(40, y + (h - newH));
      }

      resizeWindow(winId, newW, newH, newX, newY);
    };

    const onMouseUp = () => {
      dragging.current = false;
      resizing.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [win.id, moveWindow, resizeWindow]);

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: "fixed",
        left: 0,
        top: 40,
        width: "100vw",
        height: "calc(100vh - 40px)",
        zIndex: win.zIndex,
        margin: 0,
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        left: win.position.x,
        top: Math.max(40, win.position.y),
        width: win.size.w,
        height: win.size.h,
        zIndex: win.zIndex,
        display: "flex",
        flexDirection: "column",
      };

  return (
    <div
      style={{
        ...windowStyle,
        ...(win.state === "minimized" ? { display: "none" } : {}),
        backgroundColor: "var(--t-glass-bg)",
        backdropFilter: "var(--t-glass-blur)",
        WebkitBackdropFilter: "var(--t-glass-blur)",
        border: "3px solid",
        borderTopColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderLeftColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderBottomColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
        borderRightColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
        borderRadius: "var(--t-window-radius)",
        boxShadow: isActive ? "var(--t-window-shadow)" : "none",
        overflow: "hidden",
      }}
      onMouseDown={() => { if (!isActive) focusWindow(win.id); }}
    >
      {/* Resize handles — hidden when maximized */}
      {!isMaximized && (
        <>
          {/* Edges */}
          <div onMouseDown={onResizeMouseDown("n")}  style={{ position: "absolute", top: -EDGE_SIZE,    left: EDGE_SIZE,  right: EDGE_SIZE,  height: EDGE_SIZE * 2, cursor: CURSOR.n,  zIndex: 10 }} />
          <div onMouseDown={onResizeMouseDown("s")}  style={{ position: "absolute", bottom: -EDGE_SIZE, left: EDGE_SIZE,  right: EDGE_SIZE,  height: EDGE_SIZE * 2, cursor: CURSOR.s,  zIndex: 10 }} />
          <div onMouseDown={onResizeMouseDown("w")}  style={{ position: "absolute", top: EDGE_SIZE,     left: -EDGE_SIZE, bottom: EDGE_SIZE,  width: EDGE_SIZE * 2,  cursor: CURSOR.w,  zIndex: 10 }} />
          <div onMouseDown={onResizeMouseDown("e")}  style={{ position: "absolute", top: EDGE_SIZE,     right: -EDGE_SIZE, bottom: EDGE_SIZE, width: EDGE_SIZE * 2,  cursor: CURSOR.e,  zIndex: 10 }} />
          {/* Corners */}
          <div onMouseDown={onResizeMouseDown("nw")} style={{ position: "absolute", top: -EDGE_SIZE,    left: -EDGE_SIZE,  width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.nw, zIndex: 11 }} />
          <div onMouseDown={onResizeMouseDown("ne")} style={{ position: "absolute", top: -EDGE_SIZE,    right: -EDGE_SIZE, width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.ne, zIndex: 11 }} />
          <div onMouseDown={onResizeMouseDown("sw")} style={{ position: "absolute", bottom: -EDGE_SIZE, left: -EDGE_SIZE,  width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.sw, zIndex: 11 }} />
          <div onMouseDown={onResizeMouseDown("se")} style={{ position: "absolute", bottom: -EDGE_SIZE, right: -EDGE_SIZE, width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.se, zIndex: 11 }} />
        </>
      )}

      {/* Titlebar */}
      <div
        onMouseDown={onTitleBarMouseDown}
        className="flex items-center justify-between px-[8px] py-[4px] shrink-0 border-b-2 border-black select-none"
        style={{
          background: isActive
            ? "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))"
            : "linear-gradient(to right, var(--t-bg-dark), var(--t-bg-darker, #666))",
          color: isActive ? "var(--t-titlebar-text)" : "var(--t-text-subtle)",
          fontFamily: "var(--t-font-display)",
          fontSize: "1rem",
          letterSpacing: "0.08em",
          cursor: isMaximized ? "default" : "move",
          borderRadius: isMaximized ? "0" : "calc(var(--t-titlebar-radius) - 1px) calc(var(--t-titlebar-radius) - 1px) 0 0",
        }}
      >
        <span className="truncate flex items-center gap-1.5">
          <span className="shrink-0" style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ transform: `scale(${16 / 46})`, transformOrigin: "center", display: "inline-flex" }}>{win.icon}</span>
          </span>
          {win.title}
        </span>
        <div className="flex gap-0.5 shrink-0 ml-2">
          <RetroTitlebarBtn size={20} isActive={isActive} onClick={(e) => { e.stopPropagation(); playWindowMinimize(); minimizeWindow(win.id); }} title="Réduire">_</RetroTitlebarBtn>
          <RetroTitlebarBtn size={20} isActive={isActive} onClick={(e) => { e.stopPropagation(); playWindowOpen(); maximizeWindow(win.id); }} title={isMaximized ? "Restaurer" : "Agrandir"}>
            {isMaximized ? "❐" : "□"}
          </RetroTitlebarBtn>
          <RetroTitlebarBtn size={20} isActive={isActive} close onClick={(e) => { e.stopPropagation(); playWindowClose(); closeWindow(win.id); }} title="Fermer">✕</RetroTitlebarBtn>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

