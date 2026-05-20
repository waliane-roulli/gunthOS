"use client";

import { useState, useEffect } from "react";

export function useVisitorCountApi(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => {});
  }, []);

  return count;
}
