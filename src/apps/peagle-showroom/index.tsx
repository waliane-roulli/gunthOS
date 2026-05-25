"use client";

import { useCallback } from "react";
import type { AppProps } from "@/types";
import { PeagleAssetsGrid, PEAGLE_LIVE_THEME_KEY } from "@/apps/peagle/components/Showroom";
import { DEFAULT_DEV_CONFIG } from "@/apps/peagle/components/DevPanel";
import type { DevConfig } from "@/apps/peagle/components/DevPanel";
import { PG } from "@/apps/peagle/styles";

export function PeagleShowroomApp({ windowId: _windowId }: AppProps) {
  const cfg: DevConfig = { ...DEFAULT_DEV_CONFIG };

  const handleApplyTheme = useCallback((themeId: string) => {
    localStorage.setItem(PEAGLE_LIVE_THEME_KEY, themeId);
    window.dispatchEvent(
      new StorageEvent("storage", { key: PEAGLE_LIVE_THEME_KEY, newValue: themeId })
    );
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: PG.bg,
        fontFamily: "var(--font-press-start), monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px 14px",
          borderBottom: `1px solid ${PG.border}`,
          background: PG.surface,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 8, color: PG.purple, letterSpacing: "0.08em" }}>
          🎨 PEAGLE SHOWROOM
        </span>
        <span style={{ fontSize: 7, color: PG.textMuted, flex: 1 }}>
          — thèmes &amp; assets
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        <PeagleAssetsGrid
          cfg={cfg}
          onLaunch={() => {/* lecture seule — le lancement se fait depuis le DevPanel */}}
          onApplyTheme={handleApplyTheme}
        />
      </div>
    </div>
  );
}
