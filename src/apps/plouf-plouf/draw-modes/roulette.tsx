"use client";

import { useRef, useEffect, useCallback } from "react";

interface RouletteWheelProps {
  games: string[];
  highlightedIndex: number;
  winnerIndex: number;
  isDrawing: boolean;
}

const ITEM_H = 52;
const GAP = 6;
const STEP = ITEM_H + GAP;
const VIEWPORT_H = 280;
const BORDER_W = 3;
const INNER_H = VIEWPORT_H - 2 * BORDER_W;
const CENTER = (INNER_H - ITEM_H) / 2;
const COPIES = 5;

export function RouletteWheel({
  games,
  highlightedIndex,
  winnerIndex,
  isDrawing,
}: RouletteWheelProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const currentYRef = useRef(0);

  const snapToIndex = useCallback((index: number) => {
    const strip = stripRef.current;
    if (!strip || games.length === 0) return;
    const band = 2;
    const targetReal = band * games.length + index;
    const targetY = CENTER - targetReal * STEP;
    strip.style.transform = `translateY(${targetY}px)`;
    currentYRef.current = targetY;
  }, [games.length]);

  // Snap to position — no interpolation during drawing.
  // Animation would lag because ticks arrive faster than the animation duration.
  useEffect(() => {
    snapToIndex(highlightedIndex);
  }, [highlightedIndex, isDrawing, snapToIndex]);

  // Show winner on mount / mode switch (after draw is complete).
  useEffect(() => {
    if (highlightedIndex >= 0 || winnerIndex < 0) return;
    snapToIndex(winnerIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winnerIndex, snapToIndex]);

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

  const looped = Array.from({ length: COPIES * games.length }, (_, i) => ({
    name: games[i % games.length],
    realIdx: i % games.length,
    copyIdx: i,
  }));

  return (
    <div className="relative flex justify-center">
      {/* Single container: border, overflow, background on the outer box.
          Strip + indicator are direct siblings — no nested borders to offset. */}
      <div
        className="relative overflow-hidden border-[3px]"
        style={{
          width: "min(440px, 100%)",
          height: `${VIEWPORT_H}px`,
          backgroundColor: "var(--t-card-bg)",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        {/* Strip — animated imperatively via ref */}
        <div
          ref={stripRef}
          className="absolute left-0 right-0 will-change-transform"
        >
          {looped.map(({ name, realIdx, copyIdx }) => {
            const isHighlighted = highlightedIndex >= 0 && realIdx === highlightedIndex && isDrawing;
            const isWinner = winnerIndex >= 0 && realIdx === winnerIndex;

            return (
              <div
                key={copyIdx}
                className="flex items-center justify-center font-bold whitespace-nowrap mx-3 transition-none"
                style={{
                  height: `${ITEM_H}px`,
                  marginBottom: `${GAP}px`,
                  background: isWinner
                    ? "var(--plouf-accent, #ff00ff)"
                    : isHighlighted
                    ? "color-mix(in srgb, var(--plouf-accent, #00ffff) 60%, white)"
                    : copyIdx % 2 === 0
                    ? "var(--t-card-bg)"
                    : "var(--t-inset-from)",
                  color: isWinner || isHighlighted ? "#fff" : "var(--t-text)",
                  fontFamily: "var(--t-font-body)",
                  textShadow: isWinner || isHighlighted
                    ? "1px 1px 0 rgba(0,0,0,0.3)"
                    : "none",
                  transform: isWinner
                    ? "scale(1.08)"
                    : isHighlighted
                    ? "scale(1.04)"
                    : "scale(1)",
                  boxShadow: isWinner
                    ? "0 0 20px color-mix(in srgb, var(--plouf-accent, #ff00ff) 50%, transparent), inset 0 0 8px rgba(255,255,255,0.3)"
                    : isHighlighted
                    ? "0 0 18px color-mix(in srgb, var(--plouf-accent, #00ffff) 30%, transparent), inset 0 0 6px rgba(255,255,255,0.25)"
                    : "0 1px 2px rgba(0,0,0,0.06)",
                  border: isWinner
                    ? "2px solid var(--plouf-accent, #ff0080)"
                    : isHighlighted
                    ? "2px solid color-mix(in srgb, var(--plouf-accent, #00bcd4) 70%, white)"
                    : copyIdx % 2 === 0
                    ? "1px solid var(--t-border-light)"
                    : "1px solid var(--t-border-dark)",
                  fontSize: isWinner ? "1.3rem" : isHighlighted ? "1.15rem" : "1rem",
                  fontWeight: isWinner ? 800 : isHighlighted ? 700 : 600,
                }}
              >
                {name}
                {isWinner && <span className="ml-2 text-xl">⭐</span>}
              </div>
            );
          })}
        </div>

        {/* Center indicator — same parent as strip, absolutely positioned, stays forever fixed */}
        <div
          className="absolute left-2 right-2 pointer-events-none"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            height: `${ITEM_H}px`,
            borderTop: "2px dashed color-mix(in srgb, var(--plouf-accent, #00ffff) 50%, transparent)",
            borderBottom: "2px dashed color-mix(in srgb, var(--plouf-accent, #00ffff) 50%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--plouf-accent, #00ffff) 5%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
