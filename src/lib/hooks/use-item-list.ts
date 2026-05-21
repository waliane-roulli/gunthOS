"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { normalize } from "@/lib/utils/normalize";

export type InputError = "empty" | "duplicate" | null;

export function useItemList() {
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
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) {
        setErrorFor("empty", 800);
        return false;
      }
      let anyDuplicate = false;
      let addedCount = 0;
      setGames((prev) => {
        let next = prev;
        for (const part of parts) {
          const norm = normalize(part);
          if (next.some((g) => normalize(g) === norm)) {
            anyDuplicate = true;
            continue;
          }
          next = [...next, part];
          addedCount++;
        }
        return next;
      });
      if (addedCount === 0) {
        setErrorFor("duplicate", 2000);
        return false;
      }
      return true;
    },
    [setErrorFor]
  );

  const importGames = useCallback((items: string[]) => {
    setGames(items.filter((s) => s.trim().length > 0));
    clearError();
  }, [clearError]);

  const removeGame = useCallback((index: number) => {
    setGames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearGames = useCallback(() => setGames([]), []);

  return { games, inputError, addGame, removeGame, clearGames, clearError, importGames };
}
