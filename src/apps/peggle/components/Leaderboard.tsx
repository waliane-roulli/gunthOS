"use client";

import type { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  currentUserId?: string;
  onRefresh: () => void;
  showLoginHint: boolean;
  onBack: () => void;
}

export function Leaderboard({ entries, loading, currentUserId, onRefresh, showLoginHint, onBack }: LeaderboardProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--t-bg)",
        fontFamily: "var(--t-font-display)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 8px",
          borderBottom: "2px solid var(--t-border-dark)",
          background: "var(--t-bg)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "3px 10px",
            fontSize: "var(--t-text-xs)",
            fontFamily: "var(--t-font-display)",
            cursor: "pointer",
            background: "var(--t-bg)",
            color: "var(--t-text)",
            borderWidth: 2,
            borderStyle: "solid",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
        >
          ◀ Menu
        </button>

        <span
          style={{
            fontSize: "var(--t-text-sm)",
            fontWeight: "bold",
            color: "var(--t-text)",
            flex: 1,
          }}
        >
          🏆 Classement — Top 10
        </span>

        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: "3px 10px",
            fontSize: "var(--t-text-xs)",
            fontFamily: "var(--t-font-display)",
            cursor: loading ? "default" : "pointer",
            background: "var(--t-bg)",
            color: "var(--t-text-muted)",
            borderWidth: 2,
            borderStyle: "solid",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "..." : "↻ Actualiser"}
        </button>
      </div>

      {/* Table container */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          margin: "12px 16px",
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
            gridTemplateColumns: "44px 1fr 36px 88px",
            gap: 8,
            padding: "6px 16px",
            borderBottom: "2px solid var(--t-border-dark)",
            background: "var(--t-bg)",
            position: "sticky",
            top: 0,
          }}
        >
          {["#", "JOUEUR", "FIN", "SCORE"].map((h, i) => (
            <span
              key={h}
              style={{
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-muted)",
                textAlign: i === 3 ? "right" : i === 2 ? "center" : "left",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {loading && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--t-text-muted)",
              fontSize: "var(--t-text-sm)",
            }}
          >
            Chargement...
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--t-text-muted)",
              fontSize: "var(--t-text-sm)",
            }}
          >
            Aucun score enregistré. Soyez le premier !
          </div>
        )}

        {!loading &&
          entries.map((entry, i) => {
            const name = entry.displayUsername || entry.username || entry.name;
            const isMe = currentUserId && entry.userId === currentUserId;
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            return (
              <div
                key={entry.userId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 36px 88px",
                  gap: 8,
                  alignItems: "center",
                  padding: "9px 16px",
                  borderBottom: "1px solid var(--t-border-dark)",
                  background: isMe
                    ? "var(--t-card-hover, rgba(255,255,255,0.06))"
                    : i % 2 === 0
                      ? "transparent"
                      : "rgba(0,0,0,0.04)",
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
                <span
                  style={{
                    fontSize: "var(--t-text-sm)",
                    fontWeight: "bold",
                    color: "var(--t-text)",
                    textAlign: "right",
                  }}
                >
                  {entry.score.toLocaleString()}
                </span>
              </div>
            );
          })}
      </div>

      {showLoginHint && (
        <div
          style={{
            margin: "0 16px 12px",
            padding: "8px 16px",
            fontSize: "var(--t-text-sm)",
            color: "var(--t-text-muted)",
            textAlign: "center",
            borderWidth: 2,
            borderStyle: "solid",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            background: "var(--t-app-bg)",
          }}
        >
          Connectez-vous pour apparaître dans le classement
        </div>
      )}
    </div>
  );
}
