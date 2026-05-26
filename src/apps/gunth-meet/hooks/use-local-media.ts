"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  channelCount: 1,
};

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30, max: 30 },
  facingMode: "user",
};

export interface UseLocalMediaReturn {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isCamOff: boolean;
  isScreenSharing: boolean;
  isLocalSpeaking: boolean;
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
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const streamReadyResolversRef = useRef<Array<(s: MediaStream) => void>>([]);
  const vadCleanupRef = useRef<(() => void) | null>(null);

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    } catch {
      // not critical
    }
  }, []);

  // Voice activity detection — updates isLocalSpeaking via RMS analysis
  const startVAD = useCallback((stream: MediaStream) => {
    vadCleanupRef.current?.();
    vadCleanupRef.current = null;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const buf = new Float32Array(analyser.fftSize);
      let speaking = false;
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;
      const THRESHOLD = 0.01;

      const interval = setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        const rms = Math.sqrt(buf.reduce((s, x) => s + x * x, 0) / buf.length);
        if (rms > THRESHOLD && !speaking) {
          if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
          speaking = true;
          setIsLocalSpeaking(true);
        } else if (rms <= THRESHOLD && speaking && !silenceTimer) {
          silenceTimer = setTimeout(() => {
            speaking = false;
            setIsLocalSpeaking(false);
            silenceTimer = null;
          }, 500);
        }
      }, 100);

      vadCleanupRef.current = () => {
        clearInterval(interval);
        if (silenceTimer) clearTimeout(silenceTimer);
        ctx.close();
        setIsLocalSpeaking(false);
      };
    } catch {
      // VAD is not critical — non-secure contexts or AudioContext blocked
    }
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS,
          audio: AUDIO_CONSTRAINTS,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
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

      if (audioTrack) startVAD(stream);

      await enumerateDevices();
      navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
    }

    init();
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
      vadCleanupRef.current?.();
      stream?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enumerateDevices, startVAD]);

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
    const ss = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      // Capture system audio when available (Chrome/Edge only)
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
      } as MediaTrackConstraints,
    });
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
    const localVideo = localStreamRef.current?.getVideoTracks()[0];
    if (localVideo) localVideo.enabled = true;
  }, []);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { ...AUDIO_CONSTRAINTS, deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getAudioTracks()[0];
      if (!newTrack) return;
      const oldTrack = stream.getAudioTracks()[0];
      if (oldTrack) { stream.removeTrack(oldTrack); oldTrack.stop(); }
      stream.addTrack(newTrack);
      setSelectedAudioId(deviceId);
      if (isMuted) newTrack.enabled = false;
      startVAD(stream);
    } catch {
      // device switch failed
    }
  }, [isMuted, startVAD]);

  const switchVideoDevice = useCallback(async (deviceId: string): Promise<MediaStreamTrack | null> => {
    const stream = localStreamRef.current;
    if (!stream) return null;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { ...VIDEO_CONSTRAINTS, deviceId: { exact: deviceId } },
      });
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
    isLocalSpeaking,
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
