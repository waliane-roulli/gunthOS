"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface RemotePeer {
  userId: string;
  displayName: string;
  stream: MediaStream | null;
  isSpeaking: boolean;
  isScreenSharing: boolean;
}

export interface ChatMessage {
  id?: string;
  from: string;
  displayName: string;
  text: string;
  ts: number;
}

interface Peer {
  userId: string;
  displayName: string;
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  polite: boolean;
}

async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await fetch("/api/meet/ice-config");
    if (!res.ok) throw new Error();
    const { iceServers } = await res.json();
    return iceServers;
  } catch {
    return [{ urls: "stun:stun.l.google.com:19302" }];
  }
}

export function useMeet(roomId: string, currentUserId: string, currentDisplayName: string) {
  const [peers, setPeers] = useState<Map<string, RemotePeer>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  const peersRef = useRef<Map<string, Peer>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const iceServersRef = useRef<RTCIceServer[] | null>(null);
  const stopScreenShareRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const updatePeersState = useCallback(() => {
    setPeers(new Map(
      [...peersRef.current.entries()].map(([id, p]) => [id, {
        userId: p.userId,
        displayName: p.displayName,
        stream: p.stream,
        isSpeaking: p.isSpeaking,
        isScreenSharing: p.isScreenSharing,
      }])
    ));
  }, []);

  const sendSignal = useCallback(async (to: string, type: string, payload: unknown) => {
    await fetch(`/api/meet/rooms/${roomId}/signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, type, payload }),
    });
  }, [roomId]);

  const createPeerConnection = useCallback(async (remoteId: string, displayName: string, polite: boolean): Promise<Peer> => {
    if (!iceServersRef.current) {
      iceServersRef.current = await fetchIceServers();
    }
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    const peer: Peer = {
      userId: remoteId,
      displayName,
      pc,
      stream: null,
      isSpeaking: false,
      isScreenSharing: false,
      makingOffer: false,
      ignoreOffer: false,
      polite,
    };

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current);
      }
    }


    pc.ontrack = (e) => {
      peer.stream = e.streams[0] ?? null;
      updatePeersState();
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal(remoteId, "ice-candidate", e.candidate.toJSON());
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        peer.makingOffer = true;
        await pc.setLocalDescription();
        sendSignal(remoteId, "offer", pc.localDescription);
      } catch (err) {
        console.error("negotiationneeded error", err);
      } finally {
        peer.makingOffer = false;
      }
    };

    pc.onconnectionstatechange = () => {
      updatePeersState();
    };

    peersRef.current.set(remoteId, peer);
    updatePeersState();
    return peer;
  }, [sendSignal, updatePeersState]);

  const handleSignal = useCallback(async (from: string, type: string, payload: unknown) => {
    const peer = peersRef.current.get(from);
    if (!peer) return;
    const { pc } = peer;

    if (type === "offer" || type === "answer") {
      const desc = payload as RTCSessionDescriptionInit;
      const offerCollision = type === "offer" && (peer.makingOffer || pc.signalingState !== "stable");
      peer.ignoreOffer = !peer.polite && offerCollision;
      if (peer.ignoreOffer) return;

      await pc.setRemoteDescription(desc);
      if (type === "offer") {
        await pc.setLocalDescription();
        sendSignal(from, "answer", pc.localDescription);
      }
    } else if (type === "ice-candidate") {
      try {
        await pc.addIceCandidate(payload as RTCIceCandidateInit);
      } catch (err) {
        if (!peer.ignoreOffer) console.error("ICE error", err);
      }
    }
  }, [sendSignal]);

  // Init local media + SSE
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function init() {
      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() =>
        navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => new MediaStream())
      );
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Load chat history
      try {
        const res = await fetch(`/api/meet/rooms/${roomId}/messages`);
        if (res.ok) {
          const { messages } = await res.json() as { messages: Array<{ id: string; userId: string; displayName: string; content: string; createdAt: number }> };
          setChatMessages(messages.map((m) => ({
            id: m.id,
            from: m.userId,
            displayName: m.displayName,
            text: m.content,
            ts: m.createdAt,
          })));
        }
      } catch {
        // not critical
      }

      // Connect SSE
      const es = new EventSource(`/api/meet/rooms/${roomId}/signal`);
      eventSourceRef.current = es;

      es.onopen = () => setConnected(true);
      es.onerror = () => setConnected(false);

      es.addEventListener("message", (e: MessageEvent) => {
        void (async () => {
          const data = JSON.parse(e.data);

          if (data.kind === "room-state") {
            for (const p of data.participants as { userId: string; displayName: string }[]) {
              if (p.userId === currentUserId) continue;
              if (!peersRef.current.has(p.userId)) {
                await createPeerConnection(p.userId, p.displayName, true);
              }
            }
          } else if (data.kind === "peer-joined") {
            const p = data.participant as { userId: string; displayName: string };
            if (p.userId !== currentUserId && !peersRef.current.has(p.userId)) {
              await createPeerConnection(p.userId, p.displayName, false);
            }
          } else if (data.kind === "peer-left") {
            const peer = peersRef.current.get(data.userId);
            if (peer) {
              peer.pc.close();
              peersRef.current.delete(data.userId);
              updatePeersState();
            }
          } else if (data.kind === "signal") {
            await handleSignal(data.from, data.type, data.payload);
          } else if (data.kind === "chat") {
            const m = data.message as { id: string; userId: string; displayName: string; content: string; createdAt: number };
            // Don't duplicate our own messages (already shown optimistically)
            setChatMessages((prev) => {
              if (m.userId === currentUserId) return prev;
              return [...prev, { id: m.id, from: m.userId, displayName: m.displayName, text: m.content, ts: m.createdAt }];
            });
          }
        })();
      });

      cleanup = () => {
        es.close();
        for (const peer of peersRef.current.values()) peer.pc.close();
        peersRef.current.clear();
        stream.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      };
    }

    init();
    return () => cleanup?.();
  }, [roomId, currentUserId, createPeerConnection, handleSignal, updatePeersState]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getAudioTracks()) {
      track.enabled = !track.enabled;
    }
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCam = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getVideoTracks()) {
      track.enabled = !track.enabled;
    }
    setIsCamOff((prev) => !prev);
  }, []);

  const startScreenShare = useCallback(async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = screenStream;
    setScreenStream(screenStream);
    setIsScreenSharing(true);

    const screenTrack = screenStream.getVideoTracks()[0] ?? null;
    if (!screenTrack) return;

    for (const peer of peersRef.current.values()) {
      const sender = peer.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);
    }

    const localVideo = localStreamRef.current?.getVideoTracks()[0];
    if (localVideo) localVideo.enabled = false;

    screenTrack.onended = () => stopScreenShareRef.current();
  }, []);

  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    setIsScreenSharing(false);

    const localVideo = localStreamRef.current?.getVideoTracks()[0];
    if (localVideo) {
      localVideo.enabled = true;
      for (const peer of peersRef.current.values()) {
        const sender = peer.pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(localVideo);
      }
    }
  }, []);
  stopScreenShareRef.current = stopScreenShare;

  // Send chat message — persisted via API, broadcast via SSE
  const sendChat = useCallback(async (text: string) => {
    const optimistic: ChatMessage = {
      from: currentUserId,
      displayName: currentDisplayName,
      text,
      ts: Date.now(),
    };
    setChatMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`/api/meet/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
    } catch {
      // message already shown optimistically, fail silently
    }
  }, [roomId, currentUserId, currentDisplayName]);

  return {
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
  };
}
