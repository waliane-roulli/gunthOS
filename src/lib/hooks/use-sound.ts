"use client";

import { useRef, useCallback } from "react";

// Précharge Boot.mp3 dans le cache HTTP dès le chargement du module (client uniquement)
const bootRawBufferPromise: Promise<ArrayBuffer> =
  typeof window !== "undefined"
    ? fetch("/sounds/boot.mp3").then((r) => r.arrayBuffer()).catch(() => new ArrayBuffer(0))
    : Promise.resolve(new ArrayBuffer(0));

export function useSound(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bootLoadPromiseRef = useRef<Promise<void> | null>(null);

  const init = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return;
    }
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    bootLoadPromiseRef.current = fetch("/sounds/boot.mp3")
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { bootBufferRef.current = buf; })
      .catch(() => {});
    fetch("/sounds/run.mp3")
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { runBufferRef.current = buf; })
      .catch(() => {});
    fetch("/sounds/access_disk.mp3")
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { accessDiskBufferRef.current = buf; })
      .catch(() => {});
  }, []);

  const getCtx = useCallback(() => {
    if (muted) return null;
    return ctxRef.current;
  }, [muted]);

  // ── Sons UI synthétiques (inchangés) ────────────────────────────────────────

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType, volume: number) => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [getCtx]
  );

  const playNoise = useCallback(
    (duration: number, volume: number, filterFreq = 800) => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = filterFreq;
        filter.Q.value = 0.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + duration);
      } catch {}
    },
    [getCtx]
  );

  const playPop = useCallback(() => playTone(1100, 0.12, "sine", 0.15), [playTone]);
  const playBip = useCallback(() => playTone(820, 0.05, "square", 0.08), [playTone]);
  const playDelete = useCallback(() => playTone(400, 0.15, "triangle", 0.12), [playTone]);
  const playClick = useCallback(() => playTone(1200, 0.04, "square", 0.07), [playTone]);

  const playWindowOpen = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  }, [getCtx]);

  const playWindowClose = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
    } catch {}
  }, [getCtx]);

  const playWindowMinimize = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, [getCtx]);

  const playModemDialup = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const dial = ctx.createOscillator();
      const dialGain = ctx.createGain();
      dial.type = "sine";
      dial.frequency.setValueAtTime(350, t);
      dialGain.gain.setValueAtTime(0.12, t);
      dialGain.gain.setValueAtTime(0.12, t + 0.4);
      dialGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      dial.connect(dialGain);
      dialGain.connect(ctx.destination);
      dial.start(t);
      dial.stop(t + 0.5);

      const freqs = [2100, 1300, 2100, 980, 1650, 2400, 1200];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + 0.6 + i * 0.18);
        g.gain.setValueAtTime(0.1, t + 0.6 + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.75 + i * 0.18);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t + 0.6 + i * 0.18);
        osc.stop(t + 0.75 + i * 0.18);
      });

      setTimeout(() => {
        playNoise(0.25, 0.08, 1800);
        setTimeout(() => playNoise(0.15, 0.06, 1200), 280);
        setTimeout(() => playNoise(0.2, 0.07, 2200), 470);
      }, 600 + freqs.length * 180);
    } catch {}
  }, [getCtx, playNoise]);

  const playStartupChime = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const melody = [
      { freq: 622, dur: 0.22, start: 0 },
      { freq: 880, dur: 0.18, start: 0.25 },
      { freq: 830, dur: 0.22, start: 0.46 },
      { freq: 1108, dur: 0.45, start: 0.71 },
      { freq: 740, dur: 0.55, start: 0.95 },
    ];
    const t = ctx.currentTime;
    melody.forEach(({ freq, dur, start }) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + start);
        gain.gain.setValueAtTime(0, t + start);
        gain.gain.linearRampToValueAtTime(0.18, t + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + start);
        osc.stop(t + start + dur + 0.05);
      } catch {}
    });
  }, [getCtx]);

  const playBiosBleep = useCallback((pattern: "ok" | "error" | "start" = "ok") => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (pattern === "ok") {
      playTone(880, 0.08, "square", 0.1);
    } else if (pattern === "error") {
      [
        { freq: 220, dur: 0.3, delay: 0 },
        { freq: 220, dur: 0.3, delay: 0.4 },
        { freq: 880, dur: 0.1, delay: 0.85 },
      ].forEach(({ freq, dur, delay }) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, t + delay);
          gain.gain.setValueAtTime(0.12, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + delay);
          osc.stop(t + delay + dur + 0.05);
        } catch {}
      });
    } else if (pattern === "start") {
      [0, 0.12].forEach((delay) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(880, t + delay);
          gain.gain.setValueAtTime(0.12, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + delay);
          osc.stop(t + delay + 0.1);
        } catch {}
      });
    }
  }, [getCtx, playTone]);

  const playVictory = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
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
  }, [getCtx, playTone]);

  // ── Audio MP3 : Boot (once) + Run (loop) + access_disk ──────────────────────

  const bootAudioRef = useRef<{
    source: AudioBufferSourceNode;
    gainNode: GainNode;
  } | null>(null);

  const runAudioRef = useRef<{
    source: AudioBufferSourceNode;
    gainNode: GainNode;
  } | null>(null);

  const accessDiskAudioRef = useRef<{
    source: AudioBufferSourceNode;
    gainNode: GainNode;
  } | null>(null);

  const bootBufferRef = useRef<AudioBuffer | null>(null);
  const runBufferRef = useRef<AudioBuffer | null>(null);
  const accessDiskBufferRef = useRef<AudioBuffer | null>(null);

  // Joue Boot.mp3 une fois, puis enchaîne Run.mp3 en boucle
  const startBootAudio = useCallback(async () => {
    const ctx = getCtx();
    if (!ctx || bootAudioRef.current || runAudioRef.current) return;

    if (bootLoadPromiseRef.current) {
      await bootLoadPromiseRef.current;
    } else if (!bootBufferRef.current) {
      try {
        const ab = await bootRawBufferPromise;
        if (ab.byteLength === 0) return;
        bootBufferRef.current = await ctx.decodeAudioData(ab.slice(0));
      } catch { return; }
    }
    const bootBuffer = bootBufferRef.current;
    if (!bootBuffer) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.5, ctx.currentTime);
    gainNode.connect(ctx.destination);

    // Lecture de Boot.mp3 une seule fois
    const bootSource = ctx.createBufferSource();
    bootSource.buffer = bootBuffer;
    bootSource.loop = false;
    bootSource.connect(gainNode);
    bootSource.start(ctx.currentTime, 0);
    bootAudioRef.current = { source: bootSource, gainNode };

    // À la fin de Boot, enchaîne Run.mp3 en boucle
    bootSource.onended = async () => {
      if (!bootAudioRef.current) return; // a été stoppé manuellement
      bootAudioRef.current = null;

      if (!runBufferRef.current) {
        try {
          const ab = await fetch("/sounds/run.mp3").then((r) => r.arrayBuffer());
          runBufferRef.current = await ctx.decodeAudioData(ab);
        } catch { return; }
      }
      const runBuffer = runBufferRef.current;
      if (!runBuffer) return;

      const runSource = ctx.createBufferSource();
      runSource.buffer = runBuffer;
      runSource.loop = true;
      runSource.connect(gainNode);
      runSource.start(ctx.currentTime, 0);
      runAudioRef.current = { source: runSource, gainNode };
    };
  }, [getCtx]);

  const stopBootAudio = useCallback(() => {
    const ctx = ctxRef.current;
    const fadeAndStop = (ref: React.RefObject<{ source: AudioBufferSourceNode; gainNode: GainNode } | null>) => {
      if (!ref.current) return;
      const { source, gainNode } = ref.current;
      ref.current = null;
      if (ctx) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      }
      setTimeout(() => { try { source.stop(); } catch {} }, 500);
    };
    fadeAndStop(bootAudioRef);
    fadeAndStop(runAudioRef);
  }, []);

  // Lance access_disk.mp3 en boucle jusqu'à stopAccessDisk()
  const startAccessDisk = useCallback(async () => {
    const ctx = getCtx();
    if (!ctx) return;
    // Stop toute instance en cours avant d'en démarrer une nouvelle
    if (accessDiskAudioRef.current) {
      try { accessDiskAudioRef.current.source.stop(); } catch {}
      accessDiskAudioRef.current = null;
    }
    // Charge si pas encore en cache
    if (!accessDiskBufferRef.current) {
      try {
        const ab = await fetch("/sounds/access_disk.mp3").then((r) => r.arrayBuffer());
        accessDiskBufferRef.current = await ctx.decodeAudioData(ab);
      } catch { return; }
    }
    const buffer = accessDiskBufferRef.current;
    if (!buffer) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.5, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start(ctx.currentTime, 0);

    accessDiskAudioRef.current = { source, gainNode };
  }, [getCtx]);

  const stopAccessDisk = useCallback(() => {
    if (!accessDiskAudioRef.current) return;
    const { source, gainNode } = accessDiskAudioRef.current;
    accessDiskAudioRef.current = null;
    const ctx = ctxRef.current;
    if (ctx) {
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
    }
    try { source.stop(ctx ? ctx.currentTime + 0.15 : 0); } catch {}
  }, []);

  const closeContext = useCallback(() => {
    ctxRef.current?.close();
    ctxRef.current = null;
  }, []);

  // stubs vides pour ne pas casser les imports existants
  const startAmbient = useCallback(() => {}, []);
  const stopAmbient = useCallback(() => {}, []);
  const setAmbientVolume = useCallback((_volume: number) => {}, []);

  return {
    init,
    closeContext,
    playPop,
    playBip,
    playDelete,
    playVictory,
    playClick,
    playWindowOpen,
    playWindowClose,
    playWindowMinimize,
    playModemDialup,
    playStartupChime,
    playBiosBleep,
    startBootAudio,
    stopBootAudio,
    startAccessDisk,
    stopAccessDisk,
    startAmbient,
    stopAmbient,
    setAmbientVolume,
  };
}
