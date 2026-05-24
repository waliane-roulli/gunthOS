"use client";

import { useEffect, useRef } from "react";
import { getChannel } from "@/lib/audio/channel";
import { AudioPlayer } from "@/lib/audio/player";
import { useSoundContext } from "@/lib/contexts/sound-context";

export function useMusic() {
  const { init } = useSoundContext();
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    init();
    const channel = getChannel("peagle-music");
    playerRef.current = new AudioPlayer(channel);
    playerRef.current.play("/sounds/radio-lofi.mp3", { loop: true });
    return () => { playerRef.current?.fadeOutAndStop(0.8); };
  }, [init]);
}
