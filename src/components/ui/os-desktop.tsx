"use client";

import { useCallback } from "react";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { APPS } from "@/lib/apps";
import { useSettings } from "@/lib/contexts/settings-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useUnread } from "@/lib/contexts/unread-context";
import { WALLPAPER_MAP, DEFAULT_WALLPAPER_ID } from "@/lib/wallpapers";
import { WallpaperDecoration } from "./wallpaper-decorations";

export function OsDesktop() {
  const { openWindow, openApp } = useWindowManager();
  const { settings } = useSettings();
  const { init, playWindowOpen } = useSoundContext();
  const { totalUnread } = useUnread();

  const wallpaper = (settings.wallpaperId ? WALLPAPER_MAP.get(settings.wallpaperId) : undefined) ?? WALLPAPER_MAP.get(DEFAULT_WALLPAPER_ID)!;

  const handleOpenApp = useCallback(
    (slug: string) => {
      init();
      playWindowOpen();
      openApp(slug);
    },
    [openApp, init, playWindowOpen]
  );

  const handleOpenSettings = useCallback(() => {
    init();
    playWindowOpen();
    openWindow("settings", "Paramètres GunthOS", "⚙️");
  }, [openWindow, init, playWindowOpen]);

  return (
    <div
      className="flex-1 relative overflow-hidden select-none"
      style={wallpaper.style}
    >
      {/* Animated wallpaper decoration layer */}
      {wallpaper.decorationKey && (
        <WallpaperDecoration
          decorationKey={wallpaper.decorationKey}
          wallpaperId={wallpaper.id}
        />
      )}

      {/* Desktop icons */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
        {APPS.map((app) => (
          <DesktopIcon
            key={app.slug}
            emoji={app.iconNode ?? app.emoji}
            label={app.name}
            badge={app.slug === "msn" && totalUnread > 0 ? String(totalUnread > 9 ? "9+" : totalUnread) : app.badge}
            onClick={() => handleOpenApp(app.slug)}
          />
        ))}
        {/* My Computer */}
        <DesktopIcon
          emoji="🖥️"
          label="Mon Ordi"
          onClick={() => openWindow("my-computer", "Mon Ordinateur", "🖥️")}
        />
        {/* Settings */}
        <DesktopIcon
          emoji="⚙️"
          label="Paramètres"
          onClick={handleOpenSettings}
        />
      </div>

      {/* Recycle bin top-right */}
      <div className="absolute top-6 right-6 z-10">
        <DesktopIcon emoji="🗑️" label="Corbeille (pleine)" onClick={() => openWindow("trash", "Corbeille", "🗑️")} />
      </div>
    </div>
  );
}

function DesktopIcon({
  emoji,
  label,
  badge,
  onClick,
}: {
  emoji: string | import("react").ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onDoubleClick={onClick}
      onClick={(e) => {
        if (e.detail === 1) e.currentTarget.focus();
      }}
      className="group flex flex-col items-center gap-1 w-[110px] p-1.5 focus:outline-none cursor-default"
    >
      <div className="relative">
        {typeof emoji === "string" ? (
          <span
            className="text-[2.8rem] leading-none drop-shadow-[2px_3px_4px_rgba(0,0,0,0.5)] group-focus:opacity-80"
            style={{
              filter:
                "drop-shadow(1px 1px 2px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(0,0,0,0.3))",
            }}
          >
            {emoji}
          </span>
        ) : (
          <div className="leading-none group-focus:opacity-80" style={{ filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.6))" }}>
            {emoji}
          </div>
        )}
        {badge && (
          <span
            className="absolute -top-1 -right-1 text-xs font-bold px-1 border border-black"
            style={{
              backgroundColor: "var(--t-badge-bg)",
              color: "var(--t-badge-text)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <span
        className="text-center text-sm leading-tight px-0.5 max-w-full break-words"
        style={{
          fontFamily: "var(--t-font-display)",
          color: "white",
          textShadow: "1px 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)",
        }}
      >
        <span className="group-focus:bg-[rgba(0,80,180,0.7)] group-focus:text-white px-0.5">
          {label}
        </span>
      </span>
    </button>
  );
}
