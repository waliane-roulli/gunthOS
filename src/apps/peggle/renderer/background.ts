import { W, H, SLOW_MO_DURATION } from "../engine/constants";
import { TEAL } from "./theme";
import type { GameState } from "../engine/types";

// Palette de couleurs vives pour les étoiles pixel art
const STAR_COLORS = [
  "#ff5500", "#ffaa00", "#00ff44", "#4455ff", "#cc00ff",
  "#00ccff", "#ff1155", "#ffdd00", "#00ffcc",
] as const;

function drawPixelStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number, color: string, alpha: number,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  // Croix pixel (étoile stylisée)
  ctx.fillRect(Math.round(x), Math.round(y - size), size, size * 3);
  ctx.fillRect(Math.round(x - size), Math.round(y), size * 3, size);
  // Centre brillant
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(Math.round(x), Math.round(y), size, size);
  ctx.globalAlpha = 1;
}

export function drawBackground(ctx: CanvasRenderingContext2D, s: GameState, feverIntensity: number, inSlowMo: boolean): void {
  // Fond de base
  if (feverIntensity > 0) {
    // Fever — dégradé violet → magenta pulsant
    const r = Math.round(30 + feverIntensity * 60);
    const b = Math.round(20 + feverIntensity * 60);
    ctx.fillStyle = `rgb(${r},0,${b})`;
  } else if (inSlowMo) {
    const t = s.slowMoFrames / SLOW_MO_DURATION;
    ctx.fillStyle = `rgb(${Math.round(t * 20)},${Math.round(t * 5)},${Math.round(18 + t * 40)})`;
  } else {
    ctx.fillStyle = TEAL;
  }
  ctx.fillRect(-Math.abs(s.shakeX) - 10, -Math.abs(s.shakeY) - 10, W + 20, H + 20);

  // Grille pixel art — lignes subtiles colorées
  if (feverIntensity > 0) {
    ctx.fillStyle = `rgba(255,0,180,${0.06 + feverIntensity * 0.08})`;
  } else {
    ctx.fillStyle = "rgba(60,80,200,0.07)";
  }
  for (let gx = 0; gx < W; gx += 8) {
    ctx.fillRect(gx, 0, 1, H);
  }
  for (let gy = 0; gy < H; gy += 8) {
    ctx.fillRect(0, gy, W, 1);
  }

  // Étoiles pixel art colorées et scintillantes
  for (const star of s.stars) {
    const twinkle = 0.6 + 0.4 * Math.sin(star.phase + s.animClock * (0.8 + star.layer * 0.4));
    const colorIdx = Math.abs(Math.round(star.x * 7 + star.y * 3)) % STAR_COLORS.length;
    const color = feverIntensity > 0
      ? (colorIdx % 2 === 0 ? "#ff00cc" : "#ff6600")
      : STAR_COLORS[colorIdx]!;

    if (star.layer === 0) {
      // Minuscule — 1 pixel
      ctx.globalAlpha = 0.18 * twinkle;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(star.x), Math.round(star.y), 1, 1);
      ctx.globalAlpha = 1;
    } else if (star.layer === 1) {
      // Croix 2px
      drawPixelStar(ctx, star.x, star.y, 1, color, 0.22 * twinkle);
    } else {
      // Croix 3px + glow
      drawPixelStar(ctx, star.x, star.y, 1, color, 0.30 * twinkle);
      ctx.globalAlpha = 0.08 * twinkle;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(star.x - 3), Math.round(star.y - 3), 7, 7);
      ctx.globalAlpha = 1;
    }
  }

  // Scanlines légères pour renforcer le look CRT / pixel
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let sy = 0; sy < H; sy += 2) {
    ctx.fillRect(-10, sy, W + 20, 1);
  }
}
