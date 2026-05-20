"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import type { WindowInstance } from "@/lib/contexts/window-manager-context";

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

export function OsWindow({ win, children }: OsWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow, activeWindowId } =
    useWindowManager();

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizing = useRef<ResizeEdge | null>(null);
  const resizeStart = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });

  const isActive = win.id === activeWindowId;
  const isMaximized = win.state === "maximized";

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (isMaximized) return;
      e.preventDefault();
      focusWindow(win.id);
      dragging.current = true;
      dragOffset.current = {
        x: e.clientX - win.position.x,
        y: e.clientY - win.position.y,
      };
    },
    [isMaximized, win.id, win.position.x, win.position.y, focusWindow]
  );

  function onResizeMouseDown(edge: ResizeEdge) {
    return (e: React.MouseEvent) => {
      if (isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.id);
      resizing.current = edge;
      resizeStart.current = {
        mx: e.clientX,
        my: e.clientY,
        x: win.position.x,
        y: win.position.y,
        w: win.size.w,
        h: win.size.h,
      };
    };
  }

  useEffect(() => {
    const MIN_W = 240;
    const MIN_H = 160;

    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) {
        const x = e.clientX - dragOffset.current.x;
        const y = Math.max(40, e.clientY - dragOffset.current.y);
        moveWindow(win.id, x, y);
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

      resizeWindow(win.id, newW, newH, newX, newY);
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

  if (win.state === "minimized") return null;

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
        backgroundColor: "var(--t-bg)",
        border: "3px solid",
        borderTopColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderLeftColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderBottomColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
        borderRightColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
        boxShadow: isActive ? "6px 6px 0 rgba(0,0,0,0.45)" : "3px 3px 0 rgba(0,0,0,0.2)",
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
        }}
      >
        <span className="truncate">{win.icon} {win.title}</span>
        <div className="flex gap-0.5 shrink-0 ml-2">
          <WinBtn onClick={() => minimizeWindow(win.id)} title="Réduire" isActive={isActive}>_</WinBtn>
          <WinBtn onClick={() => maximizeWindow(win.id)} title={isMaximized ? "Restaurer" : "Agrandir"} isActive={isActive}>
            {isMaximized ? "❐" : "□"}
          </WinBtn>
          <WinBtn onClick={() => closeWindow(win.id)} title="Fermer" isActive={isActive} close>✕</WinBtn>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function WinBtn({
  children, onClick, title, isActive, close,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  isActive: boolean;
  close?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className="w-[20px] h-[20px] flex items-center justify-center text-xs font-bold border-[2px] cursor-pointer shrink-0"
      style={{
        backgroundColor: close ? (isActive ? "#cc2222" : "var(--t-bg)") : "var(--t-bg)",
        color: close && isActive ? "#fff" : "var(--t-text)",
        fontFamily: "var(--t-font-display)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
      }}
    >
      {children}
    </button>
  );
}
