"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

export interface WinnerEntry {
  name: string;
  date: number;
}

const MAX_HISTORY = 50;

export function useWinnerHistory() {
  const [history, setHistory] = useLocalStorage<WinnerEntry[]>(
    "ploufPloufHistory",
    []
  );
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef(history);
  historyRef.current = history;

  const addWinner = useCallback(
    (name: string) => {
      setHistory((prev) =>
        [{ name, date: Date.now() }, ...prev].slice(0, MAX_HISTORY)
      );
      setHistoryIndex(-1);
    },
    [setHistory]
  );

  const currentEntry: WinnerEntry | null = useMemo(() => {
    if (history.length === 0) return null;
    return historyIndex === -1
      ? (history[0] ?? null)
      : (history[historyIndex] ?? null);
  }, [history, historyIndex]);

  const goPrev = useCallback(() => {
    setHistoryIndex((i) => {
      const next = i + 1;
      return next < historyRef.current.length ? next : i;
    });
  }, []);

  const goNext = useCallback(() => {
    setHistoryIndex((i) => {
      const next = i - 1;
      return next >= -1 ? next : i;
    });
  }, []);

  const hasPrev = history.length > 0 && historyIndex < history.length - 1;
  const hasNext = historyIndex > -1;
  const displayNumber = historyIndex === -1 ? 1 : historyIndex + 1;

  return {
    history,
    addWinner,
    currentEntry,
    goPrev,
    goNext,
    hasPrev,
    hasNext,
    displayNumber,
    total: history.length,
  };
}
