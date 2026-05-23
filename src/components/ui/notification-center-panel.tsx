"use client";

import { useState, useEffect, useCallback } from "react";
import { useOpenApp } from "@/lib/hooks/use-open-app";

export interface DbNotification {
  id: number;
  userId: string;
  source: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string | null;
  read: boolean;
  actionAppSlug?: string | null;
  createdAt: string | Date;
}

const SOURCE_META: Record<string, { icon: string; label: string }> = {
  msn: { icon: "💬", label: "GunthMessenger" },
  "linked-gunth": { icon: "💼", label: "LinkedGunth" },
  "gunther-board": { icon: "📋", label: "GuntherBoard" },
  system: { icon: "🖥️", label: "Système" },
};

function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `${days}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface Props {
  anchorBottom: number;
  anchorRight: number;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

export function NotificationCenterPanel({ anchorBottom, anchorRight, onClose, onUnreadChange }: Props) {
  const [items, setItems] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { openApp } = useOpenApp();

  const fetchItems = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) {
        const data = await r.json() as { notifications: DbNotification[]; unread: number };
        setItems(data.notifications);
        onUnreadChange(data.unread);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [onUnreadChange]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: null }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    onUnreadChange(0);
  };

  const clearAll = async () => {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setItems([]);
    onUnreadChange(0);
  };

  const handleItemClick = async (notif: DbNotification) => {
    if (!notif.read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      });
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      onUnreadChange(Math.max(0, items.filter((n) => !n.read).length - 1));
    }
    if (notif.actionAppSlug) openApp(notif.actionAppSlug);
    onClose();
  };

  const hasUnread = items.some((n) => !n.read);

  const panelStyle: React.CSSProperties = {
    bottom: anchorBottom,
    right: anchorRight,
    width: 320,
    maxHeight: 460,
    backgroundColor: "var(--t-bg)",
    borderTopColor: "var(--t-border-light)",
    borderLeftColor: "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
    boxShadow: "var(--t-window-shadow)",
    fontFamily: "var(--t-font-display)",
  };

  const titlebarStyle: React.CSSProperties = {
    background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
    color: "var(--t-titlebar-text)",
    borderBottomColor: "var(--t-border-dark)",
  };

  const btnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "var(--t-titlebar-text)",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-xs)",
    cursor: "pointer",
    padding: "0 4px",
  };

  return (
    <>
      <div className="fixed inset-0 z-[9000]" onClick={onClose} />
      <div className="fixed z-[9001] border-[2px] flex flex-col" style={panelStyle}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-2 py-1 border-b shrink-0"
          style={titlebarStyle}
        >
          <span className="font-bold tracking-widest" style={{ fontSize: "var(--t-text-sm)" }}>
            🔔 Notifications
          </span>
          <div className="flex items-center gap-1">
            {hasUnread && (
              <button onClick={markAllRead} style={btnStyle} title="Tout marquer comme lu">
                ✓ Lu
              </button>
            )}
            {items.length > 0 && (
              <button onClick={clearAll} style={btnStyle} title="Effacer tout">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: "thin" }}>
          {loading ? (
            <div
              className="p-4 text-center"
              style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-sm)" }}
            >
              Chargement…
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 flex flex-col items-center gap-2">
              <span style={{ fontSize: 32 }}>🔔</span>
              <span style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-sm)" }}>
                Aucune notification
              </span>
            </div>
          ) : (
            items.map((notif) => {
              const meta = SOURCE_META[notif.source] ?? { icon: "📢", label: notif.source };
              return (
                <button
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className="w-full text-left flex items-start gap-2 px-3 py-2 border-b cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: notif.read ? "transparent" : "color-mix(in srgb, var(--t-accent) 8%, transparent)",
                    borderBottomColor: "var(--t-border-dark)",
                    color: "var(--t-text)",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1.3, flexShrink: 0 }}>{meta.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className="truncate leading-snug"
                        style={{
                          fontSize: "var(--t-text-sm)",
                          fontWeight: notif.read ? "normal" : "bold",
                          display: "block",
                          maxWidth: "200px",
                        }}
                      >
                        {notif.title}
                      </span>
                      <span
                        className="shrink-0 tabular-nums"
                        style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginTop: 2 }}
                      >
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    {notif.message && (
                      <p
                        className="truncate"
                        style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginTop: 1 }}
                      >
                        {notif.message}
                      </p>
                    )}
                    <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                      {meta.label}
                    </span>
                  </div>

                  {!notif.read && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "var(--t-accent)",
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
