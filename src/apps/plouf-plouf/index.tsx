"use client";

import dynamic from "next/dynamic";
import type { AppProps } from "@/types";

const PloufApp = dynamic(
  () => import("./plouf-app").then((m) => ({ default: m.PloufApp })),
  { ssr: false }
);

export function PloufPloufApp(_: AppProps) {
  return (
    <div
      className="min-h-full relative"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(173,216,255,0.25) 0%, transparent 50%), linear-gradient(180deg, var(--t-page-from) 0%, var(--t-page-to) 100%)",
      }}
    >
      <PloufApp embedded />
    </div>
  );
}
