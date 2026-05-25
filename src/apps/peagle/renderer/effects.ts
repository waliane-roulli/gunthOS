import { W, H, ZOOM_SCALE } from "../engine/constants";
import { FACE, HI, DARK } from "./theme";
import type { GameState } from "../engine/types";
import type { GameTheme } from "../engine/game-theme";

export function drawParticles(ctx: CanvasRenderingContext2D, s: GameState): void {
  const count = s.particles.length;
  if (count === 0) return;
  for (let i = 0; i < count; i++) {
    const p = s.particles[i]!;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    const psz = p.size * Math.max(0, p.life);
    if (p.size <= 2.5) {
      ctx.fillRect(p.x - psz / 2, p.y - psz / 2, psz, psz);
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, psz, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawFloatingTexts(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const t of s.floatingTexts) {
    if (t.y < -20 || t.y > H + 20) continue;
    const lifeRatio = Math.min(1, t.life * 2);
    const fontSize = t.fontSize ?? (t.combo ? 13 : 11);
    ctx.save();
    ctx.globalAlpha = lifeRatio;
    const popScale = 1 + Math.max(0, 1 - t.life * 4) * 0.12;
    ctx.translate(t.x, t.y);
    ctx.scale(popScale, popScale);
    ctx.font = `bold ${fontSize}px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";

    if (t.combo && fontSize >= 13) {
      const tw = ctx.measureText(t.text).width;
      const ph = 6, pv = 3;
      const bx = -tw / 2 - ph;
      const by = -fontSize - pv;
      const bw = tw + ph * 2;
      const bh = fontSize + pv * 2;

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(bx + 2, by + 2, bw, bh);
      ctx.fillStyle = FACE;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = HI;
      ctx.fillRect(bx, by, bw, 1);
      ctx.fillRect(bx, by, 1, bh);
      ctx.fillStyle = DARK;
      ctx.fillRect(bx, by + bh - 1, bw, 1);
      ctx.fillRect(bx + bw - 1, by, 1, bh);

      ctx.fillStyle = t.color;
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(t.text, 1, 1);
      ctx.fillStyle = t.color;
    }

    ctx.fillText(t.text, 0, 0);
    ctx.restore();
  }
}

export function drawScreenFlash(ctx: CanvasRenderingContext2D, s: GameState, inFever: boolean, theme: GameTheme): void {
  if (s.flashWhite <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, s.flashWhite * 0.36);
  ctx.fillStyle = inFever ? theme.flash.fever : theme.flash.normal;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function drawVignette(ctx: CanvasRenderingContext2D, s: GameState): void {
  if (s.zoomLevel <= 1.05) return;
  const vigAlpha = Math.min(0.45, (s.zoomLevel - 1) / (ZOOM_SCALE - 1) * 0.45);
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, `rgba(0,0,80,${vigAlpha})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

export function drawBezel(ctx: CanvasRenderingContext2D): void {
  const W_canvas = 480;
  const H_canvas = 640;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath(); ctx.moveTo(0, H_canvas); ctx.lineTo(0, 0); ctx.lineTo(W_canvas, 0); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.moveTo(1, H_canvas - 1); ctx.lineTo(1, 1); ctx.lineTo(W_canvas - 1, 1); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath(); ctx.moveTo(0, H_canvas); ctx.lineTo(W_canvas, H_canvas); ctx.moveTo(W_canvas, 0); ctx.lineTo(W_canvas, H_canvas); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath(); ctx.moveTo(1, H_canvas - 1); ctx.lineTo(W_canvas - 1, H_canvas - 1); ctx.moveTo(W_canvas - 1, 1); ctx.lineTo(W_canvas - 1, H_canvas - 1); ctx.stroke();
  ctx.restore();
}
