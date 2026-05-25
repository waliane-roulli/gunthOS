import type { GameState, Decor, DecorBumper, DecorPlank, DecorArc, DecorSpike } from "../engine/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lightenHex(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`;
}

function darkenHex(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)})`;
}

// ─── Bumper ───────────────────────────────────────────────────────────────────

function drawBumper(ctx: CanvasRenderingContext2D, d: DecorBumper, animClock: number): void {
  const { x, y, r, color, flashFrames } = d;
  const isFlash = flashFrames > 0;
  const flashAmt = flashFrames / 14;

  ctx.save();

  if (isFlash) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 18 * flashAmt;
  }

  // Outer ring fill
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = isFlash ? lightenHex(color, Math.round(80 * flashAmt)) : darkenHex(color, 20);
  ctx.fill();

  // Win98 raised bevel — light arc top-left
  ctx.strokeStyle = lightenHex(color, 60);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r - 1, Math.PI * 1.1, Math.PI * 2.1);
  ctx.stroke();

  // Shadow arc bottom-right
  ctx.strokeStyle = darkenHex(color, 50);
  ctx.beginPath();
  ctx.arc(x, y, r - 1, 0.1, Math.PI * 1.1);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Inner disc (slightly lighter)
  ctx.beginPath();
  ctx.arc(x, y, r - 4, 0, Math.PI * 2);
  ctx.fillStyle = isFlash ? "#ffffff" : color;
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Pulse ring animation when flash
  if (isFlash) {
    const ringR = r + (1 - flashAmt) * 16;
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${flashAmt * 0.7})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Plank ────────────────────────────────────────────────────────────────────

function drawPlank(ctx: CanvasRenderingContext2D, d: DecorPlank): void {
  const { x, y, len, thickness, angle, color, flashFrames } = d;
  const isFlash = flashFrames > 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const w = len * 2;
  const h = thickness * 2;
  const bx = -len, by = -thickness;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(bx + 2, by + 2, w, h);

  // Body
  ctx.fillStyle = isFlash ? lightenHex(color, 60) : color;
  ctx.fillRect(bx, by, w, h);

  // Win98 raised bevel
  ctx.fillStyle = lightenHex(color, 55);
  ctx.fillRect(bx, by, w, 2);     // top edge
  ctx.fillRect(bx, by, 2, h);     // left edge
  ctx.fillStyle = darkenHex(color, 45);
  ctx.fillRect(bx, by + h - 2, w, 2); // bottom edge
  ctx.fillRect(bx + w - 2, by, 2, h); // right edge

  // Highlight pixel corner
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(bx + 2, by + 2, 3, 1);

  ctx.restore();
}

// ─── Arc ──────────────────────────────────────────────────────────────────────

function drawArc(ctx: CanvasRenderingContext2D, d: DecorArc, animClock: number): void {
  const { x, y, r, startAngle, endAngle, thickness, color, flashFrames } = d;
  const isFlash = flashFrames > 0;
  const flashAmt = flashFrames / 10;

  ctx.save();

  if (isFlash) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * flashAmt;
  }

  // Shadow arc
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = thickness * 2 + 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, r, startAngle, endAngle);
  ctx.stroke();

  // Main arc body
  ctx.strokeStyle = isFlash ? lightenHex(color, 60) : darkenHex(color, 15);
  ctx.lineWidth = thickness * 2;
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, endAngle);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Highlight inner edge (lighter stroke, slightly inward)
  ctx.strokeStyle = lightenHex(color, 55);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r - thickness + 1, startAngle, endAngle);
  ctx.stroke();

  // Shadow outer edge (darker, slightly outward)
  ctx.strokeStyle = darkenHex(color, 40);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r + thickness - 1, startAngle, endAngle);
  ctx.stroke();

  // Flash pulse ring
  if (isFlash) {
    const pulse = (1 - flashAmt) * 12;
    ctx.strokeStyle = `rgba(255,255,255,${flashAmt * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + pulse, startAngle, endAngle);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Spike ────────────────────────────────────────────────────────────────────

function drawSpike(ctx: CanvasRenderingContext2D, d: DecorSpike): void {
  const { x, y, size, angle, color, flashFrames } = d;
  const isFlash = flashFrames > 0;

  const tx = x + Math.cos(angle) * size;
  const ty = y + Math.sin(angle) * size;
  const px = Math.sin(angle) * size * 0.5;
  const py = -Math.cos(angle) * size * 0.5;
  const lx = x + px, ly = y + py;
  const rx = x - px, ry = y - py;

  ctx.save();

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(tx + 2, ty + 2);
  ctx.lineTo(lx + 2, ly + 2);
  ctx.lineTo(rx + 2, ry + 2);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = isFlash ? lightenHex(color, 70) : color;
  ctx.fill();

  // Win98 raised edges: lighter on tip-left, darker on tip-right + base
  // Light edge: tip → left
  ctx.strokeStyle = lightenHex(color, 60);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(lx, ly);
  ctx.stroke();

  // Dark edges: tip → right and base
  ctx.strokeStyle = darkenHex(color, 45);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(rx, ry);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.stroke();

  ctx.restore();
}

// ─── Main draw call ───────────────────────────────────────────────────────────

export function drawDecors(ctx: CanvasRenderingContext2D, s: GameState): void {
  ctx.imageSmoothingEnabled = false;
  for (const d of s.decors) {
    if (d.kind === "bumper") drawBumper(ctx, d, s.animClock);
    else if (d.kind === "plank") drawPlank(ctx, d);
    else if (d.kind === "arc") drawArc(ctx, d, s.animClock);
    else if (d.kind === "spike") drawSpike(ctx, d);
  }
}

export function drawDecorHitboxes(ctx: CanvasRenderingContext2D, s: GameState): void {
  ctx.save();
  ctx.strokeStyle = "rgba(255,200,0,0.6)";
  ctx.lineWidth = 1;
  for (const d of s.decors) {
    if (d.kind === "bumper") {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (d.kind === "plank") {
      const ax = d.x + Math.cos(d.angle) * d.len;
      const ay = d.y + Math.sin(d.angle) * d.len;
      const ex = d.x - Math.cos(d.angle) * d.len;
      const ey = d.y - Math.sin(d.angle) * d.len;
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(ex, ey);
      ctx.stroke();
    } else if (d.kind === "arc") {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, d.startAngle, d.endAngle);
      ctx.stroke();
    } else if (d.kind === "spike") {
      const tx = d.x + Math.cos(d.angle) * d.size;
      const ty = d.y + Math.sin(d.angle) * d.size;
      const px = Math.sin(d.angle) * d.size * 0.5;
      const py = -Math.cos(d.angle) * d.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(d.x + px, d.y + py);
      ctx.lineTo(d.x - px, d.y - py);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}
