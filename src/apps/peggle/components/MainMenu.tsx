"use client";

import { captionBtn } from "../styles";

interface MainMenuProps {
  bestScore: number;
  displayName: string | null;
  onPlay: () => void;
  onLeaderboard: () => void;
}

export function MainMenu({ bestScore, displayName, onPlay, onLeaderboard }: MainMenuProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#008080",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "var(--t-font-display)",
      }}
    >
      {/* Win98 dialog */}
      <div
        style={{
          background: "var(--t-bg)",
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
          boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
          width: 300,
          flexShrink: 0,
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            padding: "4px 6px 4px 8px",
            gap: 4,
          }}
        >
          <span style={{ fontSize: "var(--t-text-xs)", color: "#fff", flex: 1 }}>
            🎮 Peggle 98
          </span>
          {(["─", "□", "×"] as const).map((ch) => (
            <div key={ch} style={captionBtn}>{ch}</div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 22px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            {/* Big retro title in a sunken box */}
            <div
              style={{
                display: "inline-block",
                padding: "10px 24px",
                marginBottom: 10,
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
                background: "var(--t-app-bg)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--t-text-3xl)",
                  fontWeight: "bold",
                  letterSpacing: "0.06em",
                  lineHeight: 1,
                  color: "var(--t-text)",
                }}
              >
                PEGGLE 98
              </div>
            </div>
            <div
              style={{
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-muted)",
                letterSpacing: "0.06em",
              }}
            >
              🪟 Cassez toutes les fenêtres !
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <button
              onClick={onPlay}
              autoFocus
              style={{
                padding: "11px 0",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-md)",
                fontWeight: "bold",
                cursor: "pointer",
                background: "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))",
                color: "#fff",
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-light)",
                borderLeftColor: "var(--t-border-light)",
                borderBottomColor: "var(--t-border-dark)",
                borderRightColor: "var(--t-border-dark)",
                width: "100%",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              ▶  NOUVELLE PARTIE
            </button>
            <button
              onClick={onLeaderboard}
              style={{
                padding: "8px 0",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-sm)",
                cursor: "pointer",
                background: "var(--t-bg)",
                color: "var(--t-text)",
                borderWidth: 2,
                borderStyle: "solid",
                borderTopColor: "var(--t-border-light)",
                borderLeftColor: "var(--t-border-light)",
                borderBottomColor: "var(--t-border-dark)",
                borderRightColor: "var(--t-border-dark)",
                width: "100%",
                lineHeight: 1,
              }}
            >
              🏆  Classement
            </button>
          </div>

          {/* Separator */}
          <div
            style={{
              height: 0,
              borderTop: "1px solid var(--t-border-dark)",
              borderBottom: "1px solid var(--t-border-light)",
              marginBottom: 12,
            }}
          />

          {/* Footer info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
            }}
          >
            <span>
              {bestScore > 0 ? (
                <>⭐ Meilleur : <strong style={{ color: "var(--t-text)" }}>{bestScore.toLocaleString()}</strong></>
              ) : (
                "Aucun score encore"
              )}
            </span>
            <span>{displayName ? `👤 ${displayName}` : "Non connecté"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
