"use client";

import { useRef, useEffect } from "react";

const PALETTE = [
  "#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff",
  "#5f27cd", "#01a3a4", "#f368e0", "#ff6348", "#7bed9f",
  "#e056a0", "#22a6b3", "#eb4d4b", "#f9ca24", "#6ab04c",
];

interface HorizontalPickerProps {
  games: string[];
  highlightedIndex: number;
  winnerIndex: number;
  isDrawing: boolean;
  onRemove: (index: number) => void;
  disabled: boolean;
}

export function HorizontalPicker({
  games,
  highlightedIndex,
  winnerIndex,
  isDrawing,
  onRemove,
  disabled,
}: HorizontalPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHighlightedRef = useRef(-1);

  useEffect(() => {
    if (highlightedIndex < 0 || highlightedIndex === prevHighlightedRef.current) return;
    prevHighlightedRef.current = highlightedIndex;

    const el = containerRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  // Scroll to winner on mount / mode switch (after draw is complete).
  useEffect(() => {
    if (highlightedIndex >= 0 || winnerIndex < 0) return;
    const el = containerRef.current?.children[winnerIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [winnerIndex]);

  if (games.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-lg tracking-wider"
        style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}
      >
        <span className="text-4xl mb-2 animate-[float_3s_ease-in-out_infinite]">💧</span>
        <p>&lt;&lt; VOTRE LISTE EST VIDE &gt;&gt;</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Horizontal wrapping grid */}
      <div
        ref={containerRef}
        className="flex flex-wrap justify-center items-center gap-2 py-6 px-4 min-h-[80px]"
      >
        {games.map((name, i) => {
          const isHighlighted = highlightedIndex === i;
          const isWinner = winnerIndex === i;

          return (
            <div
              key={`${name}-${i}`}
              className="relative"
            >
              <div
                className={[
                  "px-5 py-3 border-[3px] font-bold text-center whitespace-nowrap transition-none min-w-[80px]",
                  isWinner &&
                    "scale-125 z-20 [animation:winnerPulse_0.6s_ease-in-out_infinite_alternate]",
                  isHighlighted && !isWinner &&
                    "scale-110 z-10",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  background: isWinner
                    ? "var(--plouf-accent, #ffd700)"
                    : isHighlighted
                    ? "var(--plouf-accent, #00ffff)"
                    : PALETTE[i % PALETTE.length],
                  color: isWinner || isHighlighted ? "#000" : "#fff",
                  fontFamily: "var(--t-font-body)",
                  borderRadius: "6px",
                  borderColor: isWinner
                    ? "var(--plouf-accent, #ffd700)"
                    : isHighlighted
                    ? "var(--plouf-accent, #00ffff)"
                    : "rgba(0,0,0,0.25)",
                  textShadow: isWinner || isHighlighted ? "none" : "1px 1px 0 rgba(0,0,0,0.35)",
                  transform: isWinner ? "scale(1.25)" : isHighlighted ? "scale(1.1)" : "scale(0.92)",
                  opacity: isWinner || isHighlighted ? 1 : 0.75,
                  boxShadow: isWinner
                    ? "0 0 20px color-mix(in srgb, var(--plouf-accent, #ffd700) 70%, transparent)"
                    : isHighlighted
                    ? "0 0 15px var(--plouf-accent, #00ffff)"
                    : "none",
                }}
              >
                {/* Number badge */}
                <span
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-black"
                  style={{
                    backgroundColor: isWinner ? "#ffff00" : isHighlighted ? "#ffff00" : "var(--t-accent)",
                    color: isWinner || isHighlighted ? "#000" : "var(--t-titlebar-text)",
                  }}
                >
                  {i + 1}
                </span>

                {name}

                {/* Winner sparkles */}
                {isWinner && (
                  <>
                    <span className="absolute -top-1 -right-1 text-lg animate-[flameFlicker_0.3s_ease-in-out_infinite_alternate]">
                      ✨
                    </span>
                    <span className="absolute -bottom-1 -left-1 text-lg animate-[flameFlicker_0.3s_ease-in-out_infinite_alternate] [animation-delay:-0.15s]">
                      ✨
                    </span>
                  </>
                )}
              </div>

              {/* Remove button */}
              {!disabled && !isWinner && (
                <button
                  onClick={() => onRemove(i)}
                  aria-label={`Supprimer ${name}`}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-black flex items-center justify-center hover:bg-red-700 z-30"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
