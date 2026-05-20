"use client";

import { useEffect } from "react";
import { GUNTH_TITLES, pickRandom } from "@/lib/gunth-jokes";

export function GunthTitle() {
  useEffect(() => {
    const set = () => {
      document.title = pickRandom(GUNTH_TITLES);
    };
    set();
    const id = setInterval(set, 8_000);
    return () => clearInterval(id);
  }, []);

  return null;
}
