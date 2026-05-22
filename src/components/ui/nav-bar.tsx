"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { LAUNCHER_APPS } from "@/apps";
import { useSeenApps } from "@/lib/contexts/seen-apps-context";

interface NavBarProps {
  onSettingsClick?: () => void;
}

export function NavBar({ onSettingsClick }: NavBarProps) {
  const pathname = usePathname();
  const { seen, markSeen } = useSeenApps();

  return (
    <div
      className="w-full border-b-2 flex items-center justify-between px-2 py-1 gap-2 z-50 shadow-[0_2px_0_rgba(0,0,0,0.15)]"
      style={{
        backgroundColor: "var(--t-bg)",
        borderBottomColor: "var(--t-border-dark)",
      }}
    >
      {/* Home button */}
      <Link
        href="/"
        className="flex items-center gap-1.5 px-2 py-0.5 border-[2px] tracking-wider hover:opacity-90 active:opacity-70 select-none whitespace-nowrap transition-none"
        style={{
          backgroundColor: "var(--t-bg)",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
          color: "var(--t-accent)",
          fontFamily: "var(--t-font-display)",
          fontSize: "1rem",
        }}
      >
        🌐 <span>GunthOS</span>
      </Link>

      {/* Separator */}
      <div
        className="w-px self-stretch mx-1 shrink-0"
        style={{ backgroundColor: "var(--t-border-dark)" }}
      />

      {/* App switcher */}
      <div className="flex items-center gap-1 flex-wrap flex-1">
        {LAUNCHER_APPS.filter((app) => app.href).map((app) => {
          const isActive = pathname === app.href;
          const showBadge = app.badge && !seen.has(app.slug);
          return (
            <Link
              key={app.slug}
              href={app.href as Route}
              onClick={() => { if (showBadge) markSeen(app.slug); }}
              className="flex items-center gap-1 px-2 py-0.5 border-[2px] tracking-wider select-none whitespace-nowrap transition-none"
              style={{
                fontFamily: "var(--t-font-display)",
                fontSize: "1rem",
                backgroundColor: isActive ? "var(--t-bg-light)" : "var(--t-bg)",
                color: isActive ? "var(--t-accent)" : "var(--t-text)",
                borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                cursor: isActive ? "default" : "pointer",
              }}
            >
              <span>{app.emoji}</span>
              <span>{app.name.toUpperCase()}</span>
              {showBadge && (
                <span
                  className="font-bold text-xs px-0.5 border border-black leading-none py-px"
                  style={{
                    backgroundColor: "var(--t-badge-bg)",
                    color: "var(--t-badge-text)",
                  }}
                >
                  {app.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Settings button */}
      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-1 px-2 py-0.5 border-[2px] tracking-wider select-none whitespace-nowrap transition-none hover:opacity-90 active:opacity-70"
          style={{
            fontFamily: "var(--t-font-display)",
            fontSize: "1rem",
            backgroundColor: "var(--t-bg)",
            color: "var(--t-text)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
          title="Paramètres"
        >
          ⚙️ <span>Paramètres</span>
        </button>
      )}
    </div>
  );
}
