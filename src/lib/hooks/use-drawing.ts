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
  onVictory: () => void
) {
  const [state, setState] = useState<DrawingState>({
    isDrawing: false,
    highlightedIndex: -1,
    winnerIndex: -1,
  });

  const abortRef = useRef(false);

  const draw = useCallback(async (): Promise<number> => {
    if (gamesCount < 2) return -1;

    abortRef.current = false;
    const winnerIdx = Math.floor(Math.random() * gamesCount);
    const totalSteps =
      gamesCount * 3 + Math.floor(Math.random() * gamesCount) + winnerIdx;

    setState({ isDrawing: true, highlightedIndex: 0, winnerIndex: -1 });

    for (let step = 0; step <= totalSteps; step++) {
      if (abortRef.current) return -1;

      const itemIndex = step % gamesCount;
      setState((prev) => ({ ...prev, highlightedIndex: itemIndex }));
      onBip();

      const progress = step / totalSteps;
      let delay: number;
      if (progress < 0.3) delay = 55 + progress * 30;
      else if (progress < 0.7) delay = 30 + (progress - 0.3) * 80;
      else {
        const s = (progress - 0.7) / 0.3;
        delay = 62 + s * s * 438;
      }

      await sleep(delay);
    }

    setState({ isDrawing: false, highlightedIndex: -1, winnerIndex: winnerIdx });
    onVictory();
    return winnerIdx;
  }, [gamesCount, onBip, onVictory]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ isDrawing: false, highlightedIndex: -1, winnerIndex: -1 });
  }, []);

  return { ...state, draw, reset };
}
