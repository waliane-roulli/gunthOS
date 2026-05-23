"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { MsnLogo } from "./msn-logo";
import { useWindowState, useWindowActions } from "@/lib/contexts/window-manager-context";
import { LAUNCHER_APPS } from "@/apps";
import { useTheme, useSettings } from "@/lib/contexts/settings-context";
import { THEMES, type ThemeId } from "@/lib/themes";
import { GUNTH_SHUTDOWN_MESSAGES, GUNTH_REBOOT_MESSAGES } from "@/lib/gunth-jokes";
import { pickRandom } from "@/lib/utils/random";
import { useOsClock } from "@/lib/hooks/use-os-clock";
import { useVisitorCountApi } from "@/lib/hooks/use-visitor-count-api";
import { useOpenApp } from "@/lib/hooks/use-open-app";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { useUnread } from "@/lib/contexts/unread-context";
import { useRadio, type StationId } from "@/lib/contexts/radio-context";
import { useMobile } from "@/lib/hooks/use-mobile";

export function Taskbar({ onReboot, onShutdown }: { onReboot?: () => void; onShutdown?: () => void }) {
  const { windows, activeWindowId } = useWindowState();
  const { focusWindow, restoreWindow, minimizeWindow } = useWindowActions();
  const { openApp, openNamedWindow } = useOpenApp();
  const { themeId, setTheme } = useTheme();
  const { init, playClick, playWindowOpen, playWindowMinimize } = useSoundContext();
  const { user } = useAuth();
  const { totalUnread } = useUnread();
  const time = useOsClock();
  const visitorCount = useVisitorCountApi();
  const isMobile = useMobile();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [shutdownMsg, setShutdownMsg] = useState<string | null>(null);
  const [rebootMsg, setRebootMsg] = useState<string | null>(null);
  const [trayDrawerOpen, setTrayDrawerOpen] = useState(false);

  const taskbarH = isMobile ? 48 : 40;

  const handleShutdownConfirm = () => {
    setShutdownMsg(null);
    onShutdown?.();
  };

  const handleTaskbarClick = useCallback(
    (winId: string) => {
      init();
      const win = windows.find((w) => w.id === winId);
      if (!win) return;
      if (win.state === "minimized") {
        playWindowOpen();
        restoreWindow(winId);
      } else if (activeWindowId === winId) {
        playWindowMinimize();
        minimizeWindow(winId);
      } else {
        playClick();
        focusWindow(winId);
      }
    },
    [windows, activeWindowId, restoreWindow, minimizeWindow, focusWindow, init, playClick, playWindowOpen, playWindowMinimize]
  );

  const handleOpenApp = useCallback(
    (slug: string) => {
      openApp(slug);
      setStartMenuOpen(false);
    },
    [openApp]
  );

  const closeAllMenus = () => {
    setStartMenuOpen(false);
    setThemeMenuOpen(false);
    setTrayDrawerOpen(false);
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: "var(--t-glass-bg)",
    backdropFilter: "var(--t-glass-blur)",
    WebkitBackdropFilter: "var(--t-glass-blur)",
    borderColor: "var(--t-glass-border, transparent)",
    borderTopColor: "var(--t-border-light)",
    borderLeftColor: "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
    borderRadius: "var(--t-window-radius)",
    boxShadow: "var(--t-dialog-shadow)",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-base)",
  };

  const dialogTitleStyle: React.CSSProperties = {
    background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
    color: "var(--t-titlebar-text)",
    borderRadius: "calc(var(--t-titlebar-radius) - 1px) calc(var(--t-titlebar-radius) - 1px) 0 0",
  };

  const dialogBtnStyle: React.CSSProperties = {
    backgroundColor: "var(--t-bg)",
    color: "var(--t-text)",
    fontFamily: "var(--t-font-display)",
    borderTopColor: "var(--t-border-light)",
    borderLeftColor: "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
  };

  return (
    <>
      {/* Reboot dialog */}
      {rebootMsg && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="border-[3px] min-w-[280px] max-w-[340px]" style={dialogStyle}>
            <div className="px-2 py-1 border-b-2 border-black tracking-widest font-bold select-none" style={dialogTitleStyle}>
              🔄 Redémarrage de GunthOS
            </div>
            <div className="flex gap-3 items-start p-4">
              <span className="text-3xl shrink-0">🔄</span>
              <p className="tracking-wide leading-relaxed whitespace-pre-line" style={{ color: "var(--t-text)" }}>{rebootMsg}</p>
            </div>
            <div className="flex justify-center gap-3 pb-4">
              <button onClick={() => { setRebootMsg(null); onReboot?.(); }} className="px-6 py-1 border-[2px] tracking-widest cursor-pointer" style={dialogBtnStyle}>Redémarrer</button>
              <button onClick={() => setRebootMsg(null)} className="px-6 py-1 border-[2px] tracking-widest cursor-pointer" style={dialogBtnStyle}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Shutdown dialog */}
      {shutdownMsg && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="border-[3px] min-w-[280px] max-w-[340px]" style={dialogStyle}>
            <div className="px-2 py-1 border-b-2 border-black tracking-widest font-bold select-none" style={dialogTitleStyle}>
              🔌 Arrêt du système GunthOS
            </div>
            <div className="flex gap-3 items-start p-4">
              <span className="text-3xl shrink-0">🔌</span>
              <p className="tracking-wide leading-relaxed whitespace-pre-line" style={{ color: "var(--t-text)" }}>{shutdownMsg}</p>
            </div>
            <div className="flex justify-center gap-3 pb-4">
              <button onClick={handleShutdownConfirm} className="px-6 py-1 border-[2px] tracking-widest cursor-pointer" style={dialogBtnStyle}>🔌 Éteindre</button>
              <button onClick={() => setShutdownMsg(null)} className="px-6 py-1 border-[2px] tracking-widest cursor-pointer" style={dialogBtnStyle}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(startMenuOpen || themeMenuOpen || trayDrawerOpen) && (
        <div className="fixed inset-0 z-[9000]" onClick={closeAllMenus} />
      )}

      {/* Start menu */}
      {startMenuOpen && (
        <div
          className="fixed left-0 border-[3px] z-[9001]"
          style={{
            top: taskbarH,
            width: isMobile ? "100vw" : 224,
            backgroundColor: "var(--t-glass-bg, var(--t-bg))",
            backdropFilter: "var(--t-glass-blur)",
            WebkitBackdropFilter: "var(--t-glass-blur)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-dark)",
            borderRadius: isMobile ? "0 0 var(--t-window-radius) var(--t-window-radius)" : "var(--t-window-radius)",
            boxShadow: "var(--t-window-shadow)",
            animation: "slideInDown 0.15s ease",
          }}
        >
          {/* Logo strip */}
          <div
            className="flex items-end px-2 py-3"
            style={{
              background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
              height: 48,
            }}
          >
            <span className="tracking-widest font-bold" style={{ color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)" }}>
              🌐 GunthOS
            </span>
          </div>

          <div className="py-1 overflow-y-auto" style={{ maxHeight: isMobile ? "60vh" : "calc(100vh - 80px)" }}>
            {LAUNCHER_APPS.map((app) => (
              <StartMenuItem
                key={app.slug}
                icon={app.iconComponent ? <app.iconComponent size={18} /> : (app.iconNode ?? app.emoji)}
                label={app.name}
                onClick={() => handleOpenApp(app.slug)}
                tall={isMobile}
              />
            ))}

            <div className="my-1 mx-2 border-t border-b" style={{ borderColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)" }} />

            <StartMenuItem icon="⚙️" label="Paramètres" onClick={() => handleOpenApp("settings")} tall={isMobile} />
            <StartMenuItem
              icon="🎨"
              label="Changer le thème"
              onClick={() => { setThemeMenuOpen(true); setStartMenuOpen(false); }}
              tall={isMobile}
            />

            <div className="my-1 mx-2 border-t border-b" style={{ borderColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)" }} />

            <StartMenuItem
              icon={user ? "👤" : "🔑"}
              label={user ? `Profil (${user.name})` : "Connexion / Inscription"}
              onClick={() => { openNamedWindow("login", "GUNTH.EXE — Connexion", "🔑"); setStartMenuOpen(false); }}
              tall={isMobile}
            />

            <div className="my-1 mx-2 border-t border-b" style={{ borderColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)" }} />

            <StartMenuItem
              icon="🔄"
              label="Redémarrer GunthOS"
              onClick={() => { setRebootMsg(pickRandom(GUNTH_REBOOT_MESSAGES)!); setStartMenuOpen(false); }}
              tall={isMobile}
            />
            <StartMenuItem
              icon="🔌"
              label="Éteindre GunthOS"
              onClick={() => { setShutdownMsg(pickRandom(GUNTH_SHUTDOWN_MESSAGES)!); setStartMenuOpen(false); }}
              tall={isMobile}
            />
          </div>
        </div>
      )}

      {/* Theme menu */}
      {themeMenuOpen && (
        <div
          className="fixed left-0 border-[3px] z-[9001]"
          style={{
            top: taskbarH,
            width: isMobile ? "100vw" : 224,
            backgroundColor: "var(--t-glass-bg, var(--t-bg))",
            backdropFilter: "var(--t-glass-blur)",
            WebkitBackdropFilter: "var(--t-glass-blur)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-dark)",
            borderRadius: isMobile ? "0 0 var(--t-window-radius) var(--t-window-radius)" : "var(--t-window-radius)",
            boxShadow: "var(--t-window-shadow)",
          }}
        >
          <div
            className="px-2 py-1.5 tracking-widest border-b"
            style={{
              background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
              color: "var(--t-titlebar-text)",
              fontFamily: "var(--t-font-display)",
              fontSize: "var(--t-text-base)",
              borderBottomColor: "var(--t-border-dark)",
              borderRadius: "calc(var(--t-titlebar-radius) - 1px) calc(var(--t-titlebar-radius) - 1px) 0 0",
            }}
          >
            🎨 CHOISIR UN THÈME
          </div>
          <div className="py-1 overflow-y-auto" style={{ maxHeight: isMobile ? "60vh" : "calc(100vh - 80px)" }}>
            {THEMES.map((theme) => (
              <StartMenuItem
                key={theme.id}
                icon={theme.emoji}
                label={theme.name}
                active={theme.id === themeId}
                onClick={() => { setTheme(theme.id as ThemeId); setThemeMenuOpen(false); }}
                tall={isMobile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tray drawer — mobile only */}
      {trayDrawerOpen && isMobile && (
        <div
          className="fixed right-0 border-[3px] z-[9001] p-3 flex flex-col gap-3"
          style={{
            top: taskbarH,
            minWidth: 180,
            backgroundColor: "var(--t-glass-bg, var(--t-bg))",
            backdropFilter: "var(--t-glass-blur)",
            WebkitBackdropFilter: "var(--t-glass-blur)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-dark)",
            borderRadius: "0 0 0 var(--t-window-radius)",
            boxShadow: "var(--t-window-shadow)",
            animation: "slideInDown 0.15s ease",
          }}
        >
          {visitorCount !== null && (
            <span
              title={`${visitorCount} visiteur${visitorCount > 1 ? "s" : ""}`}
              style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-sm)", color: "var(--t-text)" }}
            >
              👁 {visitorCount} visiteur{visitorCount > 1 ? "s" : ""}
            </span>
          )}
          <RadioTrayPlayer />
          <VolumeTray />
        </div>
      )}

      {/* ─── Taskbar ─── */}
      <div
        className="border-b-2 flex items-center gap-1 px-1 shrink-0 z-[8999]"
        style={{
          height: taskbarH,
          backgroundColor: "var(--t-taskbar-bg)",
          backdropFilter: "var(--t-taskbar-blur)",
          WebkitBackdropFilter: "var(--t-taskbar-blur)",
          borderBottomColor: "var(--t-border-dark)",
        }}
      >
        {/* Start button */}
        <button
          onClick={() => {
            init();
            playClick();
            setStartMenuOpen((o) => !o);
            setThemeMenuOpen(false);
            setTrayDrawerOpen(false);
          }}
          className="flex items-center justify-center gap-1.5 border-[2px] font-bold tracking-wider shrink-0 cursor-pointer select-none"
          style={{
            width: isMobile ? 48 : undefined,
            height: isMobile ? 40 : 30,
            paddingLeft: isMobile ? 0 : 12,
            paddingRight: isMobile ? 0 : 12,
            background: startMenuOpen ? "var(--t-bg-dark)" : "var(--t-start-btn-bg)",
            fontFamily: "var(--t-font-display)",
            fontSize: isMobile ? "var(--t-text-lg)" : "var(--t-text-sm)",
            color: "var(--t-start-btn-text)",
            borderTopColor: startMenuOpen ? "var(--t-border-dark)" : "var(--t-border-light)",
            borderLeftColor: startMenuOpen ? "var(--t-border-dark)" : "var(--t-border-light)",
            borderBottomColor: startMenuOpen ? "var(--t-border-light)" : "var(--t-border-dark)",
            borderRightColor: startMenuOpen ? "var(--t-border-light)" : "var(--t-border-dark)",
            borderRadius: "var(--t-window-radius)",
          }}
        >
          {isMobile ? "≡" : <><span>🌐</span><span>Démarrer</span></>}
        </button>

        {/* Separator */}
        {!isMobile && (
          <div
            className="w-px shrink-0 mx-0.5"
            style={{
              height: 28,
              borderLeft: "1px solid var(--t-border-dark)",
              borderRight: "1px solid var(--t-border-light)",
            }}
          />
        )}

        {/* Window buttons */}
        <div
          className="flex items-center gap-1 flex-1 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {windows.map((win) => {
            const isActive = win.id === activeWindowId && win.state !== "minimized";
            return (
              <button
                key={win.id}
                onClick={() => handleTaskbarClick(win.id)}
                className="flex items-center justify-center gap-1 border-[2px] tracking-wider shrink-0 cursor-pointer select-none"
                style={{
                  height: isMobile ? 36 : 28,
                  width: isMobile ? 44 : undefined,
                  minWidth: isMobile ? 44 : 100,
                  maxWidth: isMobile ? 44 : 180,
                  paddingLeft: isMobile ? 0 : 8,
                  paddingRight: isMobile ? 0 : 8,
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-sm)",
                  color: "var(--t-text)",
                  backgroundColor: isActive ? "var(--t-bg-dark)" : "var(--t-bg)",
                  borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                  borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                  borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                  borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                }}
                title={win.title}
              >
                <span className="shrink-0" style={{ lineHeight: 0, display: "flex", alignItems: "center" }}>
                  {win.icon}
                </span>
                {!isMobile && <span className="truncate">{win.title}</span>}
              </button>
            );
          })}
        </div>

        {/* System tray */}
        <div
          className="flex items-center gap-2 px-2 border-[2px] shrink-0 ml-auto"
          style={{
            height: isMobile ? 36 : 28,
            backgroundColor: "var(--t-bg)",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            fontFamily: "var(--t-font-display)",
            fontSize: "var(--t-text-xs)",
            color: "var(--t-text)",
          }}
        >
          {/* Desktop-only tray items */}
          {!isMobile && (
            <>
              {visitorCount !== null && (
                <span
                  title={`${visitorCount} visiteur${visitorCount > 1 ? "s" : ""} depuis le début`}
                  className="border-r pr-2"
                  style={{ borderColor: "var(--t-border-dark)" }}
                >
                  👁 {visitorCount}
                </span>
              )}
              <button
                title="GunthMessenger™ — Ouvrir la messagerie"
                onClick={() => openApp("msn")}
                className="cursor-pointer select-none hover:opacity-80 border-r pr-2"
                style={{ borderColor: "var(--t-border-dark)", background: "none", padding: 0, display: "flex", alignItems: "center", lineHeight: 0, position: "relative" }}
              >
                <MsnLogo size={20} />
                {totalUnread > 0 && (
                  <span
                    style={{
                      position: "absolute", top: -4, right: 4,
                      background: "#cc0000", color: "white", borderRadius: "50%",
                      width: 13, height: 13, fontSize: 8, fontWeight: "bold",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Arial, sans-serif", border: "1px solid white", lineHeight: 1,
                    }}
                  >
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </button>
              <RadioTrayPlayer />
              <VolumeTray />
            </>
          )}

          {/* User button — always visible */}
          <button
            title={user ? `Connecté : ${user.email}` : "Accès invité — cliquez pour vous connecter"}
            onClick={() => openNamedWindow("login", "GUNTH.EXE — Connexion", "🔑")}
            className={`cursor-pointer select-none hover:opacity-80 ${!isMobile ? "border-r pr-2" : ""}`}
            style={{ borderColor: "var(--t-border-dark)", background: "none", fontFamily: "var(--t-font-display)", color: "var(--t-text)", fontSize: "var(--t-text-base)" }}
          >
            {isMobile ? (user ? "👤" : "👤") : (user ? `👤 ${user.name}` : "👤 Invité")}
          </button>

          {/* Mobile: MSN badge inline */}
          {isMobile && totalUnread > 0 && (
            <button
              onClick={() => openApp("msn")}
              style={{ background: "none", padding: 0, display: "flex", alignItems: "center", lineHeight: 0, position: "relative", cursor: "pointer" }}
            >
              <MsnLogo size={18} />
              <span
                style={{
                  position: "absolute", top: -4, right: -2,
                  background: "#cc0000", color: "white", borderRadius: "50%",
                  width: 12, height: 12, fontSize: 7, fontWeight: "bold",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Arial, sans-serif", border: "1px solid white", lineHeight: 1,
                }}
              >
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            </button>
          )}

          {/* Mobile: tray drawer toggle */}
          {isMobile && (
            <button
              onClick={() => { setTrayDrawerOpen((o) => !o); setStartMenuOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-sm)", color: "var(--t-text)", padding: "0 2px" }}
              title="Plus…"
            >
              {trayDrawerOpen ? "✕" : "•••"}
            </button>
          )}

          <span className="border-l pl-2" style={{ borderColor: "var(--t-border-dark)" }}>
            {time}
          </span>
        </div>
      </div>
    </>
  );
}

function VolumeTray() {
  const { settings, setMasterVolume } = useSettings();
  const { currentStation } = useRadio();
  const volume = settings.masterVolume;
  const setVolume = setMasterVolume;
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const icon = volume === 0 ? "🔇" : volume < 40 ? "🔈" : volume < 75 ? "🔉" : "🔊";

  const btnRect = btnRef.current?.getBoundingClientRect();
  const popupRight = btnRect ? window.innerWidth - btnRect.right - 8 : 8;
  const popupTop = btnRect ? btnRect.bottom + 4 : 44;

  return (
    <div className="border-l pl-2" style={{ borderColor: "var(--t-border-dark)" }}>
      <button
        ref={btnRef}
        title={`Volume : ${volume}%`}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--t-text)", fontFamily: "var(--t-font-display)",
          fontSize: "var(--t-text-sm)", padding: 0, lineHeight: 1,
          opacity: currentStation ? 1 : 0.6,
        }}
      >
        {icon}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9000]" onClick={() => setOpen(false)} />
          <div
            className="fixed border-[2px] z-[9001] flex flex-col items-center gap-2 py-3 px-3"
            style={{
              top: popupTop,
              right: popupRight,
              width: 44,
              backgroundColor: "var(--t-bg)",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              boxShadow: "var(--t-window-shadow)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            <span style={{ fontSize: "var(--t-text-xs)" }}>{icon}</span>

            <div className="relative flex justify-center" style={{ height: 80, width: 16 }}>
              {/* Track */}
              <div
                className="absolute border-[2px]"
                style={{
                  left: "50%", transform: "translateX(-50%)",
                  width: 8, height: "100%",
                  borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
                  borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
                  backgroundColor: "var(--t-app-bg)", cursor: "pointer",
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = 1 - (e.clientY - rect.top) / rect.height;
                  setVolume(Math.round(Math.max(0, Math.min(1, ratio)) * 100));
                }}
              >
                <div
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${volume}%`,
                    background: "linear-gradient(to top, var(--t-titlebar-from), var(--t-titlebar-to))",
                  }}
                />
              </div>

              {/* Thumb */}
              <div
                className="absolute border-[2px] cursor-pointer"
                style={{
                  left: "50%", transform: "translateX(-50%)",
                  width: 16, height: 8,
                  top: `calc(${100 - volume}% - 4px)`,
                  backgroundColor: "var(--t-bg)",
                  borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
                  borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
                  touchAction: "none",
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  const track = e.currentTarget.parentElement!;
                  const onMove = (me: PointerEvent) => {
                    const rect = track.getBoundingClientRect();
                    const ratio = 1 - (me.clientY - rect.top) / rect.height;
                    setVolume(Math.round(Math.max(0, Math.min(1, ratio)) * 100));
                  };
                  const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }}
              />
            </div>

            <span className="tracking-widest tabular-nums" style={{ color: "var(--t-accent)" }}>
              {volume}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function RadioTrayPlayer() {
  const { currentStation, isPlaying, isBuffering, next, prev, stop, play } = useRadio();
  const { openApp } = useOpenApp();

  const btnStyle: React.CSSProperties = {
    background: "none", border: "none",
    color: "var(--t-text)", fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-xs)", cursor: "pointer",
    padding: "0 2px", lineHeight: 1,
  };

  if (!currentStation && !isBuffering) {
    return (
      <button
        title="GunthRadio™ — Ouvrir"
        style={{ ...btnStyle, opacity: 0.6 }}
        className="border-r pr-2 hover:opacity-100"
        onClick={() => openApp("radio")}
      >
        📻
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 border-r pr-2" style={{ borderColor: "var(--t-border-dark)" }}>
      <button style={btnStyle} title="Station précédente" onClick={prev}>⏮</button>
      <button
        style={btnStyle}
        title={isPlaying ? "Stop" : "Lecture"}
        onClick={() => {
          if (isPlaying) stop();
          else if (currentStation) play(currentStation.id as StationId);
        }}
      >
        {isBuffering ? "⏳" : isPlaying ? "■" : "▶"}
      </button>
      <button style={btnStyle} title="Station suivante" onClick={next}>⏭</button>
      <span
        className="tracking-wider max-w-[90px] truncate cursor-pointer"
        style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}
        title={`GunthRadio™ — ${currentStation?.name}`}
        onClick={() => openApp("radio")}
      >
        {currentStation?.emoji} {currentStation?.name}
      </span>
    </div>
  );
}

function StartMenuItem({
  icon,
  label,
  onClick,
  active,
  tall,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  tall?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 text-left cursor-pointer hover:opacity-90 overflow-hidden"
      style={{
        paddingTop: tall ? 12 : 6,
        paddingBottom: tall ? 12 : 6,
        fontFamily: "var(--t-font-display)",
        fontSize: tall ? "var(--t-text-base)" : "var(--t-text-sm)",
        color: "var(--t-text)",
        backgroundColor: active ? "var(--t-card-hover)" : "transparent",
      }}
    >
      <span className="shrink-0 icon-constrained">{icon}</span>
      <span className="tracking-wider truncate">{label}</span>
      {active && <span className="ml-auto shrink-0">✓</span>}
    </button>
  );
}
