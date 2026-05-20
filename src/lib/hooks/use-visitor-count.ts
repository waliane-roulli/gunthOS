"use client";

import { useState, useEffect } from "react";

export function useVisitorCount(): string {
  const [count, setCount] = useState("000000");

  useEffect(() => {
    try {
      const n = parseInt(localStorage.getItem("visitorCount") ?? "0") + 1;
      localStorage.setItem("visitorCount", String(n));
      setCount(String(n).padStart(6, "0"));
    } catch {
      setCount("001337");
    }
  }, []);

  return count;
}
