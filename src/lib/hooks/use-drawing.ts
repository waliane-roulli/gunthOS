"use client";

import { useState, useCallback, useRef } from "react";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export interface DrawingState {
  isDrawing: boolean;
  highlightedIndex: number;
  winnerIndex: number;
}

export function useDrawing(
  gamesCount: number,
  onBip: () => void,
  onVictory?: () => void
) {
  const [state, setState] = useState<DrawingState>({
    isDrawing: false,
    highlightedIndex: -1,
    winnerIndex: -1,
  });

  const abortRef = useRef(false);

  const draw = useCallback(async (random = false): Promise<number> => {
    if (gamesCount < 2) return -1;

    abortRef.current = false;
    const winnerIdx = Math.floor(Math.random() * gamesCount);
    const totalSteps = Math.max(
      random
        ? gamesCount * 3 + Math.floor(Math.random() * gamesCount) + winnerIdx
        : gamesCount * 4 + winnerIdx,
      90 // ~7 secondes minimum
    );

    setState({ isDrawing: true, highlightedIndex: 0, winnerIndex: -1 });

    let prevItemIndex = -1;
    for (let step = 0; step <= totalSteps; step++) {
      if (abortRef.current) return -1;

      let itemIndex: number;
      if (random) {
        if (step === totalSteps) {
          itemIndex = winnerIdx;
        } else {
          do {
            itemIndex = Math.floor(Math.random() * gamesCount);
          } while (itemIndex === prevItemIndex && gamesCount > 1);
        }
      } else {
        itemIndex = step % gamesCount;
      }
      prevItemIndex = itemIndex;
      setState((prev) => ({ ...prev, highlightedIndex: itemIndex }));
      onBip();

      const progress = step / totalSteps;
      let delay: number;
      if (progress < 0.1) {
        const t = progress / 0.1;
        delay = 50 + t * (30 - 50);
      } else if (progress < 0.7) {
        delay = 30;
      } else {
        const s = (progress - 0.7) / 0.3;
        delay = 30 + s * s * 470;
      }

      await sleep(delay);
    }

    setState({ isDrawing: false, highlightedIndex: -1, winnerIndex: winnerIdx });
    onVictory?.();
    return winnerIdx;
  }, [gamesCount, onBip, onVictory]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ isDrawing: false, highlightedIndex: -1, winnerIndex: -1 });
  }, []);

  return { ...state, draw, reset };
}
