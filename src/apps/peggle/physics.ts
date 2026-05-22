import { BALL_R, PEG_R, PEG_BOUNCE, GRAVITY, FRICTION, WALL_BOUNCE, LAUNCH_SPEED, AIM_LINE_STEPS, W, H } from "./constants";
import type { Peg } from "./types";

export function circleCollide(
  bx: number, by: number, bvx: number, bvy: number, br: number,
  px: number, py: number, pr: number
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
    vx: bvx - (1 + PEG_BOUNCE) * dot * nx,
    vy: bvy - (1 + PEG_BOUNCE) * dot * ny,
  };
}

export function computeAimLine(
  fromX: number, fromY: number, angle: number, pegs: Peg[]
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let x = fromX, y = fromY;
  let vx = Math.cos(angle) * LAUNCH_SPEED;
  let vy = Math.sin(angle) * LAUNCH_SPEED;

  for (let i = 0; i < AIM_LINE_STEPS; i++) {
    x += vx; y += vy;
    vy += GRAVITY; vx *= FRICTION;
    if (x - BALL_R < 0) { vx = Math.abs(vx) * WALL_BOUNCE; x = BALL_R; }
    if (x + BALL_R > W) { vx = -Math.abs(vx) * WALL_BOUNCE; x = W - BALL_R; }
    points.push({ x, y });
    if (y > H + 20) break;
    for (const p of pegs) {
      if (p.hit) continue;
      const dx = x - p.x, dy = y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < BALL_R + PEG_R + 2) {
        points.push({ x: p.x, y: p.y });
        return points;
      }
    }
  }
  return points;
}
