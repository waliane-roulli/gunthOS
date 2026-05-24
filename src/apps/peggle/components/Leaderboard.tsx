"use client";

import type { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  currentUserId?: string;
  onRefresh: () => void;
  showLoginHint: boolean;
}

export function Leaderboard({ entries, loading, currentUserId, onRefresh, showLoginHint }: LeaderboardProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ padding: "16px 20px", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--t-text-md)", color: "var(--t-text)", fontFamily: "var(--t-font-display)", fontWeight: "bold" }}>
          🏆 Top 10 — Meilleurs scores
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: "4px 14px",
            fontSize: "var(--t-text-sm)",
            fontFamily: "var(--t-font-display)",
            cursor: "pointer",
            background: "var(--t-bg)",
            color: "var(--t-text-muted)",
            borderWidth: 2,
            borderStyle: "solid",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
        >
          {loading ? "..." : "↻ Actualiser"}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          borderWidth: 2,
          borderStyle: "solid",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
          background: "var(--t-app-bg)",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 36px 80px",
            gap: 8,
            padding: "8px 16px",
            borderBottom: "2px solid var(--t-border-dark)",
            background: "var(--t-bg)",
            position: "sticky",
            top: 0,
          }}
        >
          <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>#</span>
          <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>JOUEUR</span>
          <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", textAlign: "center" }}>FIN</span>
          <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", textAlign: "right" }}>SCORE</span>
        </div>

        {loading && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--t-text-muted)", fontSize: "var(--t-text-sm)" }}>
            Chargement...
          </div>
        )}
        {!loading && entries.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--t-text-muted)", fontSize: "var(--t-text-sm)" }}>
            Aucun score enregistré. Soyez le premier !
          </div>
        )}
        {!loading && entries.map((entry, i) => {
          const name = entry.displayUsername || entry.username || entry.name;
          const isMe = currentUserId && entry.userId === currentUserId;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
          return (
            <div
              key={entry.userId}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr 36px 80px",
                gap: 8,
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: "1px solid var(--t-border-dark)",
                background: isMe ? "var(--t-card-hover, rgba(255,255,255,0.06))" : i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.04)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              <span style={{ fontSize: "var(--t-text-sm)", textAlign: "center" }}>{medal}</span>
              <span
                style={{
                  fontSize: "var(--t-text-sm)",
                  color: isMe ? "var(--t-accent)" : "var(--t-text)",
                  fontWeight: isMe ? "bold" : "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}{isMe ? " (vous)" : ""}
              </span>
              <span style={{ fontSize: "var(--t-text-sm)", textAlign: "center" }}>
                {entry.won ? "🎉" : "💀"}
              </span>
              <span style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold", color: "var(--t-text)", textAlign: "right" }}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {showLoginHint && (
        <div
          style={{
            padding: "10px 16px",
            fontSize: "var(--t-text-sm)",
            color: "var(--t-text-muted)",
            textAlign: "center",
            borderWidth: 2,
            borderStyle: "solid",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
          }}
        >
          Connectez-vous pour apparaître dans le classement
        </div>
      )}
    </div>
  );
}
