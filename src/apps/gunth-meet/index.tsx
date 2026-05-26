"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AppProps } from "@/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { useMeet } from "./use-meet";

// ── Video tile ────────────────────────────────────────────────────────────────

function VideoTile({
  stream,
  label,
  muted = false,
  isScreenSharing = false,
  noVideo = false,
}: {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  isScreenSharing?: boolean;
  noVideo?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().some((t) => t.enabled) && !noVideo;

  return (
    <div
      style={{
        position: "relative",
        background: "var(--t-bg)",
        border: "2px solid",
        borderColor: "var(--t-border-dark) var(--t-border-light) var(--t-border-light) var(--t-border-dark)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
        aspectRatio: "16/9",
      }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--t-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              color: "#fff",
              fontFamily: "var(--t-font-display)",
            }}
          >
            {label.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            {isScreenSharing ? "🖥 Partage en cours" : "Caméra off"}
          </span>
        </div>
      )}

      {/* Label bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.55)",
          padding: "2px 6px",
          fontSize: "var(--t-text-xs)",
          color: "#fff",
          fontFamily: "var(--t-font-display)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {isScreenSharing && "🖥 "}
        {label}
        {muted && " 🔇"}
      </div>
    </div>
  );
}

// ── Control button ────────────────────────────────────────────────────────────

function CtrlBtn({
  active,
  danger,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "4px 10px",
        background: danger ? "#c0392b" : active ? "var(--t-accent)" : "var(--t-bg)",
        color: danger || active ? "#fff" : "var(--t-text)",
        border: "2px solid",
        borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
        cursor: "pointer",
        fontFamily: "var(--t-font-display)",
        fontSize: "var(--t-text-sm)",
        minWidth: 36,
      }}
    >
      {children}
    </button>
  );
}

// ── Lobby screen ──────────────────────────────────────────────────────────────

function Lobby({
  onJoin,
}: {
  onJoin: (roomId: string) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    const res = await fetch("/api/meet/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const { roomId } = await res.json();
    onJoin(roomId);
  };

  const joinRoom = async () => {
    if (!input.trim()) return;
    setLoading(true);
    await fetch("/api/meet/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId: input.trim() }) });
    onJoin(input.trim());
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
        <button
          onClick={createRoom}
          disabled={loading}
          style={{
            padding: "6px 14px",
            background: "var(--t-accent)",
            color: "#fff",
            border: "2px solid",
            borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
            cursor: "pointer",
            fontFamily: "var(--t-font-display)",
            fontSize: "var(--t-text-sm)",
          }}
        >
          + Créer une room
        </button>

        <div style={{ borderTop: "1px solid var(--t-border-dark)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
            Rejoindre avec un code :
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
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
              onClick={joinRoom}
              disabled={!input.trim() || loading}
              style={{
                padding: "3px 10px",
                background: "var(--t-bg)",
                border: "2px solid",
                borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
                cursor: "pointer",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-sm)",
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Call screen ───────────────────────────────────────────────────────────────

function CallScreen({
  roomId,
  userId,
  displayName,
  onLeave,
}: {
  roomId: string;
  userId: string;
  displayName: string;
  onLeave: () => void;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    peers,
    localStream,
    screenStream,
    isMuted,
    isCamOff,
    isScreenSharing,
    chatMessages,
    connected,
    toggleMute,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    sendChat,
  } = useMeet(roomId, userId, displayName);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    sendChat(text);
    setChatInput("");
  };

  const allTiles = [
    { key: "local", stream: isScreenSharing ? screenStream : localStream, label: `${displayName} (vous)`, muted: true, isScreenSharing },
    ...[...peers.values()].map((p) => ({
      key: p.userId,
      stream: p.stream,
      label: p.displayName,
      muted: false,
      isScreenSharing: p.isScreenSharing,
    })),
  ];

  const cols = Math.ceil(Math.sqrt(allTiles.length));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--t-bg)" }}>
      {/* Header */}
      <div
        style={{
          padding: "2px 8px",
          background: "var(--t-titlebar-from)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--t-border-dark)",
        }}
      >
        <span style={{ fontSize: "var(--t-text-xs)", color: "#fff", fontFamily: "var(--t-font-display)" }}>
          📹 Room : <strong>{roomId}</strong> — {peers.size + 1} participant{peers.size !== 0 ? "s" : ""}
          {!connected && " · ⚠️ reconnexion…"}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)" }}
          title="Copier le code"
        >
          📋 Copier
        </button>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Video grid */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 4,
            padding: 4,
            overflow: "auto",
            alignContent: "start",
          }}
        >
          {allTiles.map((tile) => (
            <VideoTile
              key={tile.key}
              stream={tile.stream}
              label={tile.label}
              muted={tile.muted}
              isScreenSharing={tile.isScreenSharing}
              noVideo={tile.key === "local" && isCamOff && !isScreenSharing}
            />
          ))}
        </div>

        {/* Chat panel */}
        {chatOpen && (
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
              }}
            >
              💬 Chat
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)" }}>
                  <span style={{ color: "var(--t-accent)", fontWeight: "bold" }}>{m.displayName} : </span>
                  <span style={{ color: "var(--t-text)" }}>{m.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: 4, borderTop: "1px solid var(--t-border-dark)", display: "flex", gap: 4 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
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
                onClick={handleSendChat}
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
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          padding: "4px 8px",
          borderTop: "2px solid var(--t-border-dark)",
          background: "var(--t-bg)",
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <CtrlBtn onClick={toggleMute} active={isMuted} title={isMuted ? "Activer micro" : "Couper micro"}>
          {isMuted ? "🔇" : "🎤"}
        </CtrlBtn>
        <CtrlBtn onClick={toggleCam} active={isCamOff} title={isCamOff ? "Activer caméra" : "Couper caméra"}>
          {isCamOff ? "📷" : "📹"}
        </CtrlBtn>
        <CtrlBtn
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          active={isScreenSharing}
          title={isScreenSharing ? "Arrêter partage" : "Partager l'écran"}
        >
          🖥
        </CtrlBtn>
        <CtrlBtn onClick={() => setChatOpen((p) => !p)} active={chatOpen} title="Chat">
          💬
        </CtrlBtn>
        <div style={{ flex: 1 }} />
        <CtrlBtn onClick={onLeave} danger title="Raccrocher">
          📵 Raccrocher
        </CtrlBtn>
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

export function GunthMeetApp({ windowId: _windowId }: AppProps) {
  const { user, isPending } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);

  if (isPending) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "var(--t-text-sm)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
        Chargement…
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "var(--t-text-sm)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
        Connexion requise
      </div>
    );
  }

  if (!roomId) {
    return <Lobby onJoin={setRoomId} />;
  }

  return (
    <CallScreen
      roomId={roomId}
      userId={user.id}
      displayName={user.name ?? user.email ?? user.id}
      onLeave={() => setRoomId(null)}
    />
  );
}
