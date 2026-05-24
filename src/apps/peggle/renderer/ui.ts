import { W, H, BUCKET_W, BUCKET_H, LAUNCHER_X, LAUNCHER_Y, BONUS_BUCKET_XS } from "../engine/constants";
import { computeAimLine } from "../engine/physics";
import { FACE, HI, SHD, DARK, NAVY } from "./theme";
import { win98Button, raisedBevel } from "./helpers";
import type { GameState } from "../engine/types";

export function drawAimLine(ctx: CanvasRenderingContext2D, s: GameState, aimAngle: number): void {
  if (s.phase !== "aim") return;
  const pts = computeAimLine(LAUNCHER_X, LAUNCHER_Y, aimAngle, s.pegs, s.effectiveBallR, s.effectiveAimSteps);
  if (pts.length < 2) return;

  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.lineDashOffset = -(s.animClock * 33);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,255,255,0.68)";
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.stroke();

  ctx.restore();
}

export function drawLauncher(ctx: CanvasRenderingContext2D, s: GameState, aimAngle: number): void {
  ctx.save();
  ctx.translate(LAUNCHER_X, LAUNCHER_Y);

  if (s.phase === "aim" || s.phase === "firing") {
    ctx.save();
    ctx.rotate(aimAngle);
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 2;
    ctx.fillStyle = FACE;
    ctx.fillRect(6, -5, 28, 10);
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = HI;
    ctx.fillRect(6, -5, 28, 1);
    ctx.fillRect(6, -5, 1, 10);
    ctx.fillStyle = SHD;
    ctx.fillRect(6, 4, 28, 1);
    ctx.fillRect(33, -5, 1, 10);
    ctx.fillStyle = SHD;
    for (let gx = 14; gx <= 28; gx += 4) {
      ctx.fillRect(gx, -3, 1, 6);
    }
    ctx.fillStyle = FACE;
    ctx.beginPath(); ctx.arc(34, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = HI;
    ctx.beginPath(); ctx.arc(34, 0, 5, Math.PI, 0, false); ctx.fill();
    ctx.fillStyle = SHD;
    ctx.beginPath(); ctx.arc(34, 0, 5, 0, Math.PI, false); ctx.fill();
    ctx.restore();
  }

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 5;
  ctx.fillStyle = FACE;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  raisedBevel(ctx, 0, 0, 14);

  ctx.strokeStyle = s.phase === "aim" ? NAVY : DARK;
  ctx.lineWidth = 1.8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke();
  ctx.fillStyle = s.phase === "aim" ? NAVY : SHD;
  ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

export function drawBuckets(ctx: CanvasRenderingContext2D, s: GameState): void {
  const bucketTop = H - BUCKET_H - 4;
  ctx.save();

  if (s.balls === 0 && s.phase === "firing") {
    const styleForMult = (m: number) => m === 5
      ? { face: "#c8a800", text: "#000000", label: "×5 BONUS" }
      : m === 3
      ? { face: NAVY, text: "#ffffff", label: "×3 BONUS" }
      : { face: FACE, text: "#000000", label: "FREE BALL" };

    for (let i = 0; i < 3; i++) {
      const bx = BONUS_BUCKET_XS[i]!;
      const flash = s.bonusBucketFlash[i] ?? 0;
      const mult = s.bonusBucketMults[i] ?? 1;
      const style = styleForMult(mult);

      win98Button(ctx, bx, bucketTop, BUCKET_W, BUCKET_H, style.face, flash > 0);
      ctx.fillStyle = flash > 0 ? HI : style.text;
      ctx.font = `bold 8px "MS Sans Serif", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(style.label, bx + BUCKET_W / 2, bucketTop + BUCKET_H - 5);
    }
  } else {
    const isFlash = s.bucketFlash > 0;
    win98Button(ctx, s.bucket, bucketTop, BUCKET_W, BUCKET_H, FACE, isFlash);
    ctx.fillStyle = isFlash ? NAVY : "#000000";
    ctx.font = `bold 8px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";
    ctx.fillText("FREE BALL", s.bucket + BUCKET_W / 2, bucketTop + BUCKET_H - 5);
  }

  ctx.restore();

  // Floor strip
  ctx.fillStyle = FACE;
  ctx.fillRect(0, H - 3, W, 3);
  ctx.fillStyle = HI;
  ctx.fillRect(0, H - 3, W, 1);
}
