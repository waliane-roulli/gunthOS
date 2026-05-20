"use client";

import { useState, useEffect } from "react";

function getTime(): string {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function useOsClock(): string {
  const [time, setTime] = useState(getTime);

  useEffect(() => {
    setTime(getTime());
    const id = setInterval(() => setTime(getTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}
