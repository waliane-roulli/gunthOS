"use client";

import { useState, useCallback } from "react";
import { normalize } from "@/lib/utils/normalize";

export type InputError = "empty" | "duplicate" | null;

export function useGameList() {
  const [games, setGames] = useState<string[]>([]);
  const [inputError, setInputError] = useState<InputError>(null);

  const clearError = useCallback(() => setInputError(null), []);

  const addGame = useCallback((value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setInputError("empty");
      setTimeout(() => setInputError(null), 800);
      return false;
    }
    const norm = normalize(trimmed);
    setGames((prev) => {
      if (prev.some((g) => normalize(g) === norm)) {
        setInputError("duplicate");
        setTimeout(() => setInputError(null), 2000);
        return prev;
      }
      return [...prev, trimmed];
    });
    return true;
  }, []);

  const removeGame = useCallback((index: number) => {
    setGames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearGames = useCallback(() => setGames([]), []);

  return { games, inputError, addGame, removeGame, clearGames, clearError };
}
