"use client";

import { useState } from "react";

export function Lobby({ onJoin }: { onJoin: (roomId: string, isHost: boolean) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = async (roomId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const body = roomId ? { roomId } : {};
      const isCreating = !roomId;
      const res = await fetch("/api/meet/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const { roomId: id } = await res.json();
      onJoin(id, isCreating || id === "general");
    } catch {
      setError("Impossible de rejoindre cette room.");
      setLoading(false);
    }
  };

  const btnBase: React.CSSProperties = {
    padding: "6px 14px",
    border: "2px solid",
    borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
    cursor: "pointer",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-sm)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: 24 }}>
      <div style={{ fontSize: "var(--t-text-xl)", fontFamily: "var(--t-font-display)" }}>📹 GunthMeet™</div>
      <div style={{ fontSize: "var(--t-text-sm)", color: "var(--t-text-muted)", textAlign: "center" }}>
        Visioconférence P2P — aucun serveur intermédiaire
      </div>

      <div
        style={{
          border: "2px solid",
          borderColor: "var(--t-border-dark) var(--t-border-light) var(--t-border-light) var(--t-border-dark)",
          padding: 16,
          background: "var(--t-app-bg)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 320,
        }}
      >
        {error && (
          <div style={{ fontSize: "var(--t-text-xs)", color: "#c0392b", fontFamily: "var(--t-font-display)" }}>
            {error}
          </div>
        )}

        <button
          onClick={() => joinRoom("general")}
          disabled={loading}
          style={{ ...btnBase, background: "var(--t-accent)", color: "#fff" }}
        >
          🌐 Rejoindre la room générale
        </button>

        <button
          onClick={() => joinRoom()}
          disabled={loading}
          style={{ ...btnBase, background: "var(--t-bg)", color: "var(--t-text)" }}
        >
          + Créer une room privée
        </button>

        <div style={{ borderTop: "1px solid var(--t-border-dark)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
            Rejoindre avec un code :
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && joinRoom(input.trim())}
              placeholder="Code room…"
              style={{
                flex: 1,
                padding: "3px 6px",
                border: "2px solid",
                borderColor: "var(--t-border-dark) var(--t-border-light) var(--t-border-light) var(--t-border-dark)",
                background: "#fff",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-sm)",
                color: "#000",
              }}
            />
            <button
              onClick={() => input.trim() && joinRoom(input.trim())}
              disabled={!input.trim() || loading}
              style={{ ...btnBase, padding: "3px 10px", background: "var(--t-bg)" }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
