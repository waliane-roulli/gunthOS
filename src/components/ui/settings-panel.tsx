"use client";

import { useTheme } from "@/lib/contexts/theme-context";
import { THEMES, type ThemeId } from "@/lib/themes";
import { RetroTitlebarBtn } from "./retro-titlebar-btn";

interface SettingsPanelProps {
  onClose: () => void;
  embedded?: boolean;
}

export function SettingsPanel({ onClose, embedded = false }: SettingsPanelProps) {
  const { themeId, setTheme } = useTheme();

  const content = (
    <div className="p-5">
      {/* Section titre */}
      <div
        className="text-sm tracking-widest mb-4 pb-1 border-b"
        style={{
          color: "var(--t-text-muted)",
          fontFamily: "var(--t-font-display)",
          borderBottomColor: "var(--t-border-dark)",
        }}
      >
        🎨 THÈME VISUEL — PANNEAU DE CONFIGURATION GUNTH
      </div>

      {/* Grille thèmes */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {THEMES.map((theme) => {
          const isActive = theme.id === themeId;
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              className="p-3 border-[2px] text-left transition-none cursor-pointer"
              style={{
                backgroundColor: isActive ? "var(--t-card-hover)" : "var(--t-card-bg)",
                borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
              }}
            >
              {/* Preview swatch */}
              <div
                className="w-full h-8 mb-2 border border-black flex items-center justify-center text-xs"
                style={{
                  background: `linear-gradient(135deg, ${theme.vars["--t-titlebar-from"]}, ${theme.vars["--t-titlebar-to"]})`,
                }}
              >
                <span
                  className="px-1"
                  style={{
                    color: theme.vars["--t-titlebar-text"],
                    fontFamily:
                      theme.vars["--t-font-display"] === "var(--font-vt323)"
                        ? "monospace"
                        : "sans-serif",
                  }}
                >
                  {theme.emoji} {theme.name}
                </span>
              </div>

              <div
                className="text-sm font-bold tracking-wider truncate"
                style={{
                  color: "var(--t-accent)",
                  fontFamily: "var(--t-font-display)",
                }}
              >
                {isActive ? "✓ " : ""}
                {theme.name.toUpperCase()}
              </div>
              <div
                className="text-sm truncate mt-0.5"
                style={{
                  color: "var(--t-text-subtle)",
                  fontFamily: "var(--t-font-body)",
                }}
              >
                {theme.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Aperçu couleurs du thème actif */}
      <div
        className="p-3 border-[2px] mb-4"
        style={{
          backgroundColor: "var(--t-inset-from)",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        <div
          className="text-sm tracking-widest mb-2"
          style={{
            color: "var(--t-text-subtle)",
            fontFamily: "var(--t-font-display)",
          }}
        >
          APERÇU
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            "--t-bg",
            "--t-accent",
            "--t-titlebar-from",
            "--t-titlebar-to",
            "--t-marquee-text",
            "--t-card-hover-border",
          ].map((v) => (
            <div
              key={v}
              className="w-6 h-6 border border-black"
              style={{ backgroundColor: `var(${v})` }}
              title={v}
            />
          ))}
        </div>
      </div>

      {/* Bouton fermer */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-6 py-1.5 border-[2px] tracking-wider cursor-pointer text-base"
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
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md border-[3px] shadow-[8px_8px_0_rgba(0,0,0,0.5)] animate-[fadeIn_0.2s_ease]"
        style={{
          backgroundColor: "var(--t-bg)",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-dark)",
        }}
      >
        {/* Titlebar */}
        <div
          className="px-[10px] py-[6px] flex justify-between items-center border-b-2 border-black tracking-wider text-base select-none"
          style={{
            background:
              "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            color: "var(--t-titlebar-text)",
            fontFamily: "var(--t-font-display)",
          }}
        >
          <span>⚙️ Paramètres GunthOS — redémarrage non requis (pour l&apos;instant)</span>
          <RetroTitlebarBtn onClick={onClose}>✕</RetroTitlebarBtn>
        </div>
        {content}
      </div>
    </div>
  );
}
