"use client";

import { useState, useEffect } from "react";

export function useOsClock(): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}
