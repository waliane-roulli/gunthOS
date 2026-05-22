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
    <div className="flex flex-col flex-1 overflow-hidden" style={{ padding: 12, gap: 8, display: "flex" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--t-text-sm)", color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>
          🏆 Top 10 — Meilleurs scores
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: "3px 10px",
            fontSize: "var(--t-text-xs)",
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
          {loading ? "..." : "↻"}
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
        {loading && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
            Chargement...
          </div>
        )}
        {!loading && entries.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
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
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 12px",
                borderBottom: "1px solid var(--t-border-dark)",
                background: isMe ? "var(--t-card-hover)" : "transparent",
                fontFamily: "var(--t-font-display)",
              }}
            >
              <span style={{ fontSize: "var(--t-text-sm)", minWidth: 28, textAlign: "center" }}>{medal}</span>
              <span
                style={{
                  flex: 1,
                  fontSize: "var(--t-text-xs)",
                  color: isMe ? "var(--t-accent)" : "var(--t-text)",
                  fontWeight: isMe ? "bold" : "normal",
                }}
              >
                {name}{isMe ? " (vous)" : ""}
              </span>
              <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                {entry.won ? "🎉" : "💀"}
              </span>
              <span style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold", color: "var(--t-text)", minWidth: 60, textAlign: "right" }}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {showLoginHint && (
        <div
          style={{
            padding: "6px 12px",
            fontSize: "var(--t-text-xs)",
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
