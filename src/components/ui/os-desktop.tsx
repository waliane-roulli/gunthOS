"use client";

import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { APPS } from "@/lib/apps";
import { useTheme } from "@/lib/contexts/theme-context";

const WALLPAPERS: Record<string, string> = {
  win95: `
    radial-gradient(circle at 20% 20%, rgba(173,216,255,0.5) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(100,180,255,0.4) 0%, transparent 40%),
    linear-gradient(135deg, #4a8fc4 0%, #2e6da4 40%, #1a5c8f 100%)
  `,
  dark: `
    radial-gradient(circle at 30% 30%, rgba(30,50,100,0.8) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(10,20,60,0.9) 0%, transparent 50%),
    linear-gradient(135deg, #080818 0%, #0d0d30 100%)
  `,
  vaporwave: `
    linear-gradient(to bottom, #0d0820 0%, #1a0f40 40%, #2d1b69 70%, #3d1b69 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 40px,
      rgba(185,103,255,0.15) 40px,
      rgba(185,103,255,0.15) 41px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 60px,
      rgba(185,103,255,0.1) 60px,
      rgba(185,103,255,0.1) 61px
    )
  `,
  hacker: `
    repeating-linear-gradient(
      0deg,
      rgba(0,255,65,0.04) 0px,
      rgba(0,255,65,0.04) 1px,
      transparent 1px,
      transparent 20px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0,255,65,0.02) 0px,
      rgba(0,255,65,0.02) 1px,
      transparent 1px,
      transparent 20px
    ),
    #000500
  `,
};

export function OsDesktop() {
  const { openWindow } = useWindowManager();
  const { themeId } = useTheme();

  const wallpaper = WALLPAPERS[themeId] ?? WALLPAPERS.win95!;

  function handleOpenApp(slug: string) {
    const app = APPS.find((a) => a.slug === slug);
    if (!app) return;
    openWindow(app.slug, app.name, app.emoji);
  }

  function handleOpenSettings() {
    openWindow("settings", "Paramètres", "⚙️");
  }

  return (
    <div
      className="flex-1 relative overflow-hidden select-none"
      style={{ background: wallpaper }}
    >
      {/* Vaporwave sun decoration */}
      {themeId === "vaporwave" && (
        <div
          className="absolute bottom-[48px] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 300,
            height: 150,
            background:
              "linear-gradient(to bottom, #ff71ce 0%, #b967ff 40%, transparent 100%)",
            borderRadius: "150px 150px 0 0",
            opacity: 0.15,
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Hacker scanlines */}
      {themeId === "hacker" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
            zIndex: 0,
          }}
        />
      )}

      {/* Desktop icons */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
        {APPS.map((app) => (
          <DesktopIcon
            key={app.slug}
            emoji={app.emoji}
            label={app.name}
            badge={app.badge}
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
        <DesktopIcon emoji="🗑️" label="Corbeille (pleine)" onClick={() => {}} />
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
  emoji: string;
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
      className="group flex flex-col items-center gap-1 w-[72px] p-1.5 focus:outline-none cursor-default"
    >
      <div className="relative">
        <span
          className="text-[2.8rem] leading-none drop-shadow-[2px_3px_4px_rgba(0,0,0,0.5)] group-focus:opacity-80"
          style={{
            filter:
              "drop-shadow(1px 1px 2px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(0,0,0,0.3))",
          }}
        >
          {emoji}
        </span>
        {badge && (
          <span
            className="absolute -top-1 -right-1 text-[0.5rem] font-bold px-1 border border-black animate-[blink_0.8s_step-end_infinite]"
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
        className="text-center text-[0.65rem] leading-tight px-0.5 max-w-full break-words"
        style={{
          fontFamily: "var(--t-font-display)",
          color: "white",
          textShadow: "1px 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)",
          backgroundColor: "group-focus:rgba(0,100,200,0.5)",
        }}
      >
        <span className="group-focus:bg-[rgba(0,80,180,0.7)] group-focus:text-white px-0.5">
          {label}
        </span>
      </span>
    </button>
  );
}
