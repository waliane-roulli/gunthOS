"use client";

import { useState, useEffect, useRef } from "react";

const LS_KEY = "gunthos_wasted_seconds";

function loadStored(): number {
  try {
    return parseInt(localStorage.getItem(LS_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function save(seconds: number) {
  try {
    localStorage.setItem(LS_KEY, String(seconds));
  } catch {}
}

export function formatWastedTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function useWastedTime() {
  const [total, setTotal] = useState(0);
  const sessionStart = useRef(Date.now());
  const storedRef = useRef(0);

  useEffect(() => {
    storedRef.current = loadStored();
    setTotal(storedRef.current);

    const tick = setInterval(() => {
      const sessionSeconds = Math.floor((Date.now() - sessionStart.current) / 1000);
      const newTotal = storedRef.current + sessionSeconds;
      setTotal(newTotal);
      save(newTotal);
    }, 1000);

    return () => {
      clearInterval(tick);
      const sessionSeconds = Math.floor((Date.now() - sessionStart.current) / 1000);
      save(storedRef.current + sessionSeconds);
    };
  }, []);

  return total;
}
