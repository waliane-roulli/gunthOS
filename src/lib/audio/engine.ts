"use client";

/**
 * Singleton AudioContext + master gain + buffer cache.
 * Un seul contexte partagé pour toute l'appli (limite navigateur).
 */

type BufferCache = Map<string, AudioBuffer>;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const bufferCache: BufferCache = new Map();

/** Retourne le contexte actif, le crée si besoin. */
export function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Retourne le master GainNode (crée le contexte si besoin). */
export function getMasterGain(): GainNode {
  getContext();
  return masterGain!;
}

/** Ajuste le volume master (0-100). */
export function setMasterVolume(volume: number) {
  getContext();
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, volume / 100));
}

/**
 * Charge et décode un fichier audio. Met en cache le résultat.
 * Les appels concurrents sur la même URL reçoivent le même résultat.
 */
const inflight = new Map<string, Promise<AudioBuffer>>();

export async function loadBuffer(url: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const pending = inflight.get(url);
  if (pending) return pending;

  const promise = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((ab) => getContext().decodeAudioData(ab))
    .then((buf) => {
      bufferCache.set(url, buf);
      inflight.delete(url);
      return buf;
    })
    .catch((err) => {
      inflight.delete(url);
      throw err;
    });

  inflight.set(url, promise);
  return promise;
}

/** Précharge un fichier sans attendre — silencieux en cas d'erreur. */
export function prefetch(url: string): void {
  loadBuffer(url).catch(() => {});
}

/** Ferme le contexte (cleanup). */
export function closeContext(): void {
  ctx?.close();
  ctx = null;
  masterGain = null;
  bufferCache.clear();
  inflight.clear();
}
