import { BALL_R } from "../engine/constants";
import { FACE } from "./theme";
import type { Ball } from "../engine/types";

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, inSlowMo: boolean): void {
  // Trail pixel art — batch without save/restore per point
  const trailLen = ball.trail.length;
  if (trailLen > 0) {
    const trailColor = ball.tint ?? (inSlowMo ? "#88aaff" : "#555588");
    for (let i = 0; i < trailLen; i++) {
      const tp = ball.trail[i]; if (!tp) continue;
      const t = i / trailLen;
      const trailR = Math.round(Math.max(1, BALL_R * t * 0.7));
      ctx.globalAlpha = t * t * 0.35;
      ctx.fillStyle = trailColor;
      ctx.fillRect(
        Math.round(tp.x - trailR),
        Math.round(tp.y - trailR),
        trailR * 2, trailR * 2,
      );
    }
    ctx.globalAlpha = 1;
  }

  const bx = Math.round(ball.x);
  const by = Math.round(ball.y);
  const br = BALL_R;

  // Glow
  ctx.save();
  if (inSlowMo) {
    ctx.shadowColor = "#88aaff";
    ctx.shadowBlur = 8;
  } else if (ball.tint) {
    ctx.shadowColor = ball.tint;
    ctx.shadowBlur = 6;
  } else {
    ctx.shadowColor = "rgba(255,255,255,0.4)";
    ctx.shadowBlur = 4;
  }

  // Corps principal pixel (carré arrondi — 3 rectangles superposés)
  const fill = inSlowMo ? "#aaccff" : (ball.tint ?? "#e0e0ff");
  ctx.fillStyle = fill;
  ctx.fillRect(bx - br + 1, by - br, br * 2 - 2, br * 2);     // centre
  ctx.fillRect(bx - br, by - br + 1, br * 2, br * 2 - 2);     // côtés
  ctx.shadowBlur = 0;

  // Bevel pixel — top/left clairs, bottom/right sombres
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bx - br + 1, by - br, br * 2 - 2, 1);  // top
  ctx.fillRect(bx - br, by - br + 1, 1, br * 2 - 2);  // left
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(bx - br + 1, by + br - 1, br * 2 - 2, 1); // bottom
  ctx.fillRect(bx + br - 1, by - br + 1, 1, br * 2 - 2); // right

  // Pixel highlight coin
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(bx - br + 1, by - br + 1, 2, 1);
  ctx.fillRect(bx - br + 1, by - br + 1, 1, 2);

  // Egg speckles — small pixel dots like a speckled egg
  ctx.fillStyle = inSlowMo ? "rgba(60,100,220,0.55)" : "rgba(80,60,40,0.45)";
  ctx.fillRect(bx - 1, by - br + 2, 2, 1);  // top speckle
  ctx.fillRect(bx + br - 3, by - 1, 1, 2);  // right speckle
  ctx.fillRect(bx - br + 2, by + 1, 1, 1);  // left speckle
  ctx.fillRect(bx, by + br - 3, 2, 1);      // bottom speckle

  ctx.restore();
}
