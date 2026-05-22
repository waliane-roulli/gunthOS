"use client";

import dynamic from "next/dynamic";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { THEMES } from "@/lib/themes";
import type { AppProps } from "@/types";
import type { ThemeId } from "@/lib/themes";

const PloufApp = dynamic(
  () => import("./plouf-app").then((m) => ({ default: m.PloufApp })),
  { ssr: false }
);

export function PloufPloufApp(_: AppProps) {
  const [appThemeId] = useLocalStorage<ThemeId | null>("ploufPloufTheme", null);
  const appTheme = appThemeId ? THEMES.find((t) => t.id === appThemeId) : null;
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
