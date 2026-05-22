"use client";

import { raisedStyle } from "../helpers";
import { TITLEBAR_GRADIENT } from "../constants";

interface Notification {
  id: number;
  text: string;
  icon: string;
  read: boolean;
}

interface NotificationsTabProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkOneRead: (id: number) => void;
  onDeleteNotif: (id: number) => void;
  onShowPremium: () => void;
}

export function NotificationsTab({ notifications, onMarkAllRead, onMarkOneRead, onDeleteNotif, onShowPremium }: NotificationsTabProps) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
      <div className="px-2 py-1 text-sm" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
        🔔 Notifications ({unread} non lues)
      </div>
      <div className="flex justify-between items-center p-1" style={{ backgroundColor: "var(--t-bg)" }}>
        <span className="text-xs px-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </span>
        <button onClick={onMarkAllRead} className="px-2 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>
          Tout marquer lu
        </button>
      </div>
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => onMarkOneRead(n.id)}
          className="flex items-start gap-2 px-2 py-2 border-b cursor-default"
          style={{ borderColor: "var(--t-border-dark)", backgroundColor: n.read ? "var(--t-bg)" : "var(--t-card-hover)" }}
        >
          <span className="text-xl shrink-0">{n.icon}</span>
          <div className="flex-1">
            <div className="text-sm" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>{n.text}</div>
            {!n.read && <div className="text-xs" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>Nouveau</div>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDeleteNotif(n.id); }} className="text-xs px-1.5 py-0.5 border-2 shrink-0 opacity-50 hover:opacity-100" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>✕</button>
          {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: "var(--t-accent)" }} />}
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="py-8 text-center" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
          <div className="text-2xl mb-1">🎉</div>
          <div className="text-sm">Aucune notification.</div>
          <div className="text-xs mt-1" style={{ color: "var(--t-text-subtle)" }}>Profitez-en, ça ne durera pas.</div>
        </div>
      )}
      <div className="px-2 py-1.5 text-center text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", backgroundColor: "var(--t-bg-dark)" }}>
        💡 Astuce Premium : recevez encore plus de notifications inutiles pour 29,99€/mois
      </div>
    </div>
  );
}
