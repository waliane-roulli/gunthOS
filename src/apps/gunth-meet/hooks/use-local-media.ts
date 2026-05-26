"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface UseLocalMediaReturn {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isCamOff: boolean;
  isScreenSharing: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioId: string | null;
  selectedVideoId: string | null;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  screenStreamRef: React.MutableRefObject<MediaStream | null>;
  waitForStream: () => Promise<MediaStream>;
  toggleMute: () => void;
  toggleCam: () => void;
  startScreenShare: (onEnded: () => void) => Promise<void>;
  stopScreenShare: () => Promise<void>;
  switchAudioDevice: (deviceId: string) => Promise<void>;
  switchVideoDevice: (deviceId: string) => Promise<MediaStreamTrack | null>;
}

export function useLocalMedia(): UseLocalMediaReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const streamReadyResolversRef = useRef<Array<(s: MediaStream) => void>>([]);

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    } catch {
      // not critical
    }
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          stream = new MediaStream();
        }
      }
      localStreamRef.current = stream;
      setLocalStream(stream);
      for (const resolve of streamReadyResolversRef.current) resolve(stream);
      streamReadyResolversRef.current = [];

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      if (audioTrack) setSelectedAudioId(audioTrack.getSettings().deviceId ?? null);
      if (videoTrack) setSelectedVideoId(videoTrack.getSettings().deviceId ?? null);

      await enumerateDevices();
      navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
    }

    init();
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
      stream?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enumerateDevices]);

  const waitForStream = useCallback((): Promise<MediaStream> => {
    if (localStreamRef.current) return Promise.resolve(localStreamRef.current);
    return new Promise((resolve) => {
      streamReadyResolversRef.current.push(resolve);
    });
  }, []);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getAudioTracks()) track.enabled = !track.enabled;
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCam = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getVideoTracks()) track.enabled = !track.enabled;
    setIsCamOff((prev) => !prev);
  }, []);

  const startScreenShare = useCallback(async (onEnded: () => void) => {
    const ss = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = ss;
    setScreenStream(ss);
    setIsScreenSharing(true);
    ss.getVideoTracks()[0]?.addEventListener("ended", onEnded, { once: true });
  }, []);

  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    setIsScreenSharing(false);
    // Re-enable local video if it was disabled
    const localVideo = localStreamRef.current?.getVideoTracks()[0];
    if (localVideo) localVideo.enabled = true;
  }, []);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
      const newTrack = newStream.getAudioTracks()[0];
      if (!newTrack) return;
      const oldTrack = stream.getAudioTracks()[0];
      if (oldTrack) { stream.removeTrack(oldTrack); oldTrack.stop(); }
      stream.addTrack(newTrack);
      setSelectedAudioId(deviceId);
      if (isMuted) newTrack.enabled = false;
    } catch {
      // device switch failed
    }
  }, [isMuted]);

  const switchVideoDevice = useCallback(async (deviceId: string): Promise<MediaStreamTrack | null> => {
    const stream = localStreamRef.current;
    if (!stream) return null;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
      const newTrack = newStream.getVideoTracks()[0];
      if (!newTrack) return null;
      const oldTrack = stream.getVideoTracks()[0];
      if (oldTrack) { stream.removeTrack(oldTrack); oldTrack.stop(); }
      stream.addTrack(newTrack);
      setSelectedVideoId(deviceId);
      if (isCamOff) newTrack.enabled = false;
      return newTrack;
    } catch {
      return null;
    }
  }, [isCamOff]);

  return {
    localStream,
    screenStream,
    isMuted,
    isCamOff,
    isScreenSharing,
    audioDevices,
    videoDevices,
    selectedAudioId,
    selectedVideoId,
    localStreamRef,
    screenStreamRef,
    waitForStream,
    toggleMute,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    switchAudioDevice,
    switchVideoDevice,
  };
}
