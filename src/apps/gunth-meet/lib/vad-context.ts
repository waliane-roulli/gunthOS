// Shared AudioContext for all VAD instances — avoids hitting the browser's
// per-page AudioContext limit (~6) when many peers are in the same room.

let sharedCtx: AudioContext | null = null;

export function getVADContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume();
  }
  return sharedCtx;
}
