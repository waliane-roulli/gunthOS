"use client";

import { useRef, useState, useCallback } from "react";
import type { RemotePeer, SseEvent, SignalType } from "../types";

interface InternalPeer {
  userId: string;
  displayName: string;
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  isMuted: boolean;
  isCamOff: boolean;
  isHost: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  polite: boolean;
  pendingCandidates: RTCIceCandidateInit[];
  hasRemoteDescription: boolean;
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

export interface UseWebRtcReturn {
  peers: Map<string, RemotePeer>;
  peersRef: React.MutableRefObject<Map<string, InternalPeer>>;
  createPeerConnection: (
    remoteId: string,
    displayName: string,
    polite: boolean,
    localStreamRef: React.MutableRefObject<MediaStream | null>,
    isHost: boolean,
  ) => Promise<void>;
  handleSignal: (from: string, type: string, payload: unknown) => Promise<void>;
  removePeer: (userId: string) => void;
  replaceVideoTrack: (track: MediaStreamTrack | null) => Promise<void>;
  replaceAudioTrack: (track: MediaStreamTrack) => Promise<void>;
  sendSignal: (to: string, type: SignalType, payload: unknown) => Promise<void>;
  handleSseEvent: (event: SseEvent, currentUserId: string, localStreamRef: React.MutableRefObject<MediaStream | null>) => Promise<void>;
}

export function useWebRtc(roomId: string): UseWebRtcReturn {
  const [peers, setPeers] = useState<Map<string, RemotePeer>>(new Map());
  const peersRef = useRef<Map<string, InternalPeer>>(new Map());
  const pendingPeersRef = useRef<Set<string>>(new Set());
  const iceServersRef = useRef<RTCIceServer[] | null>(null);

  const updatePeersState = useCallback(() => {
    setPeers(new Map(
      [...peersRef.current.entries()].map(([id, p]) => [id, {
        userId: p.userId,
        displayName: p.displayName,
        stream: p.stream,
        isSpeaking: p.isSpeaking,
        isScreenSharing: p.isScreenSharing,
        isMuted: p.isMuted,
        isCamOff: p.isCamOff,
        isHost: p.isHost,
      }])
    ));
  }, []);

  const sendSignal = useCallback(async (to: string, type: SignalType, payload: unknown) => {
    await fetch(`/api/meet/rooms/${roomId}/signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, type, payload }),
    });
  }, [roomId]);

  const createPeerConnection = useCallback(async (
    remoteId: string,
    displayName: string,
    polite: boolean,
    localStreamRef: React.MutableRefObject<MediaStream | null>,
    isHost: boolean,
  ) => {
    if (peersRef.current.has(remoteId) || pendingPeersRef.current.has(remoteId)) return;
    pendingPeersRef.current.add(remoteId);

    if (!iceServersRef.current) {
      iceServersRef.current = await fetchIceServers();
    }
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    const peer: InternalPeer = {
      userId: remoteId,
      displayName,
      pc,
      stream: null,
      isSpeaking: false,
      isScreenSharing: false,
      isMuted: false,
      isCamOff: false,
      isHost,
      makingOffer: false,
      ignoreOffer: false,
      polite,
      pendingCandidates: [],
      hasRemoteDescription: false,
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
      if (e.candidate) sendSignal(remoteId, "ice-candidate", e.candidate.toJSON());
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

    pc.onconnectionstatechange = () => updatePeersState();

    peersRef.current.set(remoteId, peer);
    pendingPeersRef.current.delete(remoteId);
    updatePeersState();
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
      peer.hasRemoteDescription = true;

      if (type === "offer") {
        await pc.setLocalDescription();
        sendSignal(from, "answer", pc.localDescription);
      }

      for (const candidate of peer.pendingCandidates) {
        try { await pc.addIceCandidate(candidate); } catch { /* stale */ }
      }
      peer.pendingCandidates = [];
    } else if (type === "ice-candidate") {
      if (!peer.hasRemoteDescription) {
        peer.pendingCandidates.push(payload as RTCIceCandidateInit);
      } else {
        try {
          await pc.addIceCandidate(payload as RTCIceCandidateInit);
        } catch (err) {
          if (!peer.ignoreOffer) console.error("ICE error", err);
        }
      }
    } else if (type === "screen-share-state") {
      peer.isScreenSharing = (payload as { sharing: boolean }).sharing;
      updatePeersState();
    } else if (type === "participant-update") {
      const update = payload as { isMuted?: boolean; isCamOff?: boolean; isScreenSharing?: boolean };
      if (update.isMuted !== undefined) peer.isMuted = update.isMuted;
      if (update.isCamOff !== undefined) peer.isCamOff = update.isCamOff;
      if (update.isScreenSharing !== undefined) peer.isScreenSharing = update.isScreenSharing;
      updatePeersState();
    }
  }, [sendSignal, updatePeersState]);

  const removePeer = useCallback((userId: string) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.pc.close();
      peersRef.current.delete(userId);
      updatePeersState();
    }
  }, [updatePeersState]);

  const replaceVideoTrack = useCallback(async (track: MediaStreamTrack | null) => {
    for (const peer of peersRef.current.values()) {
      const sender = peer.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && track) {
        await sender.replaceTrack(track);
      } else if (!sender && track) {
        // audio-only fallback: add the track
        peer.pc.addTrack(track);
      }
    }
  }, []);

  const replaceAudioTrack = useCallback(async (track: MediaStreamTrack) => {
    for (const peer of peersRef.current.values()) {
      const sender = peer.pc.getSenders().find((s) => s.track?.kind === "audio");
      if (sender) await sender.replaceTrack(track);
    }
  }, []);

  const handleSseEvent = useCallback(async (
    event: SseEvent,
    currentUserId: string,
    localStreamRef: React.MutableRefObject<MediaStream | null>,
  ) => {
    if (event.kind === "room-state") {
      for (const p of event.participants) {
        if (p.userId === currentUserId) continue;
        await createPeerConnection(p.userId, p.displayName, true, localStreamRef, p.isHost);
      }
    } else if (event.kind === "peer-joined") {
      const p = event.participant;
      if (p.userId !== currentUserId) {
        await createPeerConnection(p.userId, p.displayName, false, localStreamRef, p.isHost);
      }
    } else if (event.kind === "peer-left") {
      removePeer(event.userId);
    } else if (event.kind === "signal") {
      await handleSignal(event.from, event.type, event.payload);
    } else if (event.kind === "participant-update") {
      const peer = peersRef.current.get(event.participant.userId);
      if (peer) {
        peer.isMuted = event.participant.isMuted;
        peer.isCamOff = event.participant.isCamOff;
        peer.isScreenSharing = event.participant.isScreenSharing;
        peer.isHost = event.participant.isHost;
        updatePeersState();
      }
    }
  }, [createPeerConnection, handleSignal, removePeer, updatePeersState]);

  return {
    peers,
    peersRef,
    createPeerConnection,
    handleSignal,
    removePeer,
    replaceVideoTrack,
    replaceAudioTrack,
    sendSignal,
    handleSseEvent,
  };
}
