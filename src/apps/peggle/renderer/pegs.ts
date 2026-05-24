import { PEG_R } from "../engine/constants";
import { FACE, SHD, NAVY, BLUE_T } from "./theme";
import { raisedBevel } from "./helpers";
import type { GameState, Peg, GreenPowerupId } from "../engine/types";

function greenPowerupSymbol(p?: GreenPowerupId): string {
  switch (p) {
    case "multiball":   return "×3";
    case "spooky":      return "SP";
    case "extraball":   return "+1";
    case "pyromaniac":  return "FY";
    case "magnet":      return "MG";
    default:            return "✓";
  }
}

function drawWarpPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, animClock: number): void {
  const wp = 0.6 + 0.4 * Math.sin(animClock * 4 + (p.warpId ?? 0) * 2);
  const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.3, "#dd88ff");
  grad.addColorStop(0.75, "#8800dd");
  grad.addColorStop(1, "#330055");
  ctx.fillStyle = grad;
  if (!p.hit) {
    ctx.shadowColor = "#cc44ff";
    ctx.shadowBlur = 8 + wp * 6;
    ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
  }
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) raisedBevel(ctx, p.x, p.y, r);
}

function drawBossPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, animClock: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(animClock * 3);
  const bg = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(0.22, "#ffee88");
  bg.addColorStop(0.6, "#cc8800");
  bg.addColorStop(1, "#664400");
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 8 + pulse * 8;
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) {
    raisedBevel(ctx, p.x, p.y, r);
    ctx.fillStyle = "#ffffcc";
    ctx.font = `bold ${Math.round(r * 1.1)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♛", p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
    const hpTotal = 5;
    const hpLeft = p.armorHits + 1;
    const dotSpacing = 4.5;
    const totalW = (hpTotal - 1) * dotSpacing;
    for (let hi = 0; hi < hpTotal; hi++) {
      const ddx = p.x - totalW / 2 + hi * dotSpacing;
      const ddy = p.y + r + 5;
      ctx.fillStyle = hi < hpLeft ? "#ffcc00" : "#332200";
      ctx.beginPath(); ctx.arc(ddx, ddy, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawBombPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  ctx.shadowColor = "rgba(180,0,0,0.4)";
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 3;
  ctx.fillStyle = "#cc2200";
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) {
    raisedBevel(ctx, p.x, p.y, r);
    ctx.fillStyle = "#ffeeaa";
    ctx.font = `bold ${Math.round(r * 1.15)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
  }
}

function drawArmorPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  const sg = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, r);
  sg.addColorStop(0, "#dedee4");
  sg.addColorStop(0.45, "#9898a0");
  sg.addColorStop(0.85, "#585860");
  sg.addColorStop(1, "#282830");
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 3;
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) {
    raisedBevel(ctx, p.x, p.y, r);
    ctx.strokeStyle = "rgba(200,220,255,0.8)";
    ctx.lineWidth = 1.2; ctx.lineCap = "round";
    const sh = r * 0.45;
    ctx.beginPath();
    ctx.moveTo(p.x - sh * 0.3, p.y - sh);
    ctx.lineTo(p.x + sh * 0.3, p.y);
    ctx.lineTo(p.x - sh * 0.3, p.y);
    ctx.lineTo(p.x + sh * 0.3, p.y + sh);
    ctx.stroke();
  }
}

function drawOrangePeg(ctx: CanvasRenderingContext2D, p: Peg, r: number, inFever: boolean, feverIntensity: number): void {
  let tg: CanvasGradient;
  if (inFever) {
    tg = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
    tg.addColorStop(0, "#ffffff");
    tg.addColorStop(0.28, "#aaddff");
    tg.addColorStop(0.65, "#0099ee");
    tg.addColorStop(1, "#003366");
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 14 + feverIntensity * 12;
  } else {
    tg = ctx.createLinearGradient(p.x - r, p.y - r, p.x + r, p.y + r);
    tg.addColorStop(0, NAVY);
    tg.addColorStop(0.5, BLUE_T);
    tg.addColorStop(1, NAVY);
    ctx.shadowColor = "rgba(0,0,180,0.55)";
    ctx.shadowBlur = 5;
  }
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) {
    ctx.save();
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = inFever ? "rgba(200,240,255,0.9)" : "rgba(140,210,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, r - 1.2, Math.PI, 0, false); ctx.stroke();
    ctx.strokeStyle = inFever ? "rgba(0,40,80,0.3)" : "rgba(0,0,40,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, r - 1.2, 0, Math.PI, false); ctx.stroke();
    ctx.restore();
  }
}

function drawGreenPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  const gg = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, r);
  gg.addColorStop(0, "#ddffc0");
  gg.addColorStop(0.4, "#44aa22");
  gg.addColorStop(0.85, "#226611");
  gg.addColorStop(1, "#003300");
  ctx.shadowColor = "rgba(0,180,0,0.35)";
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 3;
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) {
    raisedBevel(ctx, p.x, p.y, r);
    ctx.fillStyle = "#ccffaa";
    ctx.font = `bold 5px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(greenPowerupSymbol(p.greenPowerup), p.x, p.y + 0.5);
    ctx.textBaseline = "alphabetic";
  }
}

function drawNormalPeg(ctx: CanvasRenderingContext2D, p: Peg, r: number): void {
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 2;
  ctx.fillStyle = FACE;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  if (!p.hit) raisedBevel(ctx, p.x, p.y, r);
}

export function drawPegs(ctx: CanvasRenderingContext2D, s: GameState, inFever: boolean, feverIntensity: number): void {
  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pulseExtra = inFever && p.orange ? Math.sin(s.feverPulse * 2) * 1.8 : 0;
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

    // Pop ring
    if (p.popping) {
      const ringColor = p.boss ? "#ffd700" : p.orange ? BLUE_T : p.bomb ? "#ff6600" : p.warpId !== undefined ? "#cc88ff" : SHD;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.7;
      const ringR = PEG_R + (1 - p.popAlpha) * 22;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
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
      ctx.strokeStyle = `rgba(160,80,255,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.restore();
    }
  }
}
