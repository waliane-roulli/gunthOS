"use client";

import { useEffect, useRef, useState } from "react";
import {
  useNotificationState,
  useNotificationActions,
  type Notification,
  type NotificationType,
} from "@/lib/contexts/notification-context";

const ICONS: Record<NotificationType, string> = {
  info:    "ℹ",
  success: "✓",
  warning: "⚠",
  error:   "✕",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  info:    "var(--t-titlebar-from)",
  success: "var(--t-success)",
  warning: "var(--t-warning)",
  error:   "var(--t-error)",
};

function NotificationToast({ notif, onDismiss }: { notif: Notification; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 280);
  };

  useEffect(() => {
    if (notif.duration === null) return;

    const duration = notif.duration;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [notif.duration]);

  const accentColor = TYPE_COLORS[notif.type];

  return (
    <div
      style={{
        animation: exiting
          ? "slideOut 0.28s ease forwards"
          : "slideIn 0.22s ease forwards",
        background: "var(--t-bg)",
        border: "2px solid",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
        boxShadow: "var(--t-window-shadow)",
        width: 280,
        fontFamily: "var(--t-font-body)",
        overflow: "hidden",
        pointerEvents: "all",
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          background: `linear-gradient(to right, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, var(--t-bg)))`,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 4px 3px 6px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontFamily: "var(--t-font-display)",
            fontSize: "var(--t-text-base)",
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ICONS[notif.type]}&nbsp;{notif.title}
        </span>
        <button
          onClick={handleDismiss}
          style={{
            background: "var(--t-bg)",
            border: "2px solid",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
            color: "var(--t-text)",
            width: 16,
            height: 14,
            lineHeight: "10px",
            fontSize: 10,
            cursor: "pointer",
            flexShrink: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      {notif.message && (
        <div
          style={{
            padding: "6px 8px",
            color: "var(--t-text)",
            fontSize: "var(--t-text-sm)",
            borderBottom: notif.duration !== null ? "1px solid var(--t-border-dark)" : undefined,
          }}
        >
          {notif.message}
        </div>
      )}

      {/* Progress bar */}
      {notif.duration !== null && (
        <div style={{ height: 3, background: "var(--t-bg-dark)" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(to right, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, var(--t-titlebar-to)))`,
              transition: "width 0.05s linear",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function NotificationLayer() {
  const { notifications } = useNotificationState();
  const { dismiss } = useNotificationActions();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 98000,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        pointerEvents: "none",
      }}
    >
      {notifications.map((n) => (
        <NotificationToast key={n.id} notif={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  );
}
