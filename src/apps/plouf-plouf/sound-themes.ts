import type { SoundSchemeId, ToneStep } from "@/lib/sound-schemes";
import { SCHEME_MAP } from "@/lib/sound-schemes";
import { getContext, getMasterGain } from "@/lib/audio/engine";

export type PloufSoundThemeId = "os-default" | SoundSchemeId;

export const PLOUF_SOUND_THEMES: {
  id: PloufSoundThemeId;
  label: string;
  description: string;
}[] = [
  { id: "os-default", label: "Défaut OS", description: "Suit le thème sonore des Paramètres" },
  { id: "win98", label: "Win98", description: "Beeps carrés rétro, fidèle à l'original" },
  { id: "soft", label: "Soft", description: "Tons feutrés, montée douce et discrets" },
  { id: "amstrad", label: "Amstrad CPC", description: "Grave et buzzy, descente lourde" },
  { id: "megadrive", label: "Mega Drive", description: "Métallique, balayage large et percutant" },
  { id: "waterdrop", label: "Goutte d'eau", description: "Plocs aquatiques, bulles et gouttes" },
];

// ── Per-theme bip character ──────────────────────────────────────────────

interface BipProfile {
  wave: OscillatorType;
  freqStart: number;
  freqFast: number;
  freqEnd: number;
  dur: number;
  vol: number;
  doubleTap: boolean;
}

const BIP_PROFILES: Record<string, BipProfile> = {
  "win98":     { wave: "square",   freqStart: 400,  freqFast: 800,  freqEnd: 150,  dur: 0.05, vol: 0.12, doubleTap: false },
  "soft":      { wave: "sine",     freqStart: 600,  freqFast: 1200, freqEnd: 250,  dur: 0.08, vol: 0.09, doubleTap: false },
  "amstrad":   { wave: "square",   freqStart: 280,  freqFast: 600,  freqEnd: 110,  dur: 0.06, vol: 0.12, doubleTap: false },
  "megadrive": { wave: "sawtooth", freqStart: 380,  freqFast: 1500, freqEnd: 70,   dur: 0.04, vol: 0.10, doubleTap: false },
  "waterdrop": { wave: "sine",     freqStart: 700,  freqFast: 500,  freqEnd: 200,  dur: 0.05, vol: 0.11, doubleTap: true },
};

const VOLUME_BOOST = 1.5;

/** Frequency curve matching the draw speed curve:
 *  0-15% : quick ramp up (fast acceleration)
 *  15-30%: constant fast (short scanning burst)
 *  30-100%: cubic deceleration (gradual wheel stop)
 */
function progressToFreq(progress: number, profile: BipProfile): number {
  if (progress < 0.15) {
    const t = progress / 0.15;
    return profile.freqStart + t * t * (profile.freqFast - profile.freqStart);
  } else if (progress < 0.30) {
    return profile.freqFast;
  } else {
    const s = (progress - 0.30) / 0.70;
    return profile.freqFast + s * s * s * (profile.freqEnd - profile.freqFast);
  }
}

const DEFAULT_PROFILE: BipProfile = BIP_PROFILES["win98"]!;

function getBipProfile(schemeId: SoundSchemeId | null): BipProfile {
  if (!schemeId) return DEFAULT_PROFILE;
  return BIP_PROFILES[schemeId] ?? DEFAULT_PROFILE;
}

function playOneTick(wave: OscillatorType, freq: number, dur: number, vol: number, delay: number): void {
  const ctx = getContext();
  if (!ctx) return;
  const master = getMasterGain();
  const t = ctx.currentTime + delay;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol * VOLUME_BOOST, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  } catch {
    // Contexte audio suspendu ou détruit — pas grave
  }
}

export function playDynamicBip(progress: number, schemeId: SoundSchemeId | null): void {
  const profile = getBipProfile(schemeId);
  const freq = progressToFreq(progress, profile);

  playOneTick(profile.wave, freq, profile.dur, profile.vol, 0);

  if (profile.doubleTap) {
    playOneTick(profile.wave, freq * 1.25, profile.dur * 0.7, profile.vol * 0.6, 0.025);
  }
}

// ── Static SFX (pop, delete, victory) — use scheme's own sounds ─────────

export function playSchemePop(schemeId: SoundSchemeId): void {
  const ctx = getContext();
  if (!ctx) return;
  const scheme = SCHEME_MAP.get(schemeId);
  if (!scheme) return;
  playToneSteps(ctx, scheme.sounds.pop);
}

export function playSchemeDelete(schemeId: SoundSchemeId): void {
  const ctx = getContext();
  if (!ctx) return;
  const scheme = SCHEME_MAP.get(schemeId);
  if (!scheme) return;
  playToneSteps(ctx, scheme.sounds.delete);
}

export function playSchemeVictory(schemeId: SoundSchemeId): void {
  const ctx = getContext();
  if (!ctx) return;
  const scheme = SCHEME_MAP.get(schemeId);
  if (!scheme) return;
  playToneSteps(ctx, scheme.sounds.notifySuccess);
}

function playToneSteps(ctx: AudioContext, steps: ToneStep[]): void {
  const master = getMasterGain();
  const t = ctx.currentTime;
  for (const step of steps) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + (step.delay ?? 0);
      osc.type = step.type;
      osc.frequency.setValueAtTime(step.freq, start);
      gain.gain.setValueAtTime(step.vol * VOLUME_BOOST, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + step.dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + step.dur + 0.01);
    } catch {
      // Contexte audio suspendu ou détruit — pas grave
    }
  }
}
