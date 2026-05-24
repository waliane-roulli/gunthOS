import { PEG_R } from "../engine/constants";
import { PEAGLE_THEME } from "./theme";
import type { GameState, Peg, GreenPowerupId } from "../engine/types";
import { getPegType } from "../engine/types";

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
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
  }

  ctx.fillStyle = fill;
  ctx.fillRect(x, y, s, s);

  ctx.shadowBlur = 0;

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

function drawWarpPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, animClock: number): void {
  const wp = 0.6 + 0.4 * Math.sin(animClock * 4 + (p.warpId ?? 0) * 2);
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      "#6600cc", PEAGLE_THEME.peg.warpHi, "#330066",
      "#cc00ff", 10 + wp * 8,
    );
    // Inner pixel accent
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2);
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#220033");
  }
}

function drawBossPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, animClock: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(animClock * 3);
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      "#cc8800", PEAGLE_THEME.peg.bossHi, "#664400",
      "#ffcc00", 10 + pulse * 10,
    );
    ctx.fillStyle = "#ffffcc";
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
      ctx.fillStyle = hi < hpLeft ? "#ffcc00" : "#332200";
      ctx.fillRect(Math.round(ddx - 1), Math.round(ddy - 1), 2, 2);
    }
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#332200");
  }
}

function drawBombPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      PEAGLE_THEME.peg.bomb, PEAGLE_THEME.peg.bombHi, "#880011",
      "rgba(255,20,60,0.5)", 4,
    );
    ctx.fillStyle = "#ffeeaa";
    ctx.font = `bold ${Math.round(r * 1.2)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#440000");
  }
}

function drawArmorPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      "#888899", "#dddde8", "#333340",
      "rgba(0,0,0,0.3)", 2,
    );
    // Lightning bolt pixel art
    ctx.fillStyle = "rgba(200,220,255,0.9)";
    const sh = Math.round(r * 0.45);
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - sh), 2, sh);
    ctx.fillRect(Math.round(p.x - 2), Math.round(p.y), 3, 1);
    ctx.fillRect(Math.round(p.x - 1), Math.round(p.y + 1), 2, sh);
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#444455");
  }
}

function drawOrangePeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, inFever: boolean, feverIntensity: number): void {
  if (!p.hit) {
    if (inFever) {
      pixelSquare(ctx, p.x, p.y, r,
        PEAGLE_THEME.peg.orangeFever, PEAGLE_THEME.peg.orangeGlow, "#880088",
        PEAGLE_THEME.peg.orangeGlow, 14 + feverIntensity * 14,
      );
    } else {
      pixelSquare(ctx, p.x, p.y, r,
        PEAGLE_THEME.peg.orangeBase, PEAGLE_THEME.peg.orangeHi, "#882200",
        "rgba(255,100,0,0.4)", 5,
      );
    }
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#441100");
  }
}

function drawGreenPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      "#009922", PEAGLE_THEME.peg.greenHi, "#003311",
      "rgba(0,255,68,0.35)", 4,
    );
    ctx.fillStyle = "#ccffaa";
    ctx.font = `bold 5px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(greenPowerupSymbol(p.greenPowerup), p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#002208");
  }
}

function drawNormalPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  if (!p.hit) {
    pixelSquare(ctx, p.x, p.y, r,
      PEAGLE_THEME.peg.normal, PEAGLE_THEME.peg.normalHi, "#000d44",
    );
  } else {
    pixelSquareHit(ctx, p.x, p.y, r, "#0a0a22");
  }
}

export function drawPegs(ctx: CanvasRenderingContext2D, s: GameState, inFever: boolean, feverIntensity: number): void {
  ctx.imageSmoothingEnabled = false;

  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pulseExtra = inFever && p.orange ? Math.sin(s.feverPulse * 2) * 1.5 : 0;
    const r = (PEG_R + pulseExtra) * p.scale;

    if (p.warpId !== undefined) {
      drawWarpPeg(ctx, p, r, s.animClock);
    } else if (p.boss) {
      drawBossPeg(ctx, p, r, s.animClock);
    } else if (p.bomb) {
      drawBombPeg(ctx, p, r);
    } else if (p.armorHits > 0) {
      drawArmorPeg(ctx, p, r);
    } else if (p.orange) {
      drawOrangePeg(ctx, p, r, inFever, feverIntensity);
    } else if (p.green) {
      drawGreenPeg(ctx, p, r);
    } else {
      drawNormalPeg(ctx, p, r);
    }

    // Pop ring — carré qui s'agrandit
    if (p.popping) {
      const ringR = PEG_R + (1 - p.popAlpha) * 18;
      const rs = Math.round(ringR * 2);
      const rx = Math.round(p.x - ringR);
      const ry = Math.round(p.y - ringR);
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = PEAGLE_THEME.popRing[getPegType(p)];
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rs, rs);
    }

    ctx.restore();
  }
}

export function drawWarpCables(ctx: CanvasRenderingContext2D, s: GameState): void {
  const warpMap = new Map<number, typeof s.pegs>();
  for (const p of s.pegs) {
    if (p.warpId !== undefined && !p.hit) {
      const arr = warpMap.get(p.warpId) ?? [];
      arr.push(p);
      warpMap.set(p.warpId, arr);
    }
  }
  for (const [, pair] of warpMap) {
    if (pair.length === 2) {
      const [pa, pb] = pair as [typeof s.pegs[0], typeof s.pegs[0]];
      ctx.save();
      const pulse = 0.45 + 0.3 * Math.sin(s.animClock * 3);
      ctx.strokeStyle = `rgba(200,0,255,${pulse})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.restore();
    }
  }
}
