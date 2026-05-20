"use client";

import { useRef, useCallback } from "react";

export function useSound(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const init = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return;
    }
    ctxRef.current = new AudioContext();
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType,
      volume: number
    ) => {
      if (muted || !ctxRef.current) return;
      try {
        const ctx = ctxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [muted]
  );

  const playPop = useCallback(
    () => playTone(1100, 0.12, "sine", 0.15),
    [playTone]
  );
  const playBip = useCallback(
    () => playTone(820, 0.05, "square", 0.08),
    [playTone]
  );
  const playDelete = useCallback(
    () => playTone(400, 0.15, "triangle", 0.12),
    [playTone]
  );

  const playVictory = useCallback(() => {
    if (muted || !ctxRef.current) return;
    try {
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.35, "sine", 0.22), 150 + i * 100);
    });
  }, [muted, playTone]);

  return { init, playPop, playBip, playDelete, playVictory };
}
