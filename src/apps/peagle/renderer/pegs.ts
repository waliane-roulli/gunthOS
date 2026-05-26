import { PEG_R } from "../engine/constants";
import type { GameState, Peg, GreenPowerupId } from "../engine/types";
import { getPegType } from "../engine/types";
import type { GameTheme, PegTheme } from "../engine/game-theme";
import { applyPegSkinOverrides } from "./skin";

// Fake pixel glow — 3 concentric semi-transparent rects instead of ctx.shadowBlur.
// shadowBlur triggers a full GPU Gaussian pass per draw call; this is ~10× cheaper
// and fits the pixel-art aesthetic (square glow halos).
function pixelGlow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, glowColor: string, glowBlur: number): void {
  const g1 = Math.ceil(glowBlur * 0.3) | 0;
  const g2 = Math.ceil(glowBlur * 0.6) | 0;
  const g3 = Math.ceil(glowBlur) | 0;
  ctx.fillStyle = glowColor;
  ctx.globalAlpha = 0.28;
  ctx.fillRect(x - g1, y - g1, s + g1 * 2, s + g1 * 2);
  ctx.globalAlpha = 0.13;
  ctx.fillRect(x - g2, y - g2, s + g2 * 2, s + g2 * 2);
  ctx.globalAlpha = 0.06;
  ctx.fillRect(x - g3, y - g3, s + g3 * 2, s + g3 * 2);
  ctx.globalAlpha = 1;
}

// Dessin pixel art d'un peg carré avec bevel 1px
function pixelSquare(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  fill: string, hiColor: string, darkColor: string,
  glowColor?: string, glowBlur?: number,
): void {
  const s = Math.round(r * 2);
  const x = Math.round(cx - r);
  const y = Math.round(cy - r);

  if (glowColor && glowBlur) {
    pixelGlow(ctx, x, y, s, glowColor, glowBlur);
  }

  ctx.fillStyle = fill;
  ctx.fillRect(x, y, s, s);

  // Bevel pixel art — 1px lignes
  ctx.fillStyle = hiColor;
  ctx.fillRect(x, y, s, 1);       // top
  ctx.fillRect(x, y, 1, s);       // left
  ctx.fillStyle = darkColor;
  ctx.fillRect(x, y + s - 1, s, 1); // bottom
  ctx.fillRect(x + s - 1, y, 1, s); // right

  // Pixel highlight coin top-left
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(x + 1, y + 1, 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, 2);
}

// Dessin d'un pixel carré "hit" — plus sombre, pas de bevel
function pixelSquareHit(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  fill: string,
): void {
  const s = Math.round(r * 2);
  const x = Math.round(cx - r);
  const y = Math.round(cy - r);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, s, s);
}

function greenPowerupSymbol(p?: GreenPowerupId): string {
  switch (p) {
    case "multiball":  return "×3";
    case "spooky":     return "SP";
    case "extraball":  return "+1";
    case "magnet":     return "MG";
    default:           return "✓";
  }
}

// hexAlpha cache — avoids string allocation per peg per frame for fixed alphas
const _hexAlphaCache = new Map<string, string>();
function hexAlpha(hex: string, a: number): string {
  const key = `${hex}:${a}`;
  let v = _hexAlphaCache.get(key);
  if (!v) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    v = `rgba(${r},${g},${b},${a.toFixed(2)})`;
    _hexAlphaCache.set(key, v);
  }
  return v;
}

function drawWarpPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, animClock: number, t: PegTheme): void {
  const wp = 0.6 + 0.4 * Math.sin(animClock * 4 + (p.warpId ?? 0) * 2);
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r, t.warp, t.warpHi, t.warpDark, t.warp, 10 + wp * 8);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2);
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.warpHit);
  }
}

function drawBossPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, animClock: number, t: PegTheme): void {
  const pulse = 0.5 + 0.5 * Math.sin(animClock * 3);
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r, t.boss, t.bossHi, t.bossDark, t.boss, 10 + pulse * 10);
    ctx.fillStyle = t.bossHi;
    ctx.font = `bold ${Math.round(r * 1.1)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♛", p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
    // HP dots
    const hpTotal = 5;
    const hpLeft = p.armorHits + 1;
    const dotSpacing = 4.5;
    const totalW = (hpTotal - 1) * dotSpacing;
    for (let hi = 0; hi < hpTotal; hi++) {
      const ddx = p.x - totalW / 2 + hi * dotSpacing;
      const ddy = p.y + r + 5;
      ctx.fillStyle = hi < hpLeft ? t.boss : t.bossDark;
      ctx.fillRect(Math.round(ddx - 1), Math.round(ddy - 1), 2, 2);
    }
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.bossDark);
  }
}

function drawBombPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, t: PegTheme): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r, t.bomb, t.bombHi, t.bombDark, hexAlpha(t.bomb, 0.5), 4);
    ctx.fillStyle = t.bombHi;
    ctx.font = `bold ${Math.round(r * 1.2)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.bombHit);
  }
}

function drawArmorPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, t: PegTheme): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r, t.armor, t.armorHi, t.armorDark, "rgba(0,0,0,0.3)", 2);
    ctx.fillStyle = "rgba(200,220,255,0.9)";
    const sh = Math.round(r * 0.45);
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - sh), 2, sh);
    ctx.fillRect(Math.round(p.x - 2), Math.round(p.y), 3, 1);
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y + 1), 2, sh);
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.armorDark);
  }
}

function drawOrangePeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, inFever: boolean, feverIntensity: number, t: PegTheme): void {
  if (!p.hit) {
    if (inFever) {
      pixelSquare(ctx, p.x, p.y, r,
        t.orangeFever, t.orangeGlow, t.orangeDark,
        t.orangeGlow, 14 + feverIntensity * 14,
      );
    } else {
      pixelSquare(ctx, p.x, p.y, r,
        t.orange, t.orangeHi, t.orangeDark,
        hexAlpha(t.orange, 0.4), 5,
      );
    }
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.orangeDark);
  }
}

function drawGreenPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, t: PegTheme): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      t.green, t.greenHi, t.greenDark,
      hexAlpha(t.green, 0.35), 4,
    );
    ctx.fillStyle = t.greenHi;
    ctx.font = `bold 5px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(greenPowerupSymbol(p.greenPowerup), p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.greenDark);
  }
}

function drawNormalPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, t: PegTheme): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r, t.normal, t.normalHi, t.normalDark);
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, t.normalDark);
  }
}

export function drawPegs(ctx: CanvasRenderingContext2D, s: GameState, inFever: boolean, feverIntensity: number, theme: GameTheme): void {
  const t = applyPegSkinOverrides(theme.peg);
  ctx.imageSmoothingEnabled = false;

  for (const p of s.pegs) {
    const pulseExtra = inFever && p.orange && !p.hit ? Math.sin(s.feverPulse * 2) * 1.5 : 0;
    const r = (PEG_R + pulseExtra) * p.scale;

    if (!p.popping) {
      if (p.warpId !== undefined)  { drawWarpPeg(ctx, p, r, s.animClock, t); }
      else if (p.boss)             { drawBossPeg(ctx, p, r, s.animClock, t); }
      else if (p.bomb)             { drawBombPeg(ctx, p, r, t); }
      else if (p.armorHits > 0)    { drawArmorPeg(ctx, p, r, t); }
      else if (p.orange)           { drawOrangePeg(ctx, p, r, inFever, feverIntensity, t); }
      else if (p.green)            { drawGreenPeg(ctx, p, r, t); }
      else                         { drawNormalPeg(ctx, p, r, t); }
    } else {
      ctx.globalAlpha = p.popAlpha;
      if (p.warpId !== undefined)  { drawWarpPeg(ctx, p, r, s.animClock, t); }
      else if (p.boss)             { drawBossPeg(ctx, p, r, s.animClock, t); }
      else if (p.bomb)             { drawBombPeg(ctx, p, r, t); }
      else if (p.armorHits > 0)    { drawArmorPeg(ctx, p, r, t); }
      else if (p.orange)           { drawOrangePeg(ctx, p, r, inFever, feverIntensity, t); }
      else if (p.green)            { drawGreenPeg(ctx, p, r, t); }
      else                         { drawNormalPeg(ctx, p, r, t); }
      // Pop ring — square that expands outward
      const ringR = PEG_R + (1 - p.popAlpha) * 18;
      const rs = Math.round(ringR * 2);
      ctx.globalAlpha = p.popAlpha * 0.8;
      ctx.strokeStyle = t.popRing[getPegType(p)];
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(p.x - ringR), Math.round(p.y - ringR), rs, rs);
      ctx.globalAlpha = 1;
    }
  }
}

export function drawWarpCables(ctx: CanvasRenderingContext2D, s: GameState, theme: GameTheme): void {
  if (s.warpPairs.length === 0) return;
  const pulse = 0.45 + 0.3 * Math.sin(s.animClock * 3);
  ctx.strokeStyle = hexAlpha(theme.peg.warp, pulse);
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  for (const [pa, pb] of s.warpPairs) {
    if (pa.hit || pb.hit) continue;
    ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
  }
  ctx.setLineDash([]);
}
