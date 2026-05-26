"use client";

import { useState, useEffect } from "react";
import type { AppProps } from "@/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { Lobby } from "./components/Lobby";
import { CallScreen } from "./components/CallScreen";
import { PreCallPreview } from "./components/PreCallPreview";
import { useLocalMedia } from "./hooks/use-local-media";

type Screen = "lobby" | "preview" | "call";

export function GunthMeetApp({ windowId: _windowId }: AppProps) {
  const { user, isPending } = useAuth();
  const [screen, setScreen] = useState<Screen>("lobby");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Preview media — initialized once and reused in the call
  const previewMedia = useLocalMedia();

  // Handle ?room= query param for invitation links
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam && /^[a-zA-Z0-9_-]{1,32}$/.test(roomParam)) {
      setRoomId(roomParam);
      setScreen("preview");
    }
  }, []);

  const handleLobbyJoin = (id: string, host = false) => {
    setRoomId(id);
    setIsHost(host);
    setScreen("preview");
  };

  const handlePreviewJoin = () => {
    setScreen("call");
  };

  const handleLeave = () => {
    setRoomId(null);
    setIsHost(false);
    setScreen("lobby");
  };

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

  if (screen === "lobby") {
    return <Lobby onJoin={handleLobbyJoin} />;
  }

  if (screen === "preview" && roomId) {
    return (
      <PreCallPreview
        stream={previewMedia.localStream}
        isMuted={previewMedia.isMuted}
        isCamOff={previewMedia.isCamOff}
        onToggleMute={previewMedia.toggleMute}
        onToggleCam={previewMedia.toggleCam}
        onJoin={handlePreviewJoin}
        onBack={handleLeave}
        roomId={roomId}
      />
    );
  }

  if (screen === "call" && roomId) {
    return (
      <CallScreen
        roomId={roomId}
        userId={user.id}
        displayName={user.name ?? user.email ?? user.id}
        isHost={isHost}
        media={previewMedia}
        onLeave={handleLeave}
      />
    );
  }

  return null;
}
