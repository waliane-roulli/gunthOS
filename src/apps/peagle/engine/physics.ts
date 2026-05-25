import { BALL_R, PEG_R, PEG_BOUNCE, GRAVITY, FRICTION, WALL_BOUNCE, LAUNCH_SPEED, AIM_LINE_STEPS, W, H } from "./constants";
import type { Peg, Decor } from "./types";

export function circleCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  px: number, py: number, pr: number,
  pegBounce = PEG_BOUNCE,
): { vx: number; vy: number } | null {
  const dx = bx - px;
  const dy = by - py;
  const distSq = dx * dx + dy * dy;
  const minDist = br + pr;
  if (distSq > minDist * minDist) return null;
  const dist = Math.sqrt(distSq);
  if (dist < 0.001) return null;
  const nx = dx / dist;
  const ny = dy / dist;
  const dot = bvx * nx + bvy * ny;
  if (dot >= 0) return null;
  return {
    vx: bvx - (1 + pegBounce) * dot * nx,
    vy: bvy - (1 + pegBounce) * dot * ny,
  };
}

// ─── Decor collision helpers ──────────────────────────────────────────────────

/** Closest point on segment (ax,ay)→(ex,ey) to point (px,py), clamped to segment. */
export function closestOnSeg(
  ax: number, ay: number, ex: number, ey: number,
  px: number, py: number,
): { x: number; y: number } {
  const dx = ex - ax, dy = ey - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 0.0001) return { x: ax, y: ay };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return { x: ax + t * dx, y: ay + t * dy };
}

/** Ball vs capsule (line segment with radius). Used for planks and spike edges. */
export function capsuleCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  ax: number, ay: number, ex: number, ey: number, cr: number,
  bounce: number,
): { vx: number; vy: number } | null {
  const cp = closestOnSeg(ax, ay, ex, ey, bx, by);
  const dx = bx - cp.x, dy = by - cp.y;
  const distSq = dx * dx + dy * dy;
  const minDist = br + cr;
  if (distSq > minDist * minDist || distSq < 0.0001) return null;
  const dist = Math.sqrt(distSq);
  const nx = dx / dist, ny = dy / dist;
  const dot = bvx * nx + bvy * ny;
  if (dot >= 0) return null;
  return {
    vx: bvx - (1 + bounce) * dot * nx,
    vy: bvy - (1 + bounce) * dot * ny,
  };
}

/** Ball vs curved arc wall — handles concave (inner) and convex (outer) surfaces. */
export function arcCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  ax: number, ay: number, r: number,
  startAngle: number, endAngle: number,
  thickness: number,
  bounce: number,
): { vx: number; vy: number } | null {
  const dx = bx - ax, dy = by - ay;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.001) return null;
  const halfT = thickness / 2 + br;
  if (dist > r + halfT || dist < r - halfT) return null;

  // Angular range check (normalize to handle wrapping)
  let ballAngle = Math.atan2(dy, dx);
  const sa = startAngle; let ea = endAngle;
  while (ea < sa) ea += Math.PI * 2;
  while (ballAngle < sa) ballAngle += Math.PI * 2;
  if (ballAngle > ea) return null;

  // Inner = ball inside the arc circle; normal flips accordingly
  const sign = dist < r ? -1 : 1;
  const nx = sign * dx / dist;
  const ny = sign * dy / dist;
  const dot = bvx * nx + bvy * ny;
  if (dot >= 0) return null;
  return {
    vx: bvx - (1 + bounce) * dot * nx,
    vy: bvy - (1 + bounce) * dot * ny,
  };
}

/** Ball vs triangular spike — checks all 3 edges as capsules. */
export function spikeCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  sx: number, sy: number, size: number, angle: number,
  bounce: number,
): { vx: number; vy: number } | null {
  const tx = sx + Math.cos(angle) * size;
  const ty = sy + Math.sin(angle) * size;
  const px = Math.sin(angle) * size * 0.5;
  const py = -Math.cos(angle) * size * 0.5;
  const lx = sx + px, ly = sy + py;
  const rx = sx - px, ry = sy - py;
  const edgeR = 3;
  return (
    capsuleCollide(bx, by, bvx, bvy, br, tx, ty, lx, ly, edgeR, bounce) ??
    capsuleCollide(bx, by, bvx, bvy, br, tx, ty, rx, ry, edgeR, bounce) ??
    capsuleCollide(bx, by, bvx, bvy, br, lx, ly, rx, ry, edgeR, bounce)
  );
}

export function computeAimLine(
  fromX: number, fromY: number, angle: number, pegs: Peg[],
  decors: Decor[] = [],
  ballR = BALL_R, steps = AIM_LINE_STEPS,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let x = fromX, y = fromY;
  let vx = Math.cos(angle) * LAUNCH_SPEED;
  let vy = Math.sin(angle) * LAUNCH_SPEED;

  for (let i = 0; i < steps; i++) {
    x += vx; y += vy;
    vy += GRAVITY; vx *= FRICTION;
    if (x - ballR < 0) { vx = Math.abs(vx) * WALL_BOUNCE; x = ballR; }
    if (x + ballR > W) { vx = -Math.abs(vx) * WALL_BOUNCE; x = W - ballR; }
    points.push({ x, y });
    if (y > H + 20) break;
    for (const p of pegs) {
      if (p.hit) continue;
      const dx = x - p.x, dy = y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < ballR + PEG_R + 2) {
        points.push({ x: p.x, y: p.y });
        return points;
      }
    }
    // Aim line also responds to decors
    for (const d of decors) {
      let r: { vx: number; vy: number } | null = null;
      if (d.kind === "bumper") {
        r = circleCollide(x, y, vx, vy, ballR, d.x, d.y, d.r, 0.9);
      } else if (d.kind === "plank") {
        const ax = d.x + Math.cos(d.angle) * d.len;
        const ay = d.y + Math.sin(d.angle) * d.len;
        const ex = d.x - Math.cos(d.angle) * d.len;
        const ey = d.y - Math.sin(d.angle) * d.len;
        r = capsuleCollide(x, y, vx, vy, ballR, ax, ay, ex, ey, d.thickness, 0.7);
      } else if (d.kind === "arc") {
        r = arcCollide(x, y, vx, vy, ballR, d.x, d.y, d.r, d.startAngle, d.endAngle, d.thickness, 0.7);
      } else if (d.kind === "spike") {
        r = spikeCollide(x, y, vx, vy, ballR, d.x, d.y, d.size, d.angle, 0.7);
      }
      if (r) { vx = r.vx; vy = r.vy; break; }
    }
  }
  return points;
}
