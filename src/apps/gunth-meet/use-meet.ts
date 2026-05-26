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
  from: string;
  displayName: string;
  text: string;
  ts: number;
}

interface Peer {
  userId: string;
  displayName: string;
  pc: RTCPeerConnection;
  dc: RTCDataChannel | null;
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
    const iceServers = await fetchIceServers();
    const pc = new RTCPeerConnection({ iceServers });

    const peer: Peer = {
      userId: remoteId,
      displayName,
      pc,
      dc: null,
      stream: null,
      isSpeaking: false,
      isScreenSharing: false,
      makingOffer: false,
      ignoreOffer: false,
      polite,
    };

    // Add local tracks
    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current);
      }
    }

    // Data channel for chat (only the impolite peer creates it)
    if (!polite) {
      const dc = pc.createDataChannel("chat");
      peer.dc = dc;
      dc.onmessage = (e) => {
        const msg = JSON.parse(e.data) as ChatMessage;
        setChatMessages((prev) => [...prev, msg]);
      };
    } else {
      pc.ondatachannel = (e) => {
        peer.dc = e.channel;
        e.channel.onmessage = (ev) => {
          const msg = JSON.parse(ev.data) as ChatMessage;
          setChatMessages((prev) => [...prev, msg]);
        };
      };
    }

    // Remote tracks
    pc.ontrack = (e) => {
      peer.stream = e.streams[0] ?? null;
      updatePeersState();
    };

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal(remoteId, "ice-candidate", e.candidate.toJSON());
      }
    };

    // Negotiation needed (perfect negotiation pattern)
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

      // Connect SSE
      const es = new EventSource(`/api/meet/rooms/${roomId}/signal`);
      eventSourceRef.current = es;

      es.onopen = () => setConnected(true);
      es.onerror = () => setConnected(false);

      es.onmessage = async (e) => {
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
        }
      };

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

  // Toggle mute
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getAudioTracks()) {
      track.enabled = !track.enabled;
    }
    setIsMuted((prev) => !prev);
  }, []);

  // Toggle camera
  const toggleCam = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getVideoTracks()) {
      track.enabled = !track.enabled;
    }
    setIsCamOff((prev) => !prev);
  }, []);

  // Screen share
  const startScreenShare = useCallback(async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = screenStream;
    setScreenStream(screenStream);
    setIsScreenSharing(true);

    const screenTrack = screenStream.getVideoTracks()[0] ?? null;
    if (!screenTrack) return;

    // Replace video track in all peer connections
    for (const peer of peersRef.current.values()) {
      const sender = peer.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);
    }

    // Also replace in local stream for preview
    const localVideo = localStreamRef.current?.getVideoTracks()[0];
    if (localVideo) localVideo.enabled = false;

    screenTrack.onended = () => stopScreenShare();
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

  // Send chat message
  const sendChat = useCallback((text: string) => {
    const msg: ChatMessage = {
      from: currentUserId,
      displayName: currentDisplayName,
      text,
      ts: Date.now(),
    };
    setChatMessages((prev) => [...prev, msg]);
    for (const peer of peersRef.current.values()) {
      if (peer.dc?.readyState === "open") {
        peer.dc.send(JSON.stringify(msg));
      }
    }
  }, [currentUserId, currentDisplayName]);

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
