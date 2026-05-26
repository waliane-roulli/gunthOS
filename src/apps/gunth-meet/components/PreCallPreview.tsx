"use client";

import { useEffect, useRef } from "react";

export function PreCallPreview({
  stream,
  isMuted,
  isCamOff,
  onToggleMute,
  onToggleCam,
  onJoin,
  onBack,
  roomId,
}: {
  stream: MediaStream | null;
  isMuted: boolean;
  isCamOff: boolean;
  onToggleMute: () => void;
  onToggleCam: () => void;
  onJoin: () => void;
  onBack: () => void;
  roomId: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream]);

  const hasVideo =
    stream && stream.getVideoTracks().some((t) => t.readyState === "live" && t.enabled) && !isCamOff;

  const btnStyle: React.CSSProperties = {
    padding: "4px 10px",
    border: "2px solid",
    borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
    cursor: "pointer",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-sm)",
    background: "var(--t-bg)",
    color: "var(--t-text)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: 24 }}>
      <div style={{ fontSize: "var(--t-text-md)", fontFamily: "var(--t-font-display)" }}>
        📹 Prêt à rejoindre ?
      </div>
      <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
        Room : <strong>{roomId}</strong>
      </div>

      {/* Preview video */}
      <div
        style={{
          width: 280,
          aspectRatio: "16/9",
          background: "var(--t-bg)",
          border: "2px solid",
          borderColor: "var(--t-border-dark) var(--t-border-light) var(--t-border-light) var(--t-border-dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", display: hasVideo ? "block" : "none" }}
        />
        {!hasVideo && (
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
              }}
            >
              👤
            </div>
            <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
              Caméra désactivée
            </span>
          </div>
        )}

        {/* Mic/cam status overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isMuted && (
            <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "1px 6px", fontSize: 11, fontFamily: "var(--t-font-display)" }}>
              🔇 Micro coupé
            </span>
          )}
        </div>
      </div>

      {/* Toggle controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onToggleMute} style={{ ...btnStyle, background: isMuted ? "var(--t-accent)" : "var(--t-bg)", color: isMuted ? "#fff" : "var(--t-text)" }}>
          {isMuted ? "🔇" : "🎤"}
        </button>
        <button onClick={onToggleCam} style={{ ...btnStyle, background: isCamOff ? "var(--t-accent)" : "var(--t-bg)", color: isCamOff ? "#fff" : "var(--t-text)" }}>
          {isCamOff ? "📷" : "📹"}
        </button>
      </div>

      {/* Join / Back */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={btnStyle}>
          ← Retour
        </button>
        <button
          onClick={onJoin}
          style={{
            ...btnStyle,
            background: "var(--t-accent)",
            color: "#fff",
            padding: "6px 20px",
          }}
        >
          Rejoindre
        </button>
      </div>
    </div>
  );
}
