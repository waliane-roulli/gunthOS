"use client";

import dynamic from "next/dynamic";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { GAME_THEMES } from "./game-themes";
import type { AppProps } from "@/types";
import type { PloufThemeId } from "./game-themes";

const PloufApp = dynamic(
  () => import("./plouf-app").then((m) => ({ default: m.PloufApp })),
  { ssr: false }
);

export function PloufPloufApp(_: AppProps) {
  const [appThemeId] = useLocalStorage<PloufThemeId | null>("ploufPloufGameTheme", null);
  const appTheme = appThemeId ? GAME_THEMES.find((t) => t.id === appThemeId) : null;
  const appThemeStyle = appTheme ? appTheme.vars : {};

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        ...appThemeStyle,
        backgroundColor: "var(--t-bg)",
      }}
    >
      <PloufApp embedded />
    </div>
  );
}
