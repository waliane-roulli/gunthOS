"use client";

import { useState, useEffect } from "react";

export function useVisitorCountApi(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const alreadyCounted = sessionStorage.getItem("gunth-visited");
    if (alreadyCounted) {
      fetch("/api/visitors")
        .then((r) => r.json())
        .then((d: { count: number }) => setCount(d.count))
        .catch(() => {});
      return;
    }
    sessionStorage.setItem("gunth-visited", "1");
    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => {});
  }, []);

  return count;
}
