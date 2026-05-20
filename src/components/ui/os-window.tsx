"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import type { WindowInstance } from "@/lib/contexts/window-manager-context";

interface OsWindowProps {
  win: WindowInstance;
  children: React.ReactNode;
}

export function OsWindow({ win, children }: OsWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, activeWindowId } =
    useWindowManager();

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
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

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const x = e.clientX - dragOffset.current.x;
      const y = Math.max(40, e.clientY - dragOffset.current.y);
      moveWindow(win.id, x, y);
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [win.id, moveWindow]);

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
        maxHeight: "calc(100vh - 60px)",
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
        boxShadow: isActive
          ? "6px 6px 0 rgba(0,0,0,0.45)"
          : "3px 3px 0 rgba(0,0,0,0.2)",
      }}
      onMouseDown={() => {
        if (!isActive) focusWindow(win.id);
      }}
    >
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
          fontSize: "0.85rem",
          letterSpacing: "0.08em",
          cursor: isMaximized ? "default" : "move",
        }}
      >
        <span className="truncate">
          {win.icon} {win.title}
        </span>

        {/* Window controls */}
        <div className="flex gap-0.5 shrink-0 ml-2">
          <WinBtn
            onClick={() => minimizeWindow(win.id)}
            title="Réduire"
            isActive={isActive}
          >
            _
          </WinBtn>
          <WinBtn
            onClick={() => maximizeWindow(win.id)}
            title={isMaximized ? "Restaurer" : "Agrandir"}
            isActive={isActive}
          >
            {isMaximized ? "❐" : "□"}
          </WinBtn>
          <WinBtn
            onClick={() => closeWindow(win.id)}
            title="Fermer"
            isActive={isActive}
            close
          >
            ✕
          </WinBtn>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function WinBtn({
  children,
  onClick,
  title,
  isActive,
  close,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  isActive: boolean;
  close?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="w-[20px] h-[20px] flex items-center justify-center text-[0.65rem] font-bold border-[2px] cursor-pointer shrink-0"
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
