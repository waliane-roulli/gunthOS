"use client";

import { useState, useEffect, useCallback } from "react";
import { PG, captionBtn, btnRaised } from "../styles";
import {
  CLASSES, UPGRADES, RELICS,
  type ClassId, type UpgradeId, type RelicId,
} from "../engine/roguelite";
import type { PeagleAnnouncement } from "./AnnouncementPopup";

export interface DevConfig {
  startLevel: number;
  classId: ClassId;
  upgrades: UpgradeId[];
  relics: RelicId[];
  godMode: boolean;       // balles infinies
  showHitboxes: boolean;  // overlay debug hitboxes canvas
  forceGreenPower: "none" | "multiball" | "spooky" | "extraball" | "magnet";
  orangePct: number | null; // null = normal, sinon override 0-100%
}

export const DEFAULT_DEV_CONFIG: DevConfig = {
  startLevel: 1,
  classId: "canonnier",
  upgrades: [],
  relics: [],
  godMode: false,
  showHitboxes: false,
  forceGreenPower: "none",
  orangePct: null,
};

interface DevPanelProps {
  onClose: () => void;
  onLaunch: (cfg: DevConfig) => void;
}

const SECTION: React.CSSProperties = {
  marginBottom: 14,
};

const LABEL: React.CSSProperties = {
  fontSize: 7,
  color: PG.cyan,
  letterSpacing: "0.1em",
  fontFamily: "var(--font-press-start), monospace",
  marginBottom: 5,
  display: "block",
};

const SEP: React.CSSProperties = {
  borderTop: `1px solid ${PG.border}`,
  margin: "12px 0",
};

const TAG_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 7px",
  fontSize: 7,
  fontFamily: "var(--font-press-start), monospace",
  cursor: "pointer",
  border: "1px solid",
  borderRadius: 0,
  lineHeight: 1.4,
  userSelect: "none",
};

function Tag({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <div
      style={{
        ...TAG_BASE,
        background: active ? (color ?? PG.cyan) : PG.surface,
        color: active ? "#000" : PG.textMuted,
        borderColor: active ? (color ?? PG.cyan) : PG.border,
      }}
      onClick={onClick}
    >
      {label}
    </div>
  );
}

function NumberInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        style={{ ...btnRaised, padding: "3px 8px", fontSize: 9 }}
        onClick={() => onChange(Math.max(min, value - 1))}
      >-</button>
      <span style={{ fontSize: 9, color: PG.gold, fontFamily: "var(--font-press-start), monospace", minWidth: 24, textAlign: "center" }}>
        {value}
      </span>
      <button
        style={{ ...btnRaised, padding: "3px 8px", fontSize: 9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
      >+</button>
    </div>
  );
}

const RARITY_COLORS: Record<string, string> = {
  common: PG.textMuted,
  rare: "#4488ff",
  epic: PG.purple,
};

const PRESET_RUNS: Array<{ label: string; cfg: Partial<DevConfig> }> = [
  {
    label: "All Upgrades",
    cfg: {
      upgrades: Object.keys(UPGRADES) as UpgradeId[],
      relics: [],
      godMode: true,
    },
  },
  {
    label: "All Relics",
    cfg: {
      relics: Object.keys(RELICS) as RelicId[],
      upgrades: [],
      godMode: false,
    },
  },
  {
    label: "God Run",
    cfg: {
      upgrades: Object.keys(UPGRADES) as UpgradeId[],
      relics: Object.keys(RELICS) as RelicId[],
      godMode: true,
    },
  },
  {
    label: "Bare",
    cfg: {
      upgrades: [],
      relics: [],
      godMode: false,
    },
  },
];

// ── Announcements tab ─────────────────────────────────────────────────────────

const TYPE_OPTS = ["info", "update", "warning"] as const;
const TYPE_LABELS: Record<string, string> = { info: "INFO", update: "MÀJOUR", warning: "ATTENTION" };
const TYPE_COLORS: Record<string, string> = { info: "#44ccaa", update: PG.gold, warning: "#ee9922" };

