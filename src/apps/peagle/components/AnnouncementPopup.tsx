"use client";

import { useState, useEffect } from "react";
import { captionBtn } from "../styles";
import { PegIcon } from "./PegIcon";

const NW = {
  bg:        "#060e04",
  surface:   "#0c1a08",
  surface2:  "#122010",
  border:    "#1e3a18",
  hi:        "#3a6030",
  sh:        "#020501",
  gold:      "#88cc44",
  goldLight: "#aaee66",
  amber:     "#66bb33",
  text:      "#c8e8b0",
  textMuted: "#4a7040",
  cyan:      "#44ccaa",
  red:       "#cc4433",
  redLight:  "#ee6655",
} as const;

const LS_KEY = "peagle98_last_seen_announcement";

export interface PeagleAnnouncement {
  id: number;
  title: string;
  message: string;
  type: "info" | "update" | "warning";
  createdAt: Date | string | number;
}

const TYPE_CONFIG = {
  info:    { icon: "ℹ", label: "INFO",    color: NW.cyan },
  update:  { icon: "★", label: "MÀJOUR",  color: NW.gold },
  warning: { icon: "⚠", label: "ATTENTION", color: "#ee9922" },
} as const;

function formatDate(raw: Date | string | number): string {
  const d = new Date(raw);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

// ── Changelog panel ───────────────────────────────────────────────────────────

interface ChangelogPanelProps {
  announcements: PeagleAnnouncement[];
  onClose: () => void;
}

export function ChangelogPanel({ announcements, onClose }: ChangelogPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          width: 360,
          maxHeight: "80%",
          display: "flex",
          flexDirection: "column",
          background: NW.surface,
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: NW.hi,
          borderLeftColor: NW.hi,
          borderBottomColor: NW.sh,
          borderRightColor: NW.sh,
          boxShadow: `6px 6px 0 rgba(0,0,0,0.9)`,
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(to right, #0a1a06, #060e04)`,
            padding: "5px 6px 5px 8px",
            gap: 4,
            borderBottom: `1px solid ${NW.gold}55`,
            flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: 9,
            color: NW.goldLight,
            flex: 1,
            fontFamily: "var(--pg-font)",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 5,
            textShadow: `0 0 8px ${NW.gold}88`,
          }}>
            <PegIcon id="eagle" size={10} /> PEAGLE 98 — CHANGELOG
          </span>
          <div
            style={{ ...captionBtn, background: NW.surface2, borderTopColor: NW.hi, borderLeftColor: NW.hi, borderBottomColor: NW.sh, borderRightColor: NW.sh, color: NW.textMuted, cursor: "pointer" }}
            onClick={onClose}
          >
            ×
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {announcements.length === 0 && (
            <div style={{ fontSize: 8, color: NW.textMuted, fontFamily: "var(--pg-font)", textAlign: "center", padding: "24px 0" }}>
              AUCUNE ANNONCE POUR L&apos;INSTANT
            </div>
          )}
          {announcements.map((a) => {
            const cfg = TYPE_CONFIG[a.type];
            return (
              <div
                key={a.id}
                style={{
                  background: NW.bg,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderTopColor: NW.sh,
                  borderLeftColor: NW.sh,
                  borderBottomColor: NW.hi,
                  borderRightColor: NW.hi,
                  padding: "8px 10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 8, color: cfg.color, fontFamily: "var(--pg-font)" }}>{cfg.icon} {cfg.label}</span>
                  <span style={{ flex: 1, fontSize: 8, color: NW.gold, fontFamily: "var(--pg-font)", textShadow: `0 0 6px ${NW.gold}55` }}>{a.title}</span>
                  <span style={{ fontSize: 7, color: NW.textMuted, fontFamily: "var(--pg-font)" }}>{formatDate(a.createdAt)}</span>
                </div>
                <div style={{ fontSize: 7, color: NW.text, fontFamily: "var(--pg-font)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{a.message}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${NW.border}`, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "8px 0",
              fontFamily: "var(--pg-font)",
              fontSize: 8,
              cursor: "pointer",
              background: NW.surface2,
              color: NW.text,
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor: NW.hi,
              borderLeftColor: NW.hi,
              borderBottomColor: NW.sh,
              borderRightColor: NW.sh,
              letterSpacing: "0.04em",
            }}
          >
            ← FERMER
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Announcement popup (shown on menu open when unseen) ───────────────────────

interface AnnouncementPopupProps {
  announcement: PeagleAnnouncement;
  onDismiss: () => void;
  onMoreInfo: () => void;
}

function AnnouncementPopup({ announcement, onDismiss, onMoreInfo }: AnnouncementPopupProps) {
  const cfg = TYPE_CONFIG[announcement.type];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          width: 300,
          background: NW.surface,
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: NW.hi,
          borderLeftColor: NW.hi,
          borderBottomColor: NW.sh,
          borderRightColor: NW.sh,
          boxShadow: `6px 6px 0 rgba(0,0,0,0.9), 0 0 40px rgba(136,204,68,0.08)`,
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(to right, #0a1a06, #060e04)`,
            padding: "5px 6px 5px 8px",
            gap: 4,
            borderBottom: `1px solid ${NW.gold}55`,
          }}
        >
          <span style={{
            fontSize: 9,
            color: cfg.color,
            flex: 1,
            fontFamily: "var(--pg-font)",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}>
            {cfg.icon} {cfg.label}
          </span>
          <div
            style={{ ...captionBtn, background: NW.surface2, borderTopColor: NW.hi, borderLeftColor: NW.hi, borderBottomColor: NW.sh, borderRightColor: NW.sh, color: NW.textMuted, cursor: "pointer" }}
            onClick={onDismiss}
          >
            ×
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 14px" }}>
          <div
            style={{
              fontSize: 9,
              color: NW.gold,
              fontFamily: "var(--pg-font)",
              marginBottom: 10,
              textShadow: `0 0 8px ${NW.gold}55`,
              letterSpacing: "0.04em",
            }}
          >
            {announcement.title}
          </div>
          <div
            style={{
              fontSize: 7,
              color: NW.text,
              fontFamily: "var(--pg-font)",
              lineHeight: 1.8,
              marginBottom: 16,
              background: NW.bg,
              padding: "8px 10px",
              borderWidth: 1,
              borderStyle: "solid",
              borderTopColor: NW.sh,
              borderLeftColor: NW.sh,
              borderBottomColor: NW.hi,
              borderRightColor: NW.hi,
              maxHeight: 120,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {announcement.message}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onMoreInfo}
              style={{
                flex: 1,
                padding: "8px 0",
                fontFamily: "var(--pg-font)",
                fontSize: 7,
                cursor: "pointer",
                background: `linear-gradient(to bottom, ${NW.amber}, #336600)`,
                color: NW.text,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: NW.goldLight,
                borderLeftColor: NW.goldLight,
                borderBottomColor: NW.sh,
                borderRightColor: NW.sh,
                letterSpacing: "0.04em",
              }}
            >
              ★ PLUS D&apos;INFOS
            </button>
            <button
              onClick={onDismiss}
              style={{
                flex: 1,
                padding: "8px 0",
                fontFamily: "var(--pg-font)",
                fontSize: 7,
                cursor: "pointer",
                background: NW.surface2,
                color: NW.textMuted,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: NW.hi,
                borderLeftColor: NW.hi,
                borderBottomColor: NW.sh,
                borderRightColor: NW.sh,
                letterSpacing: "0.04em",
              }}
            >
              OK, COMPRIS
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hook — fetches announcements, shows popup if latest unseen ────────────────

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<PeagleAnnouncement[]>([]);
  const [popupAnnouncement, setPopupAnnouncement] = useState<PeagleAnnouncement | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    fetch("/api/peagle/announcements")
      .then((r) => r.json())
      .then((data: PeagleAnnouncement[]) => {
        setAnnouncements(data);
        if (data.length === 0) return;
        const latest = data[0]!;
        const lastSeen = localStorage.getItem(LS_KEY);
        if (String(latest.id) !== lastSeen) {
          setPopupAnnouncement(latest);
        }
      })
      .catch(() => {/* silent */});
  }, []);

  function dismiss() {
    if (popupAnnouncement) {
      localStorage.setItem(LS_KEY, String(popupAnnouncement.id));
    }
    setPopupAnnouncement(null);
  }

  function openChangelog() {
    dismiss();
    setShowChangelog(true);
  }

  return { announcements, popupAnnouncement, showChangelog, dismiss, openChangelog, setShowChangelog };
}

// ── Exported overlay component — drop into MainMenu ──────────────────────────

interface AnnouncementsOverlayProps {
  announcements: PeagleAnnouncement[];
  popupAnnouncement: PeagleAnnouncement | null;
  showChangelog: boolean;
  onDismiss: () => void;
  onMoreInfo: () => void;
  onCloseChangelog: () => void;
}

export function AnnouncementsOverlay({
  announcements,
  popupAnnouncement,
  showChangelog,
  onDismiss,
  onMoreInfo,
  onCloseChangelog,
}: AnnouncementsOverlayProps) {
  if (showChangelog) {
    return <ChangelogPanel announcements={announcements} onClose={onCloseChangelog} />;
  }
  if (popupAnnouncement) {
    return <AnnouncementPopup announcement={popupAnnouncement} onDismiss={onDismiss} onMoreInfo={onMoreInfo} />;
  }
  return null;
}
