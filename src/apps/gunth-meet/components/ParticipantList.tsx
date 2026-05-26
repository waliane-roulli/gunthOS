"use client";

import type { RemotePeer } from "../types";

export function ParticipantList({
  localName,
  localIsMuted,
  localIsCamOff,
  isLocalHost,
  peers,
  onHostMute,
  onClose,
}: {
  localName: string;
  localIsMuted: boolean;
  localIsCamOff: boolean;
  isLocalHost: boolean;
  peers: Map<string, RemotePeer>;
  onHostMute?: (userId: string) => void;
  onClose?: () => void;
}) {
  const all = [
    { userId: "local", displayName: `${localName} (vous)`, isMuted: localIsMuted, isCamOff: localIsCamOff, isHost: isLocalHost, isLocal: true },
    ...[...peers.values()].map((p) => ({ ...p, isLocal: false })),
  ];

  return (
    <div
      style={{
        width: 180,
        display: "flex",
        flexDirection: "column",
        borderLeft: "2px solid var(--t-border-dark)",
        background: "var(--t-app-bg)",
      }}
    >
      <div
        style={{
          padding: "3px 6px",
          background: "var(--t-bg)",
          borderBottom: "1px solid var(--t-border-dark)",
          fontSize: "var(--t-text-xs)",
          fontFamily: "var(--t-font-display)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>👥 Participants ({all.length})</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--t-text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        {all.map((p) => (
          <div
            key={p.userId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 4px",
              fontSize: "var(--t-text-xs)",
              fontFamily: "var(--t-font-display)",
              color: "var(--t-text)",
              background: p.isLocal ? "rgba(0,0,0,0.04)" : "transparent",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--t-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {p.displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.displayName}
              {p.isHost && " 👑"}
            </span>
            <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
              {p.isMuted && <span title="Micro coupé">🔇</span>}
              {p.isCamOff && <span title="Caméra coupée">📷</span>}
              {isLocalHost && !p.isLocal && onHostMute && (
                <button
                  onClick={() => onHostMute(p.userId)}
                  title="Couper le micro"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "var(--t-text-muted)",
                    padding: 0,
                  }}
                >
                  🔇
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
