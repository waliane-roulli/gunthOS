"use client";

import { useCallback, useState } from "react";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { APPS } from "@/lib/apps";
import { useTheme } from "@/lib/contexts/theme-context";
import { THEMES, type ThemeId } from "@/lib/themes";
import { GUNTH_SHUTDOWN_MESSAGES, GUNTH_REBOOT_MESSAGES, pickRandom } from "@/lib/gunth-jokes";
import { useOsClock } from "@/lib/hooks/use-os-clock";
import { useVisitorCountApi } from "@/lib/hooks/use-visitor-count-api";

export function Taskbar({ onReboot }: { onReboot?: () => void }) {
  const { windows, activeWindowId, focusWindow, restoreWindow, minimizeWindow, openWindow } =
    useWindowManager();
  const { themeId, setTheme } = useTheme();
  const time = useOsClock();
  const visitorCount = useVisitorCountApi();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [shutdownMsg, setShutdownMsg] = useState<string | null>(null);
  const [rebootMsg, setRebootMsg] = useState<string | null>(null);

  const handleTaskbarClick = useCallback(
    (winId: string) => {
      const win = windows.find((w) => w.id === winId);
      if (!win) return;
      if (win.state === "minimized") {
        restoreWindow(winId);
      } else if (activeWindowId === winId) {
        minimizeWindow(winId);
      } else {
        focusWindow(winId);
      }
    },
    [windows, activeWindowId, restoreWindow, minimizeWindow, focusWindow]
  );

  const handleOpenApp = useCallback(
    (slug: string) => {
      const app = APPS.find((a) => a.slug === slug);
      if (!app) return;
      openWindow(app.slug, app.name, app.emoji);
      setStartMenuOpen(false);
    },
    [openWindow]
  );

  return (
    <>
      {/* Reboot dialog */}
      {rebootMsg && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="border-[3px] shadow-[6px_6px_0_rgba(0,0,0,0.5)] min-w-[280px] max-w-[340px]"
            style={{
              backgroundColor: "var(--t-bg)",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            <div
              className="px-2 py-1 border-b-2 border-black text-base tracking-widest font-bold select-none"
              style={{
                background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
                color: "var(--t-titlebar-text)",
              }}
            >
              🔄 Redémarrage de GunthOS
            </div>
            <div className="flex gap-3 items-start p-4">
              <span className="text-3xl shrink-0">🔄</span>
              <p className="text-sm tracking-wide leading-relaxed whitespace-pre-line" style={{ color: "var(--t-text)" }}>
                {rebootMsg}
              </p>
            </div>
            <div className="flex justify-center gap-3 pb-4">
              <button
                onClick={() => {
                  setRebootMsg(null);
                  onReboot?.();
                }}
                className="px-6 py-1 border-[2px] text-base tracking-widest cursor-pointer"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                  borderTopColor: "var(--t-border-light)",
                  borderLeftColor: "var(--t-border-light)",
                  borderBottomColor: "var(--t-border-dark)",
                  borderRightColor: "var(--t-border-dark)",
                }}
              >
                Redémarrer
              </button>
              <button
                onClick={() => setRebootMsg(null)}
                className="px-6 py-1 border-[2px] text-base tracking-widest cursor-pointer"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                  borderTopColor: "var(--t-border-light)",
                  borderLeftColor: "var(--t-border-light)",
                  borderBottomColor: "var(--t-border-dark)",
                  borderRightColor: "var(--t-border-dark)",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shutdown dialog */}
      {shutdownMsg && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="border-[3px] shadow-[6px_6px_0_rgba(0,0,0,0.5)] min-w-[280px] max-w-[340px]"
            style={{
              backgroundColor: "var(--t-bg)",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            <div
              className="px-2 py-1 border-b-2 border-black text-base tracking-widest font-bold select-none"
              style={{
                background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
                color: "var(--t-titlebar-text)",
              }}
            >
              🔌 Arrêt du système GunthOS
            </div>
            <div className="flex gap-3 items-start p-4">
              <span className="text-3xl shrink-0">🔌</span>
              <p className="text-sm tracking-wide leading-relaxed whitespace-pre-line" style={{ color: "var(--t-text)" }}>
                {shutdownMsg}
              </p>
            </div>
            <div className="flex justify-center pb-4">
              <button
                onClick={() => setShutdownMsg(null)}
                className="px-8 py-1 border-[2px] text-base tracking-widest cursor-pointer"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                  borderTopColor: "var(--t-border-light)",
                  borderLeftColor: "var(--t-border-light)",
                  borderBottomColor: "var(--t-border-dark)",
                  borderRightColor: "var(--t-border-dark)",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close start menu */}
      {(startMenuOpen || themeMenuOpen) && (
        <div
          className="fixed inset-0 z-[9000]"
          onClick={() => {
            setStartMenuOpen(false);
            setThemeMenuOpen(false);
          }}
        />
      )}

      {/* Start menu */}
      {startMenuOpen && (
        <div
          className="fixed top-[40px] left-0 w-56 border-[3px] shadow-[4px_4px_0_rgba(0,0,0,0.5)] z-[9001] animate-[slideInUp_0.15s_ease]"
          style={{
            backgroundColor: "var(--t-bg)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-dark)",
          }}
        >
          {/* Logo strip */}
          <div
            className="flex items-end px-2 py-3"
            style={{
              background:
                "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
              height: 48,
              writingMode: "horizontal-tb",
            }}
          >
            <span
              className="text-lg tracking-widest font-bold"
              style={{
                color: "var(--t-titlebar-text)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              🌐 GunthOS
            </span>
          </div>

          <div className="py-1">
            {/* Apps */}
            {APPS.map((app) => (
              <StartMenuItem
                key={app.slug}
                icon={app.emoji}
                label={app.name}
                onClick={() => handleOpenApp(app.slug)}
              />
            ))}

            <div
              className="my-1 mx-2 border-t border-b"
              style={{
                borderColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
              }}
            />

            <StartMenuItem
              icon="⚙️"
              label="Paramètres"
              onClick={() => {
                openWindow("settings", "Paramètres", "⚙️");
                setStartMenuOpen(false);
              }}
            />
            <StartMenuItem
              icon="🎨"
              label="Changer le thème"
              onClick={() => {
                setThemeMenuOpen(true);
                setStartMenuOpen(false);
              }}
            />

            <div
              className="my-1 mx-2 border-t border-b"
              style={{
                borderColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
              }}
            />

            <StartMenuItem
              icon="🔄"
              label="Redémarrer GunthOS"
              onClick={() => {
                setRebootMsg(pickRandom(GUNTH_REBOOT_MESSAGES)!);
                setStartMenuOpen(false);
              }}
            />
            <StartMenuItem
              icon="🔌"
              label="Éteindre GunthOS"
              onClick={() => {
                setShutdownMsg(pickRandom(GUNTH_SHUTDOWN_MESSAGES)!);
                setStartMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Theme menu */}
      {themeMenuOpen && (
        <div
          className="fixed top-[40px] left-0 w-56 border-[3px] shadow-[4px_4px_0_rgba(0,0,0,0.5)] z-[9001]"
          style={{
            backgroundColor: "var(--t-bg)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-dark)",
          }}
        >
          <div
            className="px-2 py-1.5 text-base tracking-widest border-b"
            style={{
              background:
                "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
              color: "var(--t-titlebar-text)",
              fontFamily: "var(--t-font-display)",
              borderBottomColor: "var(--t-border-dark)",
            }}
          >
            🎨 CHOISIR UN THÈME
          </div>
          <div className="py-1">
            {THEMES.map((theme) => (
              <StartMenuItem
                key={theme.id}
                icon={theme.emoji}
                label={theme.name}
                active={theme.id === themeId}
                onClick={() => {
                  setTheme(theme.id as ThemeId);
                  setThemeMenuOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div
        className="h-[40px] border-b-2 flex items-center gap-1 px-1 shrink-0 z-[8999]"
        style={{
          backgroundColor: "var(--t-bg)",
          borderBottomColor: "var(--t-border-dark)",
        }}
      >
        {/* Start button */}
        <button
          onClick={() => {
            setStartMenuOpen((o) => !o);
            setThemeMenuOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 h-[30px] border-[2px] font-bold tracking-wider text-base shrink-0 cursor-pointer select-none"
          style={{
            backgroundColor: startMenuOpen ? "var(--t-bg-dark)" : "var(--t-bg)",
            fontFamily: "var(--t-font-display)",
            color: "var(--t-text)",
            borderTopColor: startMenuOpen ? "var(--t-border-dark)" : "var(--t-border-light)",
            borderLeftColor: startMenuOpen ? "var(--t-border-dark)" : "var(--t-border-light)",
            borderBottomColor: startMenuOpen ? "var(--t-border-light)" : "var(--t-border-dark)",
            borderRightColor: startMenuOpen ? "var(--t-border-light)" : "var(--t-border-dark)",
          }}
        >
          🌐 <span>Démarrer</span>
        </button>

        {/* Separator */}
        <div
          className="w-px h-[28px] shrink-0 mx-0.5"
          style={{
            borderLeft: "1px solid var(--t-border-dark)",
            borderRight: "1px solid var(--t-border-light)",
          }}
        />

        {/* Window buttons */}
        <div className="flex items-center gap-1 flex-1 overflow-hidden">
          {windows.map((win) => {
            const isActive = win.id === activeWindowId && win.state !== "minimized";
            return (
              <button
                key={win.id}
                onClick={() => handleTaskbarClick(win.id)}
                className="flex items-center gap-1 px-2 h-[28px] border-[2px] text-sm tracking-wider truncate min-w-[100px] max-w-[180px] cursor-pointer select-none"
                style={{
                  fontFamily: "var(--t-font-display)",
                  color: "var(--t-text)",
                  backgroundColor: isActive ? "var(--t-bg-dark)" : "var(--t-bg)",
                  borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                  borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                  borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                  borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                }}
              >
                <span className="shrink-0">{win.icon}</span>
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>

        {/* System tray */}
        <div
          className="flex items-center gap-2 px-2 h-[28px] border-[2px] shrink-0 ml-auto text-sm"
          style={{
            backgroundColor: "var(--t-bg)",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            fontFamily: "var(--t-font-display)",
            color: "var(--t-text)",
          }}
        >
          {visitorCount !== null && (
            <span
              title={`${visitorCount} visiteur${visitorCount > 1 ? "s" : ""} depuis le début`}
              className="border-r pr-2"
              style={{ borderColor: "var(--t-border-dark)" }}
            >
              👁 {visitorCount}
            </span>
          )}
          <span title="Volume">🔊</span>
          <span
            className="border-l pl-2"
            style={{ borderColor: "var(--t-border-dark)" }}
          >
            {time}
          </span>
        </div>
      </div>
    </>
  );
}

function StartMenuItem({
  icon,
  label,
  onClick,
  active,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-base text-left cursor-pointer hover:opacity-90"
      style={{
        fontFamily: "var(--t-font-display)",
        color: "var(--t-text)",
        backgroundColor: active ? "var(--t-card-hover)" : "transparent",
      }}
    >
      <span className="text-base">{icon}</span>
      <span className="tracking-wider">{label}</span>
      {active && <span className="ml-auto text-xs">✓</span>}
    </button>
  );
}
