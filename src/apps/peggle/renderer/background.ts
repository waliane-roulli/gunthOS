import { W, H, SLOW_MO_DURATION } from "../engine/constants";
import { TEAL } from "./theme";
import { drawDesktopIcon } from "./helpers";
import type { GameState } from "../engine/types";

export function drawBackground(ctx: CanvasRenderingContext2D, s: GameState, feverIntensity: number, inSlowMo: boolean): void {
  if (feverIntensity > 0) {
    const b = Math.round(128 + feverIntensity * 55);
    ctx.fillStyle = `rgb(0,0,${b})`;
  } else if (inSlowMo) {
    const t = s.slowMoFrames / SLOW_MO_DURATION;
    ctx.fillStyle = `rgb(${Math.round(t * 20)},${Math.round(128 - t * 20)},${Math.round(128 + t * 50)})`;
  } else {
    ctx.fillStyle = TEAL;
  }
  ctx.fillRect(-Math.abs(s.shakeX) - 10, -Math.abs(s.shakeY) - 10, W + 20, H + 20);

  // Dot grid (Win98 desktop wallpaper texture)
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  for (let gx = 0; gx < W; gx += 16) {
    for (let gy = 0; gy < H; gy += 16) {
      ctx.fillRect(gx, gy, 1, 1);
    }
  }

  // Faint desktop icons (replace starfield)
  for (const star of s.stars) {
    const baseAlpha = star.layer === 0 ? 0.07 : star.layer === 1 ? 0.13 : 0.20;
    const twinkle = 0.75 + 0.25 * Math.sin(star.phase + s.animClock * (0.5 + star.layer * 0.3));
    drawDesktopIcon(ctx, star.x, star.y, star.layer, baseAlpha * twinkle);
  }

  // Scanlines
  for (let sy = 0; sy < H; sy += 2) {
    ctx.fillStyle = "rgba(0,0,0,0.045)";
    ctx.fillRect(-10, sy, W + 20, 1);
  }
}
