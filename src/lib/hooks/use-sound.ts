"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  getContext,
  getMasterGain,
  setMasterVolume,
  prefetch,
  closeContext,
} from "@/lib/audio/engine";
import { getChannel, clearChannels, silenceChannel } from "@/lib/audio/channel";
import { AudioPlayer } from "@/lib/audio/player";
import { APP_REGISTRY } from "@/apps";
import { SCHEME_MAP, DEFAULT_SOUND_SCHEME_ID, type SoundSchemeId, type ToneStep } from "@/lib/sound-schemes";

// Précharge boot dès le chargement du module (client uniquement)
if (typeof window !== "undefined") prefetch("/sounds/boot.mp3");

const supportsOpus =
  typeof window !== "undefined" &&
  document.createElement("audio").canPlayType("audio/ogg; codecs=opus") !== "";

export function useSound(muted: boolean, schemeId: SoundSchemeId = DEFAULT_SOUND_SCHEME_ID) {
  const onFirstInitRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef(false);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Players pour les sons longs (un par type)
  const bootPlayerRef = useRef<AudioPlayer | null>(null);
  const runPlayerRef = useRef<AudioPlayer | null>(null);
  const accessDiskPlayerRef = useRef<AudioPlayer | null>(null);
  const ploufPlayerRef = useRef<AudioPlayer | null>(null);


  // ── Helpers internes ────────────────────────────────────────────────────────

  const getCtx = useCallback(() => {
    if (mutedRef.current) return null;
    if (!initializedRef.current) {
      initializedRef.current = true;
      getContext(); // crée le singleton
      prefetch("/sounds/run.mp3");
      prefetch("/sounds/access_disk.mp3");
      const ploufUrl = supportsOpus ? "/sounds/ploufplouf.opus" : "/sounds/ploufplouf.mp3";
      prefetch(ploufUrl);
      onFirstInitRef.current?.();
      onFirstInitRef.current = null;
    }
    return getContext();
  }, []);

  const masterNode = useCallback(() => {
    getCtx();
    return getMasterGain();
  }, [getCtx]);

  // ── Scheme actif ─────────────────────────────────────────────────────────────

  const schemeRef = useRef(SCHEME_MAP.get(schemeId) ?? SCHEME_MAP.get(DEFAULT_SOUND_SCHEME_ID)!);
  useEffect(() => {
    schemeRef.current = SCHEME_MAP.get(schemeId) ?? SCHEME_MAP.get(DEFAULT_SOUND_SCHEME_ID)!;
  }, [schemeId]);

  // ── Sons synthétiques ────────────────────────────────────────────────────────

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
        gain.connect(masterNode());
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [getCtx, masterNode]
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
        gain.connect(masterNode());
        source.start();
        source.stop(ctx.currentTime + duration);
      } catch {}
    },
    [getCtx, masterNode]
  );

  const playSchemeSound = useCallback(
    (steps: ToneStep[]) => {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      for (const step of steps) {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = t + (step.delay ?? 0);
          osc.type = step.type;
          osc.frequency.setValueAtTime(step.freq, start);
          gain.gain.setValueAtTime(step.vol, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + step.dur);
          osc.connect(gain);
          gain.connect(masterNode());
          osc.start(start);
          osc.stop(start + step.dur + 0.01);
        } catch {}
      }
    },
    [getCtx, masterNode]
  );

  const playPop    = useCallback(() => playSchemeSound(schemeRef.current.sounds.pop),    [playSchemeSound]);
  const playBip    = useCallback(() => playSchemeSound(schemeRef.current.sounds.bip),    [playSchemeSound]);
  const playDelete = useCallback(() => playSchemeSound(schemeRef.current.sounds.delete), [playSchemeSound]);
  const playClick  = useCallback(() => playSchemeSound(schemeRef.current.sounds.click),  [playSchemeSound]);

  const playWindowOpen     = useCallback(() => playSchemeSound(schemeRef.current.sounds.windowOpen),     [playSchemeSound]);
  const playWindowClose    = useCallback(() => playSchemeSound(schemeRef.current.sounds.windowClose),    [playSchemeSound]);
  const playWindowMinimize = useCallback(() => playSchemeSound(schemeRef.current.sounds.windowMinimize), [playSchemeSound]);

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
      dialGain.connect(masterNode());
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
        g.connect(masterNode());
        osc.start(t + 0.6 + i * 0.18);
        osc.stop(t + 0.75 + i * 0.18);
      });

      setTimeout(() => {
        playNoise(0.25, 0.08, 1800);
        setTimeout(() => playNoise(0.15, 0.06, 1200), 280);
        setTimeout(() => playNoise(0.2, 0.07, 2200), 470);
      }, 600 + freqs.length * 180);
    } catch {}
  }, [getCtx, masterNode, playNoise]);

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
        gain.connect(masterNode());
        osc.start(t + start);
        osc.stop(t + start + dur + 0.05);
      } catch {}
    });
  }, [getCtx, masterNode]);

  const playBiosBleep = useCallback(
    (pattern: "ok" | "error" | "start" = "ok") => {
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
            gain.connect(masterNode());
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
            gain.connect(masterNode());
            osc.start(t + delay);
            osc.stop(t + delay + 0.1);
          } catch {}
        });
      }
    },
    [getCtx, masterNode, playTone]
  );

  const playVictory = useCallback(
    () => playSchemeSound(schemeRef.current.sounds.notifySuccess),
    [playSchemeSound]
  );

  const playNotifyInfo    = useCallback(() => playSchemeSound(schemeRef.current.sounds.notifyInfo),    [playSchemeSound]);
  const playNotifySuccess = useCallback(() => playSchemeSound(schemeRef.current.sounds.notifySuccess), [playSchemeSound]);
  const playNotifyError   = useCallback(() => playSchemeSound(schemeRef.current.sounds.notifyError),   [playSchemeSound]);
  const playNotifyWarning = useCallback(() => playSchemeSound(schemeRef.current.sounds.notifyWarning), [playSchemeSound]);

  // ── Sons MP3 ─────────────────────────────────────────────────────────────────

  const uiChannel = useCallback(() => getChannel("ui", 1), []);

  const startBootAudio = useCallback(async () => {
    if (!getCtx()) return;
    if (bootPlayerRef.current?.isPlaying || runPlayerRef.current?.isPlaying) return;

    const ch = uiChannel();
    if (!bootPlayerRef.current) bootPlayerRef.current = new AudioPlayer(ch);
    if (!runPlayerRef.current) runPlayerRef.current = new AudioPlayer(ch);

    const run = runPlayerRef.current;
    await bootPlayerRef.current.playOnce("/sounds/boot.mp3", {
      volume: 1.5,
      onEnded: () => run.play("/sounds/run.mp3", { loop: true, volume: 0.9 }),
    });
  }, [getCtx, uiChannel]);

  const stopBootAudio = useCallback(() => {
    bootPlayerRef.current?.fadeOutAndStop(0.4);
    runPlayerRef.current?.fadeOutAndStop(0.4);
  }, []);

  const startAccessDisk = useCallback(async () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (!accessDiskPlayerRef.current) {
      accessDiskPlayerRef.current = new AudioPlayer(uiChannel());
    }
    await accessDiskPlayerRef.current.play("/sounds/access_disk.mp3", { loop: true, volume: 1.5 });
  }, [getCtx, uiChannel]);

  const stopAccessDisk = useCallback(() => {
    accessDiskPlayerRef.current?.fadeOutAndStop(0.12);
  }, []);

  const ploufGenerationRef = useRef(0);

  const startPloufPlouf = useCallback(async () => {
    const ctx = getCtx();
    if (!ctx) return;

    // Stoppe tout ce qui joue déjà avant de démarrer
    ploufPlayerRef.current?.stop();
    ploufPlayerRef.current = null;

    const generation = ++ploufGenerationRef.current;
    const musicChannel = getChannel("music", 1);
    musicChannel.setVolume(1);
    const player = new AudioPlayer(musicChannel);

    const url = supportsOpus ? "/sounds/ploufplouf.opus" : "/sounds/ploufplouf.mp3";
    await player.play(url, { loop: true });

    // Si une autre invocation a démarré ou stopPloufPlouf appelé entre temps, on abandonne
    if (generation !== ploufGenerationRef.current) {
      player.stop();
      return;
    }

    ploufPlayerRef.current = player;
  }, [getCtx]);

  const stopPloufPlouf = useCallback(() => {
    ploufGenerationRef.current++; // invalide tout startPloufPlouf en cours
    onFirstInitRef.current = null;
    ploufPlayerRef.current?.stop();
    ploufPlayerRef.current = null;
    silenceChannel("music");
  }, []);

  // ── Stop audio par app ───────────────────────────────────────────────────────

  /**
   * Stoppe tous les channels déclarés dans audioChannels du manifest de l'app.
   * Appelé par OsWindow au clic ✕ — aucune app n'a besoin de s'enregistrer.
   */
  const stopAppSounds = useCallback((appSlug: string) => {
    const manifest = APP_REGISTRY.find((a) => a.slug === appSlug);
    for (const channelName of manifest?.audioChannels ?? []) {
      silenceChannel(channelName);
    }
    // Stop propre du player plouf-plouf (invalide aussi tout startPloufPlouf en cours)
    if (appSlug === "plouf-plouf") {
      ploufGenerationRef.current++;
      onFirstInitRef.current = null;
      ploufPlayerRef.current?.stop();
      ploufPlayerRef.current = null;
    }
  }, []);

  // ── Contrôles globaux ────────────────────────────────────────────────────────

  const init = useCallback(() => {
    getCtx();
  }, [getCtx]);

  const setOnFirstInit = useCallback((cb: () => void) => {
    if (initializedRef.current) {
      cb();
    } else {
      onFirstInitRef.current = cb;
    }
  }, []);

  const setMasterGain = useCallback((v: number) => {
    setMasterVolume(v);
  }, []);

  const handleClose = useCallback(() => {
    clearChannels();
    closeContext();
    initializedRef.current = false;
    bootPlayerRef.current = null;
    runPlayerRef.current = null;
    accessDiskPlayerRef.current = null;
    ploufPlayerRef.current = null;
  }, []);

  return {
    init,
    setOnFirstInit,
    closeContext: handleClose,
    playPop,
    playBip,
    playDelete,
    playVictory,
    playClick,
    playWindowOpen,
    playWindowClose,
    playWindowMinimize,
    playNotifyInfo,
    playNotifySuccess,
    playNotifyError,
    playNotifyWarning,
    playModemDialup,
    playStartupChime,
    playBiosBleep,
    startBootAudio,
    stopBootAudio,
    startAccessDisk,
    stopAccessDisk,
    startPloufPlouf,
    stopPloufPlouf,
    stopAppSounds,
    setMasterGain,
  };
}
