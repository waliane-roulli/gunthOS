"use client";

import { PRESETS } from "@/types/plouf-plouf";
import type { CelebrationOptions, PresetName } from "@/types/plouf-plouf";
import { useDraggable } from "@/lib/hooks/use-draggable";
import { useTheme } from "@/lib/contexts/settings-context";
import { THEMES } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import { RetroTitlebarBtn } from "@/components/ui/retro-titlebar-btn";

interface OptionsPanelProps {
  open: boolean;
  options: CelebrationOptions;
  onChange: (o: CelebrationOptions) => void;
  onClose: () => void;
}

export function OptionsPanel({
  open,
  options,
  onChange,
  onClose,
}: OptionsPanelProps) {
  const update = (patch: Partial<CelebrationOptions>) =>
    onChange({ ...options, ...patch, preset: "custom" });

  const { themeId, setTheme } = useTheme();
  const drag = useDraggable();

  const asideStyle = drag.isDragged
    ? drag.style
    : { top: "50%", transform: "translateY(-50%)", right: open ? "20px" : "-420px" };

  return (
    <aside
      ref={drag.elementRef}
      className={`fixed w-[380px] max-w-[calc(100vw-20px)] max-h-[90vh] overflow-y-auto border-[3px] shadow-[4px_4px_0_rgba(0,0,0,0.4)] z-[10001] ${!drag.isDragged ? "transition-[right] duration-300" : ""}`}
      style={{
        ...asideStyle,
        backgroundColor: "var(--t-bg)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
      }}
      aria-label="Options de célébration"
    >
      {/* Titlebar */}
      <div
        onMouseDown={drag.onMouseDown}
        className="px-[10px] py-[6px] flex justify-between items-center tracking-wider text-base cursor-move select-none"
        style={{
          background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
          color: "var(--t-titlebar-text)",
          fontFamily: "var(--t-font-display)",
        }}
      >
        <span>⚙ Options.exe</span>
        <RetroTitlebarBtn onClick={onClose} aria-label="Fermer">✕</RetroTitlebarBtn>
      </div>

      <div className="p-3">
        {/* Marquee */}
        <div
          className="p-1 overflow-hidden whitespace-nowrap mb-2 border-[2px] text-[0.95rem] tracking-wider"
          style={{
            backgroundColor: "var(--t-marquee-bg)",
            color: "var(--t-marquee-text)",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            fontFamily: "var(--t-font-display)",
          }}
        >
          <span className="inline-block pl-[100%] animate-[marqueeScroll_15s_linear_infinite]">
            ★ PERSONNALISEZ VOTRE CELEBRATION DE OUF !! ★ 100% KITSCH ★ 0%
            SERIEUX ★
          </span>
        </div>

        {/* Presets */}
        <OptGroup title="🎨 Presets">
          <div className="grid grid-cols-3 gap-[3px]">
            {(Object.keys(PRESETS) as PresetName[]).map((name) => {
              const isActive = options.preset === name;
              return (
                <button
                  key={name}
                  onClick={() => onChange({ ...PRESETS[name] })}
                  className="border-[2px] px-1 py-[5px] text-sm font-bold cursor-pointer text-center transition-none"
                  style={{
                    fontFamily: "var(--t-font-body)",
                    backgroundColor: isActive ? "var(--t-accent)" : "var(--t-bg)",
                    color: isActive ? "var(--t-titlebar-text)" : "var(--t-text)",
                    borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                    borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                    borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                    borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              );
            })}
          </div>
        </OptGroup>

        {/* Aléatoire */}
        <OptGroup title="🎲 Preset aléatoire">
          <OptRow label="Surprise à chaque tirage">
            <input
              type="checkbox"
              checked={options.randomPreset}
              onChange={(e) => update({ randomPreset: e.target.checked })}
              className="w-[18px] h-[18px] cursor-pointer accent-[color:var(--t-accent)]"
            />
          </OptRow>
        </OptGroup>

        {/* Type */}
        <OptGroup title="🎆 Type de célébration">
          <OptRow label="Style">
            <select
              value={options.type}
              onChange={(e) =>
                update({ type: e.target.value as CelebrationOptions["type"] })
              }
              className="border-[2px] px-1.5 py-0.5 text-sm flex-1"
              style={{
                fontFamily: "var(--t-font-body)",
                backgroundColor: "var(--t-card-bg)",
                color: "var(--t-text)",
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
              }}
            >
              <option value="confetti">🎊 Confettis</option>
              <option value="hearts">❤️ Cœurs</option>
              <option value="matrix">💚 Matrix</option>
              <option value="bubbles">🫧 Bulles</option>
              <option value="fireworks">🎆 Feu d&apos;artifice</option>
              <option value="rain">⭐ Pluie d&apos;or</option>
              <option value="xp">🟢 XP Orbs</option>
              <option value="money">💰 Money</option>
              <option value="stars">✨ Étoiles</option>
              <option value="alien">👽 Aliens</option>
              <option value="flame">🔥 Flammes</option>
              <option value="poop">💩 Caca</option>
            </select>
          </OptRow>
          <OptRow label="Sous-texte">
            <input
              type="text"
              value={options.text}
              onChange={(e) => update({ text: e.target.value })}
              maxLength={30}
              className="border-[2px] px-1.5 py-0.5 text-sm flex-1"
              style={{
                fontFamily: "var(--t-font-body)",
                backgroundColor: "var(--t-card-bg)",
                color: "var(--t-text)",
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
              }}
            />
          </OptRow>
        </OptGroup>

        {/* Intensité */}
        <OptGroup title="🎚 Intensité">
          <SliderRow
            label="Densité"
            id="density"
            min={10}
            max={400}
            value={options.density}
            onChange={(v) => update({ density: v })}
          />
          <SliderRow
            label="Durée (s)"
            id="duration"
            min={1}
            max={10}
            step={0.5}
            value={options.duration}
            onChange={(v) => update({ duration: v })}
            format={(v) => v.toFixed(1)}
          />
          <SliderRow
            label="Shake"
            id="shake"
            min={0}
            max={10}
            value={options.shake}
            onChange={(v) => update({ shake: v })}
          />
        </OptGroup>

        {/* Couleurs */}
        <OptGroup title="🎨 Couleurs">
          {(
            [
              ["color1", "Couleur 1"],
              ["color2", "Couleur 2"],
              ["color3", "Couleur 3"],
            ] as const
          ).map(([key, label]) => (
            <OptRow key={key} label={label}>
              <input
                type="color"
                value={options[key]}
                onChange={(e) => update({ [key]: e.target.value })}
                className="w-[50px] h-[26px] border-[2px] p-0.5 cursor-pointer"
                style={{
                  borderTopColor: "var(--t-border-dark)",
                  borderLeftColor: "var(--t-border-dark)",
                  borderBottomColor: "var(--t-border-light)",
                  borderRightColor: "var(--t-border-light)",
                }}
              />
            </OptRow>
          ))}
          <OptRow label="Arc-en-ciel">
            <input
              type="checkbox"
              checked={options.rainbow}
              onChange={(e) => update({ rainbow: e.target.checked })}
              className="w-[18px] h-[18px] cursor-pointer accent-[color:var(--t-accent)]"
            />
          </OptRow>
        </OptGroup>

        {/* Effets */}
        <OptGroup title="✨ Effets spéciaux">
          {(
            [
              ["flash", "Flash blanc"],
              ["marquee", "Marquee Web 1.0"],
              ["bigText", "Gros nom gagnant"],
              ["damageNumbers", "Dégâts chiffrés"],
              ["bgPulse", "Fond qui pulse"],
              ["epicResult", "Résultat épique"],
            ] as const
          ).map(([key, label]) => (
            <OptRow key={key} label={label}>
              <input
                type="checkbox"
                checked={options[key] as boolean}
                onChange={(e) => update({ [key]: e.target.checked })}
                className="w-[18px] h-[18px] cursor-pointer accent-[color:var(--t-accent)]"
              />
            </OptRow>
          ))}
        </OptGroup>

        {/* Theme */}
        <OptGroup title="🖥️ Theme">
          <div className="grid grid-cols-2 gap-[3px]">
            {THEMES.map((t) => {
              const isActive = themeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeId)}
                  className="border-[2px] px-1 py-[5px] text-sm font-bold cursor-pointer text-left transition-none"
                  style={{
                    fontFamily: "var(--t-font-body)",
                    backgroundColor: isActive ? "var(--t-accent)" : "var(--t-bg)",
                    color: isActive ? "var(--t-titlebar-text)" : "var(--t-text)",
                    borderTopColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                    borderLeftColor: isActive ? "var(--t-border-dark)" : "var(--t-border-light)",
                    borderBottomColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                    borderRightColor: isActive ? "var(--t-border-light)" : "var(--t-border-dark)",
                  }}
                >
                  {t.emoji} {t.name}
                </button>
              );
            })}
          </div>
        </OptGroup>

        <div
          className="text-center pt-2 border-t border-dashed text-[0.9rem] tracking-wider"
          style={{
            borderTopColor: "var(--t-accent)",
            color: "var(--t-accent)",
            fontFamily: "var(--t-font-display)",
          }}
        >
          🚧 Page en construction depuis 1998 🚧
        </div>
      </div>
    </aside>
  );
}

function OptGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border-[2px] p-2 mb-2"
      style={{
        backgroundColor: "var(--t-card-bg)",
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
      }}
    >
      <div
        className="font-bold text-[0.95rem] tracking-wider pb-1 mb-1.5 border-b border-dashed"
        style={{
          color: "var(--t-accent)",
          fontFamily: "var(--t-font-display)",
          borderBottomColor: "var(--t-accent)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function OptRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-2 mb-1.5 last:mb-0 text-[0.82rem]"
      style={{ color: "var(--t-text)" }}
    >
      <label
        className="flex-none font-medium"
        style={{ fontFamily: "var(--t-font-body)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  id,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
}: {
  label: string;
  id: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <OptRow label={label}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-[color:var(--t-accent)]"
      />
      <span
        className="flex-none w-10 text-right font-bold text-base"
        style={{
          color: "var(--t-accent)",
          fontFamily: "var(--t-font-display)",
        }}
      >
        {format(value)}
      </span>
    </OptRow>
  );
}
