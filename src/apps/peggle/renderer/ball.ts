import { BALL_R } from "../engine/constants";
import { FACE } from "./theme";
import type { Ball } from "../engine/types";

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, inSlowMo: boolean): void {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const speedNorm = Math.min(1, speed / 18);
  const angle = Math.atan2(ball.vy, ball.vx);

  // Trail
  for (let i = 0; i < ball.trail.length; i++) {
    const tp = ball.trail[i]; if (!tp) continue;
    const t = i / ball.trail.length;
    ctx.save();
    ctx.globalAlpha = t * t * 0.3;
    ctx.fillStyle = ball.tint ?? (inSlowMo ? "#aaccff" : FACE);
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, BALL_R * t * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Squash & stretch
  const stretchFactor = 0.22 * speedNorm;
  const rx = BALL_R * (1 + stretchFactor);
  const ry = BALL_R * (1 - stretchFactor * 0.6);

  const hx = ball.x + Math.cos(angle + Math.PI) * 2.5;
  const hy = ball.y + Math.sin(angle + Math.PI) * 2.5;

  const grad = ctx.createRadialGradient(hx, hy, 0.5, ball.x, ball.y, BALL_R);

  if (inSlowMo) {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.2, "#ccddff");
    grad.addColorStop(0.55, "#4488cc");
    grad.addColorStop(0.85, "#002266");
    grad.addColorStop(1, "#000033");
  } else if (ball.tint) {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, ball.tint);
    grad.addColorStop(0.7, ball.tint);
    grad.addColorStop(1, "#222222");
  } else {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.18, "#eeeeee");
    grad.addColorStop(0.45, "#c0c0c0");
    grad.addColorStop(0.75, "#888888");
    grad.addColorStop(1, "#404040");
  }

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 5;
  ctx.fillStyle = grad;
  ctx.translate(ball.x, ball.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Specular highlight
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.ellipse(hx, hy, 3.2, 2, angle - 0.3, 0, Math.PI * 2);
  ctx.fill();
}
