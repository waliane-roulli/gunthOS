"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { normalize } from "@/lib/utils/normalize";

export type InputError = "empty" | "duplicate" | null;

export function useGameList() {
  const [games, setGames] = useState<string[]>([]);
  const [inputError, setInputError] = useState<InputError>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const setErrorFor = useCallback((err: InputError, ms: number) => {
    if (errorTimerRef.current !== null) clearTimeout(errorTimerRef.current);
    setInputError(err);
    errorTimerRef.current = setTimeout(() => {
      setInputError(null);
      errorTimerRef.current = null;
    }, ms);
  }, []);

  const clearError = useCallback(() => {
    if (errorTimerRef.current !== null) clearTimeout(errorTimerRef.current);
    setInputError(null);
  }, []);

  const addGame = useCallback(
    (value: string): boolean => {
      const trimmed = value.trim();
      if (!trimmed) {
        setErrorFor("empty", 800);
        return false;
      }
      const norm = normalize(trimmed);
      let isDuplicate = false;
      setGames((prev) => {
        if (prev.some((g) => normalize(g) === norm)) {
          isDuplicate = true;
          return prev;
        }
        return [...prev, trimmed];
      });
      if (isDuplicate) {
        setErrorFor("duplicate", 2000);
        return false;
      }
      return true;
    },
    [setErrorFor]
  );

  const removeGame = useCallback((index: number) => {
    setGames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearGames = useCallback(() => setGames([]), []);

  return { games, inputError, addGame, removeGame, clearGames, clearError };
}
