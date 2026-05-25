import type { GameState } from "../engine/types";
import type { GameTheme } from "../engine/game-theme";
import { PEG_R } from "../engine/constants";
import { drawBackground } from "./background";
import { drawWarpCables, drawPegs } from "./pegs";
import { drawDecors, drawDecorHitboxes } from "./decor";
import { drawAimLine, drawLauncher, drawBuckets } from "./ui";
import { drawBall } from "./ball";
import { drawParticles, drawFloatingTexts, drawScreenFlash, drawVignette, drawBezel } from "./effects";

export interface RenderOpts {
  theme:        GameTheme;
  showHitboxes?: boolean;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  aimAngle: number,
  orangeLeft: number,
  opts: RenderOpts,
): void {
  const { theme, showHitboxes = false } = opts;
  const inFever = orangeLeft <= s.effectiveFeverThreshold && orangeLeft > 0;
  const feverIntensity = inFever ? 1 : 0;
  const inSlowMo = s.slowMoFrames > 0;
  const hasZoom = s.zoomLevel > 1.01 && s.ball?.active;

  ctx.save();

  // Camera: zoom follows ball during slow-mo, otherwise just screen shake
  if (hasZoom && s.ball) {
    const W = 480, H = 640;
    ctx.translate(s.shakeX * 0.4, s.shakeY * 0.4);
    ctx.translate(W / 2, H / 2);
    ctx.scale(s.zoomLevel, s.zoomLevel);
    ctx.translate(-s.ball.x, -s.ball.y);
  } else {
    ctx.translate(s.shakeX, s.shakeY);
  }

  drawBackground(ctx, s, feverIntensity, theme);
  drawDecors(ctx, s);
  drawAimLine(ctx, s, aimAngle);
  drawWarpCables(ctx, s, theme);
  drawPegs(ctx, s, inFever, feverIntensity, theme);
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
  drawScreenFlash(ctx, s, inFever, theme);
  drawVignette(ctx, s);

  if (showHitboxes) { drawDebugHitboxes(ctx, s); drawDecorHitboxes(ctx, s); }
}

function drawDebugHitboxes(ctx: CanvasRenderingContext2D, s: GameState): void {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,0,0.5)";
  ctx.lineWidth = 1;
  for (const p of s.pegs) {
    if (p.hit) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2);
    ctx.stroke();
  }
  const ballR = s.effectiveBallR;
  const balls = s.ball ? [s.ball, ...s.extraBalls] : s.extraBalls;
  ctx.strokeStyle = "rgba(0,255,255,0.7)";
  for (const b of balls) {
    if (!b.active) continue;
    ctx.beginPath();
    ctx.arc(b.x, b.y, ballR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
