"use client";

import { useState, useEffect, useRef } from "react";

export function useSpeaking(stream: MediaStream | null): boolean {
  const [speaking, setSpeaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stream) {
      setSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setSpeaking(false);
      return;
    }

    let lastLevel = 0;
    intervalRef.current = setInterval(() => {
      const track = stream.getAudioTracks()[0];
      if (!track || track.readyState === "ended") {
        setSpeaking(false);
        return;
      }
      // Approximate speaking detection via track readyState and basic analysis
      // A full AnalyserNode would require an AudioContext — kept minimal for stub
      setSpeaking(track.enabled && track.readyState === "live");
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stream]);

  return speaking;
}
