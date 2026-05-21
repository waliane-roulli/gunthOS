"use client";

import { getContext, loadBuffer } from "./engine";
import type { AudioChannel } from "./channel";

interface Stem {
  url: string;
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  volume: number;
}

/**
 * Groupe de stems synchronisés — tous démarrent au même instant
 * et jouent en boucle. On contrôle leur volume indépendamment
 * pour créer des transitions musicales.
 *
 * Usage typique : instru + voix + section intense pour Plouf Plouf,
 * ou toute autre app qui a besoin d'audio évolutif.
 */
export class StemGroup {
  private stems = new Map<string, Stem>();
  private channel: AudioChannel;
  private startTime = 0;
  private running = false;

  constructor(channel: AudioChannel) {
    this.channel = channel;
  }

  /** Déclare un stem. Doit être appelé avant start(). */
  add(name: string, url: string, initialVolume = 0) {
    const ctx = getContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = initialVolume;
    gainNode.connect(this.channel.gain);
    this.stems.set(name, { url, buffer: null, source: null, gainNode, volume: initialVolume });
    return this;
  }

  /** Précharge tous les buffers sans démarrer. */
  async preload(): Promise<void> {
    await Promise.all(
      [...this.stems.entries()].map(async ([name, stem]) => {
        try {
          stem.buffer = await loadBuffer(stem.url);
          this.stems.set(name, stem);
        } catch {}
      })
    );
  }

  /**
   * Démarre tous les stems au même timestamp.
   * Précharge ceux qui ne le sont pas encore.
   */
  async start(): Promise<void> {
    if (this.running) this._stopSources();

    await this.preload();

    const ctx = getContext();
    this.startTime = ctx.currentTime;
    this.running = true;

    for (const stem of this.stems.values()) {
      if (!stem.buffer) continue;
      const source = ctx.createBufferSource();
      source.buffer = stem.buffer;
      source.loop = true;
      source.connect(stem.gainNode);
      source.start(this.startTime);
      stem.source = source;
    }
  }

  /** Ajuste le volume d'un stem instantanément. */
  setVolume(name: string, volume: number) {
    const stem = this.stems.get(name);
    if (!stem) return;
    stem.volume = Math.max(0, Math.min(1, volume));
    const ctx = getContext();
    stem.gainNode.gain.setValueAtTime(stem.volume, ctx.currentTime);
  }

  /** Fondu vers un volume cible sur `duration` secondes. */
  fadeTo(name: string, target: number, duration: number) {
    const stem = this.stems.get(name);
    if (!stem) return;
    const clamped = Math.max(0, Math.min(1, target));
    stem.volume = clamped;
    const ctx = getContext();
    const gain = stem.gainNode.gain;
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.linearRampToValueAtTime(clamped, ctx.currentTime + duration);
  }

  /** Stoppe tous les stems avec un fade optionnel. */
  stop(fadeDuration = 0) {
    if (!this.running) return;
    this.running = false;

    if (fadeDuration > 0) {
      const ctx = getContext();
      for (const stem of this.stems.values()) {
        if (!stem.source) continue;
        const gain = stem.gainNode.gain;
        gain.cancelScheduledValues(ctx.currentTime);
        gain.setValueAtTime(gain.value, ctx.currentTime);
        gain.linearRampToValueAtTime(0, ctx.currentTime + fadeDuration);
      }
      setTimeout(() => this._stopSources(), (fadeDuration + 0.1) * 1000);
    } else {
      this._stopSources();
    }
  }

  private _stopSources() {
    for (const stem of this.stems.values()) {
      if (!stem.source) continue;
      try { stem.source.stop(); } catch {}
      stem.source = null;
    }
  }

  get isRunning() {
    return this.running;
  }
}
