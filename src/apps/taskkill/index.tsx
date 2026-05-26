"use client";

import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/types";
import { TaskkillEngine } from "./engine";
import { useNotify } from "@/lib/contexts/notification-context";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { TASKKILL_WIN_EVENT, TASKKILL_LOSE_EVENT } from "@/lib/defrag-game-bridge";

export function TaskkillApp({ windowId: _windowId }: AppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TaskkillEngine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotify();
  const { openWindow, closeWindow, windows } = useWindowManager();

  // Open the defrag window alongside the game (fresh every time)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Close any stale defrag from a previous game
      const existingDefrag = windows.find((w) => w.appSlug === "defrag");
      if (existingDefrag) closeWindow(existingDefrag.id);
      // Open a fresh one right after
      requestAnimationFrame(() => {
        openWindow("defrag", "Défragmenteur de disque", "🗂️");
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const onWinCb = (score: number) => {
      window.dispatchEvent(new CustomEvent(TASKKILL_WIN_EVENT, { detail: { score } }));
    };
    const onLoseCb = (score: number) => {
      window.dispatchEvent(new CustomEvent(TASKKILL_LOSE_EVENT, { detail: { score } }));
    };

    try {
      const engine = new TaskkillEngine(canvas, {
        onShake: (intensity: number) => {
          if (!container) return;
          const x = (Math.random() - 0.5) * intensity * 3;
          const y = (Math.random() - 0.5) * intensity * 3;
          container.style.transform = `translate(${x}px, ${y}px)`;
          requestAnimationFrame(() => {
            if (container) container.style.transform = "";
          });
        },
        onNotify: (message: string) => {
          const spread = Math.random() < 0.55;
          notify({
            type: "info",
            title: "dragmenteur.exe",
            message,
            duration: 3500,
            ...(spread ? {
              x: 20 + Math.random() * (window.innerWidth - 340),
              y: 10 + Math.random() * (window.innerHeight - 180),
            } : {}),
          });
        },
        onWin: onWinCb,
        onLose: onLoseCb,
      });

      engineRef.current = engine;
      engine.start();
    } catch (e) {
      console.error("[TASKKILL] Engine init failed:", e);
      setError(String(e));
      return;
    }

    const ro = new ResizeObserver(() => {
      const c = containerRef.current;
      const cv = canvasRef.current;
      const eng = engineRef.current;
      if (!c || !cv || !eng) return;
      const r = c.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const d = window.devicePixelRatio || 1;
      cv.width = r.width * d;
      cv.height = r.height * d;
      cv.style.width = `${r.width}px`;
      cv.style.height = `${r.height}px`;
      eng.resize();
    });
    ro.observe(container);

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-[#f44] font-mono text-sm p-4 text-center">
        dragmenteur.exe a crashé.<br />
        <span className="text-[#888] text-xs mt-2">{error}</span>
        <br />
        <span className="text-[#666] text-xs mt-4">Fermez la fenêtre et réessayez.</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
