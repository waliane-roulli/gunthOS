"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWindowActions, useWindowState } from "@/lib/contexts/window-manager-context";
import type { WindowInstance } from "@/lib/contexts/window-manager-context";
import { RetroTitlebarBtn } from "./retro-titlebar-btn";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useMobile } from "@/lib/hooks/use-mobile";
import { TASKBAR_H, TASKBAR_H_MOBILE } from "@/lib/constants/layout";

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
const SWIPE_THRESHOLD = 30;

export function OsWindow({ win, children }: OsWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowActions();
  const { activeWindowId } = useWindowState();
  const { playWindowClose, playWindowMinimize, playWindowOpen, stopAppSounds } = useSoundContext();
  const isMobile = useMobile();

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizing = useRef<ResizeEdge | null>(null);
  const resizeStart = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const winRef = useRef(win);
  winRef.current = win;
  const swipeStartY = useRef(0);
  const isTitleSwipe = useRef(false);

  const isActive = win.id === activeWindowId;
  const isMaximized = win.state === "maximized";

  const onTitleBarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (isMobile) {
        swipeStartY.current = e.clientY;
        isTitleSwipe.current = true;
        return;
      }
      if (winRef.current.state === "maximized") return;
      e.preventDefault();
      focusWindow(winRef.current.id);
      dragging.current = true;
      dragOffset.current = {
        x: e.clientX - winRef.current.position.x,
        y: e.clientY - winRef.current.position.y,
      };
    },
    [focusWindow, isMobile]
  );

  const onResizePointerDown = useCallback(
    (edge: ResizeEdge) => (e: React.PointerEvent) => {
      if (isMobile || winRef.current.state === "maximized") return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
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
    [focusWindow, isMobile]
  );

  useEffect(() => {
    const winId = win.id;

    const onPointerMove = (e: PointerEvent) => {
      // Mobile: swipe-to-minimize on titlebar
      if (isTitleSwipe.current) {
        const dy = e.clientY - swipeStartY.current;
        if (dy > SWIPE_THRESHOLD) {
          isTitleSwipe.current = false;
          playWindowMinimize();
          minimizeWindow(winId);
        } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
          // Upward or horizontal swipe — cancel gesture
          isTitleSwipe.current = false;
        }
        return;
      }

      if (dragging.current) {
        if (contentRef.current) contentRef.current.style.pointerEvents = "none";
        const x = e.clientX - dragOffset.current.x;
        const y = Math.max(TASKBAR_H, e.clientY - dragOffset.current.y);
        moveWindow(winId, x, y);
        return;
      }

      if (resizing.current && contentRef.current) contentRef.current.style.pointerEvents = "none";
      if (!resizing.current) return;

      const edge = resizing.current;
      const { mx, my, x, y, w, h } = resizeStart.current;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;

      let newX = x, newY = y, newW = w, newH = h;

      if (edge.includes("e")) newW = Math.max(MIN_W, w + dx);
      if (edge.includes("s")) newH = Math.max(MIN_H, h + dy);
      if (edge.includes("w")) {
        const rawW = w - dx;
        newW = Math.max(MIN_W, rawW);
        newX = rawW < MIN_W ? x + w - MIN_W : x + dx;
      }
      if (edge.includes("n")) {
        const rawH = h - dy;
        newH = Math.max(MIN_H, rawH);
        newY = Math.max(TASKBAR_H, rawH < MIN_H ? y + h - MIN_H : y + dy);
      }

      resizeWindow(winId, newW, newH, newX, newY);
    };

    const resetDrag = () => {
      dragging.current = false;
      resizing.current = null;
      isTitleSwipe.current = false;
      if (contentRef.current) contentRef.current.style.pointerEvents = "";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", resetDrag);
    window.addEventListener("blur", resetDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", resetDrag);
      window.removeEventListener("blur", resetDrag);
    };
  }, [win.id, moveWindow, resizeWindow, minimizeWindow, playWindowMinimize, isMobile]);

  const taskbarH = isMobile ? TASKBAR_H_MOBILE : TASKBAR_H;

  const windowStyle: React.CSSProperties = (isMobile || isMaximized)
    ? {
        position: "fixed",
        left: 0,
        top: taskbarH,
        width: "100vw",
        height: `calc(100dvh - ${taskbarH}px)`,
        zIndex: win.zIndex,
        margin: 0,
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        left: win.position.x,
        top: Math.max(TASKBAR_H, win.position.y),
        width: win.size.w,
        height: win.size.h,
        zIndex: win.zIndex,
        display: "flex",
        flexDirection: "column",
      };

  const titlebarH = isMobile ? 48 : undefined;
  const btnSize = isMobile ? 44 : 20;

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
      }}
      onPointerDown={() => { if (!isActive) focusWindow(win.id); }}
    >
      {/* Resize handles — desktop only */}
      {!isMaximized && !isMobile && (
        <>
          <div onPointerDown={onResizePointerDown("n")}  style={{ position: "absolute", top: -EDGE_SIZE,    left: EDGE_SIZE,  right: EDGE_SIZE,  height: EDGE_SIZE * 2, cursor: CURSOR.n,  zIndex: 10 }} />
          <div onPointerDown={onResizePointerDown("s")}  style={{ position: "absolute", bottom: -EDGE_SIZE, left: EDGE_SIZE,  right: EDGE_SIZE,  height: EDGE_SIZE * 2, cursor: CURSOR.s,  zIndex: 10 }} />
          <div onPointerDown={onResizePointerDown("w")}  style={{ position: "absolute", top: EDGE_SIZE,     left: -EDGE_SIZE, bottom: EDGE_SIZE,  width: EDGE_SIZE * 2,  cursor: CURSOR.w,  zIndex: 10 }} />
          <div onPointerDown={onResizePointerDown("e")}  style={{ position: "absolute", top: EDGE_SIZE,     right: -EDGE_SIZE, bottom: EDGE_SIZE, width: EDGE_SIZE * 2,  cursor: CURSOR.e,  zIndex: 10 }} />
          <div onPointerDown={onResizePointerDown("nw")} style={{ position: "absolute", top: -EDGE_SIZE,    left: -EDGE_SIZE,  width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.nw, zIndex: 11 }} />
          <div onPointerDown={onResizePointerDown("ne")} style={{ position: "absolute", top: -EDGE_SIZE,    right: -EDGE_SIZE, width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.ne, zIndex: 11 }} />
          <div onPointerDown={onResizePointerDown("sw")} style={{ position: "absolute", bottom: -EDGE_SIZE, left: -EDGE_SIZE,  width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.sw, zIndex: 11 }} />
          <div onPointerDown={onResizePointerDown("se")} style={{ position: "absolute", bottom: -EDGE_SIZE, right: -EDGE_SIZE, width: EDGE_SIZE * 2,  height: EDGE_SIZE * 2, cursor: CURSOR.se, zIndex: 11 }} />
        </>
      )}

      {/* Titlebar */}
      <div
        onPointerDown={onTitleBarPointerDown}
        className="flex items-center justify-between px-[8px] shrink-0 border-b-2 border-black select-none"
        style={{
          height: titlebarH,
          paddingTop: isMobile ? 0 : 4,
          paddingBottom: isMobile ? 0 : 4,
          background: isActive
            ? "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))"
            : "linear-gradient(to right, var(--t-bg-dark), var(--t-bg-darker, #666))",
          color: isActive ? "var(--t-titlebar-text)" : "var(--t-text-subtle)",
          fontFamily: "var(--t-font-display)",
          fontSize: "var(--t-text-base)",
          letterSpacing: "0.08em",
          cursor: (isMaximized || isMobile) ? "default" : "move",
          borderRadius: (isMaximized || isMobile) ? "0" : "calc(var(--t-titlebar-radius) - 1px) calc(var(--t-titlebar-radius) - 1px) 0 0",
          touchAction: "none",
        }}
      >
        <span className="truncate flex items-center gap-1.5 min-w-0">
          <span className="shrink-0" style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ transform: `scale(${16 / 46})`, transformOrigin: "center", display: "inline-flex" }}>{win.icon}</span>
          </span>
          {win.title}
        </span>
        <div className="flex gap-0.5 shrink-0 ml-2">
          <RetroTitlebarBtn size={btnSize} isActive={isActive} onClick={(e) => { e.stopPropagation(); playWindowMinimize(); minimizeWindow(win.id); }} title="Réduire">_</RetroTitlebarBtn>
          {!isMobile && (
            <RetroTitlebarBtn size={btnSize} isActive={isActive} onClick={(e) => { e.stopPropagation(); playWindowOpen(); maximizeWindow(win.id); }} title={isMaximized ? "Restaurer" : "Agrandir"}>
              {isMaximized ? "❐" : "□"}
            </RetroTitlebarBtn>
          )}
          <RetroTitlebarBtn size={btnSize} isActive={isActive} close onClick={(e) => { e.stopPropagation(); playWindowClose(); stopAppSounds(win.appSlug); closeWindow(win.id); }} title="Fermer">✕</RetroTitlebarBtn>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="flex-1 flex flex-col overflow-auto min-h-0 relative"
        style={{ borderRadius: "0 0 var(--t-window-radius) var(--t-window-radius)" }}
      >{children}</div>
    </div>
  );
}
