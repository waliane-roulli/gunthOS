"use client";

import { getContext, getMasterGain } from "./engine";

/**
 * Un canal audio = un GainNode branché sur le master.
 * Permet de contrôler le volume d'un groupe de sons indépendamment.
 */
export class AudioChannel {
  readonly gain: GainNode;
  private _volume = 1;

  constructor(initialVolume = 1) {
    this._volume = initialVolume;
    const ctx = getContext();
    this.gain = ctx.createGain();
    this.gain.gain.value = initialVolume;
    this.gain.connect(getMasterGain());
  }

  get volume() {
    return this._volume;
  }

  setVolume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    const ctx = getContext();
    this.gain.gain.setValueAtTime(this._volume, ctx.currentTime);
  }

  /** Fondu vers un volume cible sur `duration` secondes. */
  fadeTo(target: number, duration: number) {
    const clamped = Math.max(0, Math.min(1, target));
    this._volume = clamped;
    const ctx = getContext();
    this.gain.gain.cancelScheduledValues(ctx.currentTime);
    this.gain.gain.setValueAtTime(this.gain.gain.value, ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(clamped, ctx.currentTime + duration);
  }

  fadeIn(duration: number) {
    this.fadeTo(this._volume || 1, duration);
  }

  fadeOut(duration: number) {
    this.fadeTo(0, duration);
  }
}

/** Canaux prédéfinis partagés — créés à la demande. */
const channels = new Map<string, AudioChannel>();

export function getChannel(name: string, initialVolume = 1): AudioChannel {
  if (!channels.has(name)) {
    channels.set(name, new AudioChannel(initialVolume));
  }
  return channels.get(name)!;
}

export function clearChannels() {
  channels.clear();
}

/** Stoppe immédiatement tous les sons d'un channel (sans le supprimer). */
export function silenceChannel(name: string) {
  const ch = channels.get(name);
  if (!ch) return;
  ch.setVolume(0);
}
