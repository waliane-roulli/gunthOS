"use client";

import { useState } from "react";
import { useSettings } from "@/lib/contexts/settings-context";
import { THEMES, type ThemeId } from "@/lib/themes";
import { type Density } from "@/lib/settings";
import { RetroTitlebarBtn } from "./retro-titlebar-btn";

type Tab = "theme" | "display" | "system";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "theme", label: "THÈME", icon: "🎨" },
  { id: "display", label: "AFFICHAGE", icon: "🖥️" },
  { id: "system", label: "SYSTÈME", icon: "⚙️" },
];

interface SettingsPanelProps {
  onClose: () => void;
  embedded?: boolean;
}

export function SettingsPanel({ onClose, embedded = false }: SettingsPanelProps) {
  const { settings, setTheme, setSoundEnabled, setAmbientVolume, setAnimationsEnabled, setDensity } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("theme");

  const content = (
    <div>
      {/* Tabs */}
      <div
        className="flex border-b-2"
        style={{ borderBottomColor: "var(--t-border-dark)" }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 text-sm tracking-widest border-r cursor-pointer"
              style={{
                fontFamily: "var(--t-font-display)",
                color: isActive ? "var(--t-accent)" : "var(--t-text-muted)",
                backgroundColor: isActive ? "var(--t-bg)" : "var(--t-bg-dark)",
                borderRightColor: "var(--t-border-dark)",
                borderBottom: isActive ? "2px solid var(--t-bg)" : "none",
                marginBottom: isActive ? "-2px" : "0",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {activeTab === "theme" && (
          <ThemeTab themeId={settings.themeId} setTheme={setTheme} />
        )}
        {activeTab === "display" && (
          <DisplayTab
            density={settings.density}
            animationsEnabled={settings.animationsEnabled}
            setDensity={setDensity}
            setAnimationsEnabled={setAnimationsEnabled}
          />
        )}
        {activeTab === "system" && (
          <SystemTab
            soundEnabled={settings.soundEnabled}
            setSoundEnabled={setSoundEnabled}
            ambientVolume={settings.ambientVolume}
            setAmbientVolume={setAmbientVolume}
          />
        )}

        <div className="flex justify-end mt-5">
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
    </div>
  );

  if (embedded) return content;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg border-[3px] shadow-[8px_8px_0_rgba(0,0,0,0.5)] animate-[fadeIn_0.2s_ease]"
        style={{
          backgroundColor: "var(--t-bg)",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-dark)",
        }}
      >
        <div
          className="px-[10px] py-[6px] flex justify-between items-center border-b-2 border-black tracking-wider text-base select-none"
          style={{
            background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            color: "var(--t-titlebar-text)",
            fontFamily: "var(--t-font-display)",
          }}
        >
          <span>⚙️ Paramètres GunthOS</span>
          <RetroTitlebarBtn onClick={onClose}>✕</RetroTitlebarBtn>
        </div>
        {content}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-sm tracking-widest mb-3 pb-1 border-b"
      style={{
        color: "var(--t-text-muted)",
        fontFamily: "var(--t-font-display)",
        borderBottomColor: "var(--t-border-dark)",
      }}
    >
      {children}
    </div>
  );
}

function RetroToggle({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div
          className="text-sm tracking-wider"
          style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}
        >
          {label}
        </div>
        {description && (
          <div
            className="text-sm"
            style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-body)" }}
          >
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="flex items-center gap-1.5 px-3 py-1 border-[2px] text-sm tracking-wider cursor-pointer shrink-0"
        style={{
          backgroundColor: value ? "var(--t-accent)" : "var(--t-bg-dark)",
          color: value ? "var(--t-bg)" : "var(--t-text-muted)",
          fontFamily: "var(--t-font-display)",
          borderTopColor: value ? "var(--t-border-dark)" : "var(--t-border-light)",
          borderLeftColor: value ? "var(--t-border-dark)" : "var(--t-border-light)",
          borderBottomColor: value ? "var(--t-border-light)" : "var(--t-border-dark)",
          borderRightColor: value ? "var(--t-border-light)" : "var(--t-border-dark)",
        }}
      >
        {value ? "✓ ON" : "✗ OFF"}
      </button>
    </div>
  );
}

function ThemeTab({
  themeId,
  setTheme,
}: {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}) {
  return (
    <>
      <SectionTitle>🎨 THÈME VISUEL</SectionTitle>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {THEMES.map((theme) => {
          const isActive = theme.id === themeId;
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              className="p-3 border-[2px] text-left cursor-pointer"
              style={{
                backgroundColor: isActive ? "var(--t-card-hover)" : "var(--t-card-bg)",
                borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
              }}
            >
              <div
                className="w-full h-8 mb-2 border border-black flex items-center justify-center text-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.vars["--t-titlebar-from"]}, ${theme.vars["--t-titlebar-to"]})`,
                }}
              >
                <span style={{ color: theme.vars["--t-titlebar-text"], fontFamily: "monospace" }}>
                  {theme.emoji} {theme.name}
                </span>
              </div>
              <div
                className="text-sm font-bold tracking-wider truncate"
                style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}
              >
                {isActive ? "✓ " : ""}{theme.name.toUpperCase()}
              </div>
              <div
                className="text-sm truncate mt-0.5"
                style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-body)" }}
              >
                {theme.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Palette d'aperçu */}
      <div
        className="p-3 border-[2px]"
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
          style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}
        >
          APERÇU COULEURS
        </div>
        <div className="flex gap-1 flex-wrap">
          {["--t-bg", "--t-accent", "--t-titlebar-from", "--t-titlebar-to", "--t-marquee-text", "--t-card-hover-border"].map((v) => (
            <div
              key={v}
              className="w-6 h-6 border border-black"
              style={{ backgroundColor: `var(${v})` }}
              title={v}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const DENSITY_OPTIONS: { id: Density; label: string; description: string }[] = [
  { id: "compact", label: "COMPACT", description: "Interface resserrée" },
  { id: "normal", label: "NORMAL", description: "Taille standard" },
  { id: "large", label: "LARGE", description: "Éléments agrandis" },
];

function DisplayTab({
  density,
  animationsEnabled,
  setDensity,
  setAnimationsEnabled,
}: {
  density: Density;
  animationsEnabled: boolean;
  setDensity: (v: Density) => void;
  setAnimationsEnabled: (v: boolean) => void;
}) {
  return (
    <>
      <SectionTitle>🖥️ DENSITÉ DE L&apos;INTERFACE</SectionTitle>
      <div className="flex gap-2 mb-6">
        {DENSITY_OPTIONS.map((opt) => {
          const isActive = opt.id === density;
          return (
            <button
              key={opt.id}
              onClick={() => setDensity(opt.id)}
              className="flex-1 py-2 border-[2px] text-center cursor-pointer"
              style={{
                backgroundColor: isActive ? "var(--t-card-hover)" : "var(--t-bg-dark)",
                color: isActive ? "var(--t-accent)" : "var(--t-text-muted)",
                fontFamily: "var(--t-font-display)",
                borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
              }}
            >
              <div className="text-sm tracking-widest">{isActive ? "✓ " : ""}{opt.label}</div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-body)" }}
              >
                {opt.description}
              </div>
            </button>
          );
        })}
      </div>

      <SectionTitle>✨ ANIMATIONS</SectionTitle>
      <RetroToggle
        value={animationsEnabled}
        onChange={setAnimationsEnabled}
        label="Animations du système"
        description="Transitions, effets visuels, ouverture de fenêtres"
      />
    </>
  );
}

function SystemTab({
  soundEnabled,
  setSoundEnabled,
  ambientVolume,
  setAmbientVolume,
}: {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  ambientVolume: number;
  setAmbientVolume: (v: number) => void;
}) {
  const volumePct = Math.round(ambientVolume * 100);
  return (
    <>
      <SectionTitle>🔊 SONS SYSTÈME</SectionTitle>
      <RetroToggle
        value={soundEnabled}
        onChange={setSoundEnabled}
        label="Sons GunthOS"
        description="Bips, pops et effets sonores du système"
      />

      <div className="flex items-center justify-between py-2 gap-4">
        <div>
          <div
            className="text-sm tracking-wider"
            style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}
          >
            🖥️ Bruit ambiant machine
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-body)" }}
          >
            Ventilateur + bourdonnement électronique
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="range"
            min={0}
            max={100}
            value={volumePct}
            disabled={!soundEnabled}
            onChange={(e) => setAmbientVolume(Number(e.target.value) / 100)}
            className="w-24 cursor-pointer"
            style={{ accentColor: "var(--t-accent)", opacity: soundEnabled ? 1 : 0.4 }}
          />
          <span
            className="text-sm w-8 text-right tabular-nums"
            style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
          >
            {volumePct}%
          </span>
        </div>
      </div>

      <div
        className="mt-4 p-3 border-[2px]"
        style={{
          backgroundColor: "var(--t-inset-from)",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        <div
          className="text-sm tracking-widest mb-1"
          style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}
        >
          ℹ️ INFO SYSTÈME
        </div>
        <div
          className="text-sm space-y-0.5"
          style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
        >
          <div>GunthOS v1.0 — Build 19981225</div>
          <div>Mémoire : suffisante</div>
          <div>Licence : aucune</div>
        </div>
      </div>
    </>
  );
}
