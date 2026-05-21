"use client";

import { useEffect, useRef } from "react";

interface ItemListProps {
  games: string[];
  highlightedIndex: number;
  winnerIndex: number;
  onRemove: (index: number) => void;
  disabled: boolean;
}

export function ItemList({
  games,
  highlightedIndex,
  winnerIndex,
  onRemove,
  disabled,
}: ItemListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  // Scroll to winner on mount / mode switch (after draw is complete).
  useEffect(() => {
    if (highlightedIndex >= 0 || winnerIndex < 0) return;
    const el = listRef.current?.children[winnerIndex] as HTMLElement | undefined;
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
    <ul ref={listRef} aria-label="Liste des éléments">
      {games.map((name, i) => {
        const isHighlighted = highlightedIndex === i;
        const isWinner = winnerIndex === i;

        const rowStyle = isWinner
          ? {
              background: "linear-gradient(to bottom, #ff00ff, #ff0080)",
              color: "white",
              borderColor: "black",
            }
          : isHighlighted
          ? {
              background: "linear-gradient(to bottom, #00ffff, #0088ff)",
              color: "white",
              borderColor: "black",
            }
          : i % 2 === 0
          ? { backgroundColor: "var(--t-card-bg)", color: "var(--t-text)" }
          : { backgroundColor: "var(--t-inset-from)", color: "var(--t-text)" };

        return (
          <li
            key={`${name}-${i}`}
            className={[
              "flex items-center px-[10px] py-[6px] mb-[2px] border border-transparent transition-none",
              isWinner && "[animation:winnerPulse_0.6s_ease-in-out_infinite_alternate] scale-[1.04]",
              isHighlighted && "scale-[1.02] shadow-[inset_0_0_0_2px_#fff,0_0_10px_#00ffff]",
            ]
              .filter(Boolean)
              .join(" ")}
            style={rowStyle}
          >
            <span
              className="min-w-[30px] font-bold text-base"
              style={{
                color: isWinner || isHighlighted ? "#ffff00" : "var(--t-accent)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              {String(i + 1).padStart(2, "0")}.
            </span>
            <span
              className="flex-1 text-[0.95rem] font-medium"
              style={{ fontFamily: "var(--t-font-body)" }}
            >
              {name}
            </span>
            {!disabled && (
              <button
                onClick={() => onRemove(i)}
                aria-label={`Supprimer ${name}`}
                className="border-[2px] text-sm px-2 py-0.5 cursor-pointer"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                  borderTopColor: "var(--t-border-light)",
                  borderLeftColor: "var(--t-border-light)",
                  borderBottomColor: "var(--t-border-dark)",
                  borderRightColor: "var(--t-border-dark)",
                }}
              >
                ✕
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
