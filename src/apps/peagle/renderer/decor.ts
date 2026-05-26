import type { GameState, Decor, DecorBumper, DecorPlank, DecorArc, DecorSpike } from "../engine/types";
import { getDecorColor } from "./skin";

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

// Pixel-art rounded square helper (crisp, 1px pixel grid)
function pixelRoundRect(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  half: number,
  cr: number, // corner radius in pixels
): void {
  const x = Math.round(cx - half);
  const y = Math.round(cy - half);
  const s = half * 2;
  ctx.beginPath();
  ctx.moveTo(x + cr, y);
  ctx.lineTo(x + s - cr, y);
  ctx.lineTo(x + s, y + cr);
  ctx.lineTo(x + s, y + s - cr);
  ctx.lineTo(x + s - cr, y + s);
  ctx.lineTo(x + cr, y + s);
  ctx.lineTo(x, y + s - cr);
  ctx.lineTo(x, y + cr);
  ctx.closePath();
}

function drawBumper(ctx: CanvasRenderingContext2D, d: DecorBumper, _animClock: number): void {
  const { x, y, r, color, flashFrames } = d;
  const isFlash = flashFrames > 0;
  const flashAmt = isFlash ? flashFrames / 14 : 0;

  // pixel grid snap
  const px = Math.round(x);
  const py = Math.round(y);
  const half = Math.round(r * 0.95); // square slightly smaller than circle radius
  const cr = Math.max(3, Math.round(half * 0.25)); // corner radius, pixel-rounded

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // ── Outer glow when flashing ──
  if (isFlash) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * flashAmt;
  }

  // ── Dark border / drop shadow (2px offset, pixel style) ──
  pixelRoundRect(ctx, px + 2, py + 2, half, cr);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();

  ctx.shadowBlur = 0;

  // ── Main body ──
  const bodyColor = isFlash ? lightenHex(color, Math.round(90 * flashAmt)) : darkenHex(color, 15);
  pixelRoundRect(ctx, px, py, half, cr);
  ctx.fillStyle = bodyColor;
  ctx.fill();

  // ── Win98-style raised bevel ──
  // Top edge (light)
  ctx.fillStyle = lightenHex(color, 55);
  ctx.fillRect(px - half + cr, py - half, half * 2 - cr * 2, 2);
  // Left edge (light)
  ctx.fillRect(px - half, py - half + cr, 2, half * 2 - cr * 2);
  // Top-left corner pixel
  ctx.fillRect(px - half + cr - 1, py - half + 1, 2, 1);
  ctx.fillRect(px - half + 1, py - half + cr - 1, 1, 2);

  // Bottom edge (dark)
  ctx.fillStyle = darkenHex(color, 50);
  ctx.fillRect(px - half + cr, py + half - 2, half * 2 - cr * 2, 2);
  // Right edge (dark)
  ctx.fillRect(px + half - 2, py - half + cr, 2, half * 2 - cr * 2);

  // ── Inner face (slightly inset, lighter center) ──
  const inset = 5;
  const innerHalf = half - inset;
  const innerCr = Math.max(2, Math.round(innerHalf * 0.22));
  pixelRoundRect(ctx, px, py, innerHalf, innerCr);
  ctx.fillStyle = isFlash ? lightenHex(color, Math.round(110 * flashAmt)) : lightenHex(color, 12);
  ctx.fill();

  // ── Pixel highlight (top-left corner of inner face) ──
  ctx.fillStyle = isFlash ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)";
  ctx.fillRect(px - innerHalf + 2, py - innerHalf + 2, 4, 1);
  ctx.fillRect(px - innerHalf + 2, py - innerHalf + 2, 1, 4);

  // ── Star / cross mark in center to scream "BUMPER" ──
  const mc = isFlash ? "#ffffff" : darkenHex(color, 40);
  const ms = Math.max(3, Math.round(innerHalf * 0.38));
  ctx.fillStyle = mc;
  // horizontal bar
  ctx.fillRect(px - ms, py - 2, ms * 2, 3);
  // vertical bar
  ctx.fillRect(px - 2, py - ms, 3, ms * 2);
  // center pixel (fill gaps)
  ctx.fillRect(px - 2, py - 2, 3, 3);

  // ── Flash pulse: bright pixel border expanding outward ──
  if (isFlash) {
    const expand = Math.round((1 - flashAmt) * 12);
    pixelRoundRect(ctx, px, py, half + expand, cr + expand);
    ctx.strokeStyle = `rgba(255,255,255,${flashAmt * 0.75})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // second ring (faster decay)
    if (flashAmt > 0.5) {
      const expand2 = Math.round((1 - flashAmt) * 6);
      pixelRoundRect(ctx, px, py, half + expand2, cr + expand2);
      ctx.strokeStyle = `rgba(255,255,255,${(flashAmt - 0.5) * 1.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
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

  // ── Drop shadow ──
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(bx + 3, by + 3, w, h);

  // ── Black outline (1px around the whole bar) ──
  ctx.fillStyle = "#000000";
  ctx.fillRect(bx - 1, by - 1, w + 2, h + 2);

  // ── Body ──
  ctx.fillStyle = isFlash ? lightenHex(color, 80) : color;
  ctx.fillRect(bx, by, w, h);

  // ── Diagonal hatch marks (pixel art "solid obstacle" signal) ──
  ctx.fillStyle = isFlash ? "rgba(255,255,255,0.35)" : darkenHex(color, 30);
  const hatchStep = 8;
  for (let hx = bx; hx < bx + w + h; hx += hatchStep) {
    // each hatch: diagonal line from top edge to bottom, clipped by rect
    const x0 = hx;
    const x1 = hx - h;
    for (let hy = 0; hy < h; hy++) {
      const hpx = Math.round(x0 - hy);
      if (hpx >= bx && hpx < bx + w - 1) {
        ctx.fillRect(hpx, by + hy, 1, 1);
      }
    }
  }

  // ── Win98 raised bevel on top of hatch ──
  ctx.fillStyle = lightenHex(color, 55);
  ctx.fillRect(bx, by, w, 2);       // top
  ctx.fillRect(bx, by, 2, h);       // left
  ctx.fillStyle = darkenHex(color, 50);
  ctx.fillRect(bx, by + h - 2, w, 2); // bottom
  ctx.fillRect(bx + w - 2, by, 2, h); // right

  // ── Pixel highlight ──
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(bx + 2, by + 2, 4, 1);
  ctx.fillRect(bx + 2, by + 2, 1, 3);

  ctx.restore();
}

// ─── Arc ──────────────────────────────────────────────────────────────────────

function drawArc(ctx: CanvasRenderingContext2D, d: DecorArc, animClock: number): void {
  const { x, y, r, startAngle, endAngle, thickness, color, flashFrames } = d;
  const isFlash = flashFrames > 0;
  const flashAmt = flashFrames / 10;

  ctx.save();
  ctx.lineCap = "round";

  if (isFlash) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * flashAmt;
  }

  // ── Drop shadow ──
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = thickness * 2 + 5;
  ctx.beginPath();
  ctx.arc(x + 3, y + 3, r, startAngle, endAngle);
  ctx.stroke();

  // ── Black outline ──
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = thickness * 2 + 3;
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, endAngle);
  ctx.stroke();

  // ── Main body ──
  ctx.strokeStyle = isFlash ? lightenHex(color, 80) : color;
  ctx.lineWidth = thickness * 2;
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, endAngle);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // ── Raised bevel — inner lighter stripe ──
  ctx.strokeStyle = lightenHex(color, 55);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r - thickness + 2, startAngle, endAngle);
  ctx.stroke();

  // ── Darker outer stripe ──
  ctx.strokeStyle = darkenHex(color, 45);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r + thickness - 2, startAngle, endAngle);
  ctx.stroke();

  // ── Tick marks along the arc (pixel art "solid wall" signal) ──
  const arcLen = Math.abs(endAngle - startAngle);
  const tickCount = Math.max(3, Math.round(arcLen * r / 20));
  ctx.strokeStyle = isFlash ? "rgba(255,255,255,0.4)" : darkenHex(color, 35);
  ctx.lineWidth = 1;
  ctx.lineCap = "square";
  for (let i = 0; i < tickCount; i++) {
    const a = startAngle + (arcLen / (tickCount - 1)) * i;
    const inner = r - thickness + 3;
    const outer = r + thickness - 3;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
    ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
    ctx.stroke();
  }

  // ── Flash pulse ──
  if (isFlash) {
    ctx.lineCap = "round";
    const pulse = (1 - flashAmt) * 14;
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

  // ── Drop shadow ──
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.moveTo(tx + 3, ty + 3);
  ctx.lineTo(lx + 3, ly + 3);
  ctx.lineTo(rx + 3, ry + 3);
  ctx.closePath();
  ctx.fill();

  // ── Black outline ──
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.stroke();

  // ── Body ──
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = isFlash ? lightenHex(color, 80) : color;
  ctx.fill();

  // ── Danger stripes — two diagonal bands pixel art ──
  const stripeColor = isFlash ? "rgba(255,255,255,0.4)" : darkenHex(color, 35);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = stripeColor;
  ctx.lineWidth = 2;
  ctx.lineCap = "butt";
  // two stripes perpendicular to the base
  const mx = (lx + rx) / 2, my = (ly + ry) / 2;
  const dx = (tx - mx) * 0.35, dy = (ty - my) * 0.35;
  for (let si = -1; si <= 1; si += 2) {
    const ox = Math.sin(angle) * size * 0.18 * si;
    const oy = -Math.cos(angle) * size * 0.18 * si;
    ctx.beginPath();
    ctx.moveTo(mx + dx + ox, my + dy + oy);
    ctx.lineTo(mx - dx * 0.5 + ox, my - dy * 0.5 + oy);
    ctx.stroke();
  }
  ctx.restore();

  // ── Raised bevel — light on tip→left, dark on tip→right & base ──
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = lightenHex(color, 60);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(lx, ly);
  ctx.stroke();
  ctx.strokeStyle = darkenHex(color, 50);
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
    const skinned = { ...d, color: getDecorColor(d.kind, d.color) };
    if (skinned.kind === "bumper") drawBumper(ctx, skinned as DecorBumper, s.animClock);
    else if (skinned.kind === "plank") drawPlank(ctx, skinned as DecorPlank);
    else if (skinned.kind === "arc") drawArc(ctx, skinned as DecorArc, s.animClock);
    else if (skinned.kind === "spike") drawSpike(ctx, skinned as DecorSpike);
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
