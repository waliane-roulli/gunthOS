import { FACE, HI, SHD, DARK, NAVY } from "./theme";

export function raisedBevel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 1.2, Math.PI, 0, false);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 2.6, Math.PI * 1.05, Math.PI * (-0.05), false);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.48)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 1.2, 0, Math.PI, false);
  ctx.stroke();

  ctx.restore();
}

export function win98Button(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  face: string,
  sunken = false,
): void {
  ctx.fillStyle = face;
  ctx.fillRect(x, y, w, h);

  if (sunken) {
    ctx.fillStyle = DARK;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = SHD;
    ctx.fillRect(x + 1, y + 1, w - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, h - 2);
    ctx.fillStyle = HI;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  } else {
    ctx.fillStyle = HI;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = SHD;
    ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
    ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    ctx.fillStyle = DARK;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  }
}

export function drawDesktopIcon(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  type: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  if (type === 0) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 5, y - 6, 10, 13);
    ctx.fillStyle = FACE;
    ctx.fillRect(x + 2, y - 6, 3, 3);
    ctx.fillStyle = NAVY;
    ctx.fillRect(x - 5, y - 6, 10, 3);
    ctx.fillStyle = "#888888";
    ctx.fillRect(x - 3, y - 1, 6, 1);
    ctx.fillRect(x - 3, y + 1, 6, 1);
    ctx.fillRect(x - 3, y + 3, 4, 1);
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x - 5, y - 6, 10, 13);
  } else if (type === 1) {
    ctx.fillStyle = "#e8c040";
    ctx.fillRect(x - 6, y - 6, 5, 3);
    ctx.fillStyle = "#f0d060";
    ctx.fillRect(x - 6, y - 4, 13, 10);
    ctx.fillStyle = "#ffe880";
    ctx.fillRect(x - 5, y - 3, 11, 2);
    ctx.fillStyle = "#c09820";
    ctx.fillRect(x - 6, y + 5, 13, 1);
    ctx.fillRect(x + 6, y - 4, 1, 10);
  } else {
    ctx.fillStyle = FACE;
    ctx.fillRect(x - 7, y - 7, 14, 10);
    ctx.fillStyle = NAVY;
    ctx.fillRect(x - 5, y - 5, 10, 6);
    ctx.fillStyle = "#00aaff";
    ctx.fillRect(x - 4, y - 4, 3, 2);
    ctx.fillStyle = "#00ff44";
    ctx.fillRect(x + 1, y - 4, 2, 1);
    ctx.fillStyle = FACE;
    ctx.fillRect(x - 2, y + 2, 4, 3);
    ctx.fillRect(x - 5, y + 5, 10, 2);
    ctx.fillStyle = HI;
    ctx.fillRect(x - 7, y - 7, 14, 1);
    ctx.fillRect(x - 7, y - 7, 1, 11);
    ctx.fillStyle = SHD;
    ctx.fillRect(x - 7, y + 3, 14, 1);
    ctx.fillRect(x + 6, y - 7, 1, 11);
  }

  ctx.restore();
}
