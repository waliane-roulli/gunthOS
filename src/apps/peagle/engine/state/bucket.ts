import { W, BUCKET_W } from "../constants";
import type { GameState } from "../types";

export function updateBucket(s: GameState, timeScale: number): void {
  s.bucket += s.bucketDir * timeScale;
  if (s.bucket <= 0) { s.bucket = 0; s.bucketDir = Math.abs(s.bucketDir); }
  if (s.bucket + BUCKET_W >= W) { s.bucket = W - BUCKET_W; s.bucketDir = -Math.abs(s.bucketDir); }

  if (s.bucketFlash > 0) s.bucketFlash -= 0.06;
  for (let i = 0; i < 3; i++) {
    if ((s.bonusBucketFlash[i] ?? 0) > 0) {
      s.bonusBucketFlash[i] = Math.max(0, (s.bonusBucketFlash[i] ?? 0) - 0.06);
    }
  }
}
