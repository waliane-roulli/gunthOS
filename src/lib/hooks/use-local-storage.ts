"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) setStored(JSON.parse(item) as T);
    } catch {}
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key]
  );

  return [stored, setValue];
}
