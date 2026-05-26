"use client";

import { useRef, useEffect, useState } from "react";
import type { ChatMessage } from "../types";

export function ChatPanel({
  messages,
  onSend,
  onClose,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClose?: () => void;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  return (
    <div
      style={{
        width: 220,
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
        <span>💬 Chat</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--t-text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", textAlign: "center", marginTop: 12 }}>
            Aucun message
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id ?? i} style={{ fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)" }}>
            <span style={{ color: "var(--t-accent)", fontWeight: "bold" }}>{m.displayName} : </span>
            <span style={{ color: "var(--t-text)" }}>{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ padding: 4, borderTop: "1px solid var(--t-border-dark)", display: "flex", gap: 4 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message…"
          style={{
            flex: 1,
            padding: "2px 4px",
            border: "2px solid",
            borderColor: "var(--t-border-dark) var(--t-border-light) var(--t-border-light) var(--t-border-dark)",
            background: "#fff",
            fontFamily: "var(--t-font-display)",
            fontSize: "var(--t-text-xs)",
            color: "#000",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "2px 6px",
            background: "var(--t-bg)",
            border: "2px solid",
            borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
            cursor: "pointer",
            fontSize: "var(--t-text-xs)",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
