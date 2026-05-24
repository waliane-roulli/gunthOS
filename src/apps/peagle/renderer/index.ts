import type { GameState } from "../engine/types";
import { drawBackground } from "./background";
import { drawWarpCables, drawPegs } from "./pegs";
import { drawAimLine, drawLauncher, drawBuckets } from "./ui";
import { drawBall } from "./ball";
import { drawParticles, drawFloatingTexts, drawScreenFlash, drawVignette, drawBezel } from "./effects";
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  aimAngle: number,
  orangeLeft: number,
): void {
  const inFever = orangeLeft <= s.effectiveFeverThreshold && orangeLeft > 0;
  const feverIntensity = inFever ? (Math.sin(s.feverPulse) * 0.5 + 0.5) : 0;
  const inSlowMo = s.slowMoFrames > 0;
  const hasZoom = s.zoomLevel > 1.01 && s.ball?.active;

  ctx.save();

  // Camera: zoom follows ball during slow-mo, otherwise just screen shake
  if (hasZoom && s.ball) {
    const W = 480, H = 520;
    ctx.translate(s.shakeX * 0.4, s.shakeY * 0.4);
    ctx.translate(W / 2, H / 2);
    ctx.scale(s.zoomLevel, s.zoomLevel);
    ctx.translate(-s.ball.x, -s.ball.y);
  } else {
    ctx.translate(s.shakeX, s.shakeY);
  }

  drawBackground(ctx, s, feverIntensity, inSlowMo);
  drawAimLine(ctx, s, aimAngle);
  drawWarpCables(ctx, s);
  drawPegs(ctx, s, inFever, feverIntensity);
  drawParticles(ctx, s);

  if (s.ball?.active) drawBall(ctx, s.ball, inSlowMo);
  for (const eb of s.extraBalls) {
    if (eb.active) drawBall(ctx, eb, inSlowMo);
  }

  drawFloatingTexts(ctx, s);
  drawLauncher(ctx, s, aimAngle);
  drawBuckets(ctx, s);

  ctx.restore(); // end camera transform

  drawBezel(ctx);
  drawScreenFlash(ctx, s, inFever);
  drawVignette(ctx, s);
}