function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<PeagleAnnouncement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "update" | "warning">("info");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/peagle/announcements")
      .then(r => r.json())
      .then((d: unknown) => setAnnouncements(Array.isArray(d) ? d as PeagleAnnouncement[] : []))
      .catch(() => setError("Erreur chargement"));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!title.trim() || !message.trim()) { setError("Titre et message requis"); return; }
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/peagle/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), type }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Erreur"); return; }
      setTitle(""); setMessage(""); load();
    } catch { setError("Erreur réseau"); }
    finally { setSending(false); }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/peagle/announcements?id=${id}`, { method: "DELETE" });
    load();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: PG.bg,
    border: `1px solid ${PG.border}`,
    color: PG.text,
    fontFamily: "var(--font-press-start), monospace",
    fontSize: 7,
    padding: "5px 7px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Create form */}
      <div>
        <span style={LABEL}>✦ NOUVELLE ANNONCE</span>
        <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
          {TYPE_OPTS.map(t => (
            <Tag key={t} label={TYPE_LABELS[t]!} active={type === t} color={TYPE_COLORS[t]} onClick={() => setType(t)} />
          ))}
        </div>
        <input
          style={{ ...inputStyle, marginBottom: 6 }}
          placeholder="TITRE..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          style={{ ...inputStyle, height: 64, resize: "none", marginBottom: 8 }}
          placeholder="MESSAGE..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        {error && <div style={{ fontSize: 7, color: PG.red, marginBottom: 6 }}>{error}</div>}
        <button
          style={{ ...btnRaised, fontSize: 7, borderTopColor: PG.gold, borderLeftColor: PG.gold, color: PG.gold }}
          onClick={handleCreate}
          disabled={sending}
        >
          {sending ? "ENVOI..." : "★ PUBLIER"}
        </button>
      </div>

      <div style={SEP} />

      {/* Existing list */}
      <div>
        <span style={LABEL}>▶ ANNONCES EXISTANTES ({announcements.length})</span>
        {announcements.length === 0 && (
          <div style={{ fontSize: 7, color: PG.textMuted }}>AUCUNE ANNONCE</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {announcements.map(a => (
            <div
              key={a.id}
              style={{
                background: PG.bg,
                border: `1px solid ${PG.border}`,
                padding: "6px 8px",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 7, color: TYPE_COLORS[a.type] ?? PG.cyan, marginBottom: 3 }}>
                  [{a.type.toUpperCase()}] {a.title}
                </div>
                <div style={{ fontSize: 6, color: PG.textMuted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {a.message.slice(0, 120)}{a.message.length > 120 ? "…" : ""}
                </div>
              </div>
              <button
                style={{ ...btnRaised, fontSize: 6, padding: "3px 7px", color: PG.red, flexShrink: 0 }}
                onClick={() => handleDelete(a.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main DevPanel ─────────────────────────────────────────────────────────────

type DevTab = "game" | "annonces";

export function DevPanel({ onClose, onLaunch }: DevPanelProps) {
  const [cfg, setCfg] = useState<DevConfig>({ ...DEFAULT_DEV_CONFIG });
  const [activeTab, setActiveTab] = useState<DevTab>("game");

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  }

  function applyPreset(preset: Partial<DevConfig>) {
    setCfg(prev => ({ ...prev, ...preset }));
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: PG.surface,
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: PG.hi,
          borderLeftColor: PG.hi,
          borderBottomColor: PG.sh,
          borderRightColor: PG.sh,
          width: 440,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: `6px 6px 0 rgba(0,0,0,0.8), 0 0 40px rgba(204,68,255,0.15)`,
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(to right, #3a0070, #1a0050)`,
            padding: "5px 6px 5px 8px",
            gap: 4,
            borderBottom: `1px solid ${PG.purple}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 8, color: PG.purple, flex: 1, fontFamily: "var(--font-press-start), monospace", letterSpacing: "0.08em" }}>
            ⚙ DEV TOOLS — ADMIN ONLY
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={{ ...captionBtn, borderTopColor: PG.hi, borderLeftColor: PG.hi }} onClick={ch === "×" ? onClose : undefined}>
              {ch}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${PG.border}`, flexShrink: 0 }}>
          {(["game", "annonces"] as DevTab[]).map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 14px",
                fontSize: 7,
                fontFamily: "var(--font-press-start), monospace",
                cursor: "pointer",
                letterSpacing: "0.06em",
                color: activeTab === tab ? PG.purple : PG.textMuted,
                borderBottom: activeTab === tab ? `2px solid ${PG.purple}` : "2px solid transparent",
                userSelect: "none",
              }}
            >
              {tab === "game" ? "⚙ JEU" : "★ ANNONCES"}
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div
          style={{
            padding: "16px 18px",
            overflowY: "auto",
            flex: 1,
            fontFamily: "var(--font-press-start), monospace",
          }}
        >
          {activeTab === "annonces" && <AnnouncementsTab />}
          {activeTab === "game" && <>
          {/* Presets rapides */}
          <div style={SECTION}>
            <span style={LABEL}>⚡ PRESETS</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PRESET_RUNS.map(p => (
                <button
                  key={p.label}
                  style={{ ...btnRaised, fontSize: 7, padding: "4px 10px", borderTopColor: PG.purple, borderLeftColor: PG.purple }}
                  onClick={() => applyPreset(p.cfg)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={SEP} />

          {/* Niveau de départ */}
          <div style={SECTION}>
            <span style={LABEL}>▶ NIVEAU DE DÉPART</span>
            <NumberInput
              value={cfg.startLevel}
              min={1}
              max={30}
              onChange={v => setCfg(c => ({ ...c, startLevel: v }))}
            />
            <div style={{ fontSize: 7, color: PG.textMuted, marginTop: 5 }}>
              {cfg.startLevel % 3 === 0 ? "⚠ NIVEAU BOSS" : `Layout ${((cfg.startLevel - 1) % 10) + 1}/10`}
            </div>
          </div>

          <div style={SEP} />

          {/* Classe */}
          <div style={SECTION}>
            <span style={LABEL}>▶ CLASSE</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(Object.keys(CLASSES) as ClassId[]).map(id => (
                <Tag
                  key={id}
                  label={CLASSES[id]!.name.toUpperCase()}
                  active={cfg.classId === id}
                  color="#4488ff"
                  onClick={() => setCfg(c => ({ ...c, classId: id }))}
                />
              ))}
            </div>
            <div style={{ fontSize: 7, color: PG.textMuted, marginTop: 5, lineHeight: 1.5 }}>
              {CLASSES[cfg.classId]!.flavorText}
            </div>
          </div>

          <div style={SEP} />

          {/* Upgrades */}
          <div style={SECTION}>
            <span style={LABEL}>▶ UPGRADES ({cfg.upgrades.length}/{Object.keys(UPGRADES).length})</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(Object.keys(UPGRADES) as UpgradeId[]).map(id => {
                const u = UPGRADES[id]!;
                return (
                  <Tag
                    key={id}
                    label={u.name.toUpperCase()}
                    active={cfg.upgrades.includes(id)}
                    color={RARITY_COLORS[u.rarity]}
                    onClick={() => setCfg(c => ({ ...c, upgrades: toggle(c.upgrades, id) }))}
                  />
                );
              })}
            </div>
          </div>

          <div style={SEP} />

          {/* Reliques */}
          <div style={SECTION}>
            <span style={LABEL}>▶ RELIQUES ({cfg.relics.length}/{Object.keys(RELICS).length})</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(Object.keys(RELICS) as RelicId[]).map(id => {
                const r = RELICS[id]!;
                return (
                  <Tag
                    key={id}
                    label={r.name.toUpperCase()}
                    active={cfg.relics.includes(id)}
                    color={r.color}
                    onClick={() => setCfg(c => ({ ...c, relics: toggle(c.relics, id) }))}
                  />
                );
              })}
            </div>
          </div>

          <div style={SEP} />

          {/* Options de debug */}
          <div style={SECTION}>
            <span style={LABEL}>▶ OPTIONS DEBUG</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div
                  style={{
                    width: 14, height: 14,
                    background: cfg.godMode ? PG.gold : PG.surface2,
                    border: `2px solid ${cfg.godMode ? PG.gold : PG.border}`,
                    flexShrink: 0,
                  }}
                  onClick={() => setCfg(c => ({ ...c, godMode: !c.godMode }))}
                />
                <span style={{ fontSize: 7, color: cfg.godMode ? PG.gold : PG.textMuted }}>
                  GOD MODE — balles infinies
                </span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div
                  style={{
                    width: 14, height: 14,
                    background: cfg.showHitboxes ? "#ff4444" : PG.surface2,
                    border: `2px solid ${cfg.showHitboxes ? "#ff4444" : PG.border}`,
                    flexShrink: 0,
                  }}
                  onClick={() => setCfg(c => ({ ...c, showHitboxes: !c.showHitboxes }))}
                />
                <span style={{ fontSize: 7, color: cfg.showHitboxes ? "#ff4444" : PG.textMuted }}>
                  HITBOXES — overlay debug canvas
                </span>
              </label>

            </div>
          </div>

          <div style={SEP} />

          {/* Force green power */}
          <div style={SECTION}>
            <span style={LABEL}>▶ FORCER POWER GREEN</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(["none", "multiball", "spooky", "extraball", "magnet"] as const).map(v => (
                <Tag
                  key={v}
                  label={v.toUpperCase()}
                  active={cfg.forceGreenPower === v}
                  color="#00ff44"
                  onClick={() => setCfg(c => ({ ...c, forceGreenPower: v }))}
                />
              ))}
            </div>
          </div>

          <div style={SEP} />

          {/* Orange % override */}
          <div style={SECTION}>
            <span style={LABEL}>▶ % CIBLES ORANGE (null = auto)</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                <Tag
                  label="AUTO"
                  active={cfg.orangePct === null}
                  color={PG.cyan}
                  onClick={() => setCfg(c => ({ ...c, orangePct: null }))}
                />
                {[10, 25, 40, 60, 80].map(v => (
                  <Tag
                    key={v}
                    label={`${v}%`}
                    active={cfg.orangePct === v}
                    color="#ff6b35"
                    onClick={() => setCfg(c => ({ ...c, orangePct: v }))}
                  />
                ))}
              </div>
            </div>
          </div>

          </>}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 18px",
            borderTop: `1px solid ${PG.border}`,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            flexShrink: 0,
            background: PG.surface,
          }}
        >
          <button style={{ ...btnRaised, fontSize: 7 }} onClick={onClose}>
            ANNULER
          </button>
          <button
            style={{
              ...btnRaised,
              fontSize: 7,
              background: `linear-gradient(to bottom, ${PG.purple}, #660099)`,
              color: "#fff",
              borderTopColor: "#dd88ff",
              borderLeftColor: "#dd88ff",
              borderBottomColor: "#330044",
              borderRightColor: "#330044",
            }}
            onClick={() => onLaunch(cfg)}
          >
            ▶ LANCER AVEC CES PARAMS
          </button>
        </div>
      </div>
    </div>
  );
}
