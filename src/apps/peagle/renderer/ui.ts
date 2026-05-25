import { W, H, BUCKET_W, BUCKET_H, LAUNCHER_X, LAUNCHER_Y, BONUS_BUCKET_XS } from "../engine/constants";
import { computeAimLine } from "../engine/physics";
import { FACE, HI, SHD, DARK } from "./theme";
const NAVY = "#ff6b35"; // warm orange for launcher pixel art
import { win98Button, raisedBevel } from "./helpers";
import type { GameState } from "../engine/types";

// Pixel art eagle mascot — queue en haut, pattes/bec vers le bas
// L'aigle est inversé verticalement pour "envoyer ses œufs avec ses fesses"
const EAGLE_GRID = [
  "...ywy...",   // pattes jaunes en bas
  "...wbw...",
  ".wbbbbbw.",
  "wwbbbbbww",
  ".wbbbbbb.",
  "..wwwyy.",
  "..wywyw..",
  "..wbwbw..",
  "...www...",   // tête en haut
] as const;
const EAGLE_PAL: Record<string, string> = {
  w: "#f5f0e8",
  b: "#8b5e3c",
  y: "#f5c542",
};

function drawEaglePixelArt(ctx: CanvasRenderingContext2D, cx: number, cy: number, cellPx: number) {
  const rows = EAGLE_GRID.length;
  const cols = EAGLE_GRID[0].length;
  const ox = cx - (cols * cellPx) / 2;
  const oy = cy - (rows * cellPx) / 2;
  for (let r = 0; r < rows; r++) {
    const row = EAGLE_GRID[r]!;
    for (let c = 0; c < cols; c++) {
      const ch = row[c]!;
      if (ch === ".") continue;
      const color = EAGLE_PAL[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(ox + c * cellPx), Math.round(oy + r * cellPx), cellPx, cellPx);
    }
  }
}

export function drawAimLine(ctx: CanvasRenderingContext2D, s: GameState, aimAngle: number): void {
  if (s.phase !== "aim") return;
  const pts = computeAimLine(LAUNCHER_X, LAUNCHER_Y, aimAngle, s.pegs, s.decors, s.effectiveBallR, s.effectiveAimSteps);
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

  // L'aigle est inversé (queue en haut, pattes vers le bas) — il vise avec son derrière
  // L'offset de rotation reste le même : les pattes pointent dans la direction du tir
  if (s.phase === "aim" || s.phase === "firing") {
    ctx.save();
    ctx.rotate(aimAngle + Math.PI / 2);
    drawEaglePixelArt(ctx, 0, 0, 3);
    ctx.restore();
  } else {
    // idle — pattes vers le bas (direction de tir par défaut)
    drawEaglePixelArt(ctx, 0, 0, 3);
  }

  ctx.restore();
}

// Brindilles pixel art pré-définies (offset x relatif au centre, offset y, angle 0/1/2)
// On dessine des segments de 1px de large en diagonale pour simuler des brindilles
const TWIG_SEGS = [
  // bord gauche — brindilles qui dépassent
  { sx: -38, sy: 4,  ex: -24, ey: -2 },
  { sx: -36, sy: 8,  ex: -20, ey:  2 },
  { sx: -34, sy: 2,  ex: -22, ey:  8 },
  { sx: -30, sy: -2, ex: -14, ey:  4 },
  // bord droit — brindilles qui dépassent
  { sx:  38, sy: 4,  ex:  24, ey: -2 },
  { sx:  36, sy: 8,  ex:  20, ey:  2 },
  { sx:  34, sy: 2,  ex:  22, ey:  8 },
  { sx:  30, sy: -2, ex:  14, ey:  4 },
  // bord bas — brindilles horizontales
  { sx: -28, sy: 10, ex: -12, ey: 10 },
  { sx: -10, sy: 12, ex:  10, ey: 12 },
  { sx:  12, sy: 10, ex:  28, ey: 10 },
  { sx: -22, sy: 8,  ex: -4,  ey: 11 },
  { sx:   4, sy: 11, ex:  22, ey:  8 },
] as const;

function drawTwig(ctx: CanvasRenderingContext2D, cx: number, cy: number, sx: number, sy: number, ex: number, ey: number, color: string): void {
  const steps = Math.max(Math.abs(ex - sx), Math.abs(ey - sy));
  if (steps === 0) return;
  ctx.fillStyle = color;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = Math.round(cx + sx + (ex - sx) * t);
    const py = Math.round(cy + sy + (ey - sy) * t);
    ctx.fillRect(px, py, 1, 1);
  }
}

function drawNest(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  w: number, h: number,
  eggColor: string, eggHiColor: string,
  flash: boolean,
  animClock: number,
): void {
  // cy = centre vertical du nid
  // Le nid est une cuvette en U — plus large que haut
  const nestW = w + 10;     // légèrement plus large que le bucket
  const nestH = Math.round(h * 0.75);
  const nestBot = Math.round(cy + h * 0.5);   // bas du nid
  const nestTop = nestBot - nestH;             // haut des bords
  const nestMid = nestBot - Math.round(nestH * 0.3); // fond du creux

  // ── Ombre portée ────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  for (let i = 0; i < 4; i++) {
    const inset = i;
    ctx.fillRect(Math.round(cx - nestW / 2) + inset + 3, nestBot + i, nestW - inset * 2 - 3, 1);
  }

  // ── Corps du nid — couches de brindilles entrelacées ────────────────────────
  // On dessine le nid couche par couche du foncé vers le clair

  // Couche de base (la plus foncée — fond du creux)
  ctx.fillStyle = "#1c0a02";
  // Cuvette U : on dessine la forme avec des lignes horizontales de plus en plus larges
  for (let row = 0; row < nestH; row++) {
    const t = row / nestH;
    // La cuvette s'élargit de 30% au fond à 100% en haut
    const rowW = Math.round(nestW * (0.3 + 0.7 * t));
    const rowX = Math.round(cx - rowW / 2);
    const rowY = nestTop + row;
    ctx.fillRect(rowX, rowY, rowW, 1);
  }

  // Brindilles intermédiaires brun moyen
  ctx.fillStyle = "#4a2208";
  for (let row = 2; row < nestH - 1; row += 2) {
    const t = row / nestH;
    const rowW = Math.round((nestW - 8) * (0.28 + 0.68 * t));
    const rowX = Math.round(cx - rowW / 2);
    const rowY = nestTop + row;
    ctx.fillRect(rowX, rowY, rowW, 1);
  }

  // Brindilles claires entrelacées (lignes verticales légères)
  ctx.fillStyle = "#6b3c12";
  for (let col = -Math.floor(nestW / 2) + 4; col < Math.floor(nestW / 2) - 3; col += 5) {
    const absX = Math.round(cx + col);
    // hauteur visible de cette colonne dans la cuvette
    const edgeDist = Math.abs(col) / (nestW / 2);
    const colTop = nestTop + Math.round(nestH * edgeDist * 0.6);
    ctx.fillRect(absX, colTop, 1, nestBot - colTop);
  }

  // Brindilles qui dépassent sur les côtés et en bas — les plus claires
  for (const seg of TWIG_SEGS) {
    drawTwig(ctx, cx, nestBot - Math.round(nestH * 0.3), seg.sx, seg.sy, seg.ex, seg.ey, "#7a4418");
  }
  // Quelques brindilles accent encore plus claires
  for (const seg of TWIG_SEGS) {
    drawTwig(ctx, cx, nestBot - Math.round(nestH * 0.3) - 1, seg.sx - 1, seg.sy - 1, seg.ex - 1, seg.ey - 1, "#5a2e0a");
  }

  // Reflet — bord supérieur légèrement plus clair
  ctx.fillStyle = "#8c5020";
  ctx.fillRect(Math.round(cx - nestW / 2) + 2, nestTop, Math.round(nestW * 0.35), 1);
  ctx.fillRect(Math.round(cx + nestW * 0.15), nestTop, Math.round(nestW * 0.35), 1);

  // ── Fond intérieur du creux — zone où repose l'œuf ──────────────────────────
  const innerW = Math.round(nestW * 0.55);
  const innerH = Math.round(nestH * 0.4);
  ctx.fillStyle = "#2a1208";
  ctx.fillRect(Math.round(cx - innerW / 2), nestMid - innerH + 2, innerW, innerH);
  // Duvet — quelques pixels plus clairs
  ctx.fillStyle = "#3a1c0c";
  ctx.fillRect(Math.round(cx - innerW / 2) + 2, nestMid - innerH + 4, innerW - 4, innerH - 4);

  // ── Œuf ─────────────────────────────────────────────────────────────────────
  const eggCx = Math.round(cx);
  const eggCy = nestMid - Math.round(innerH * 0.5);
  const eggRx = Math.round(innerW * 0.38);
  const eggRy = Math.round(innerH * 0.62);

  if (flash) {
    const glow = 0.65 + 0.35 * Math.sin(animClock * 9);
    ctx.shadowColor = eggHiColor;
    ctx.shadowBlur = 12 * glow;
  }

  // Corps de l'œuf — ellipse pixel art (3 rectangles croisés)
  ctx.fillStyle = eggColor;
  ctx.fillRect(eggCx - eggRx + 2, eggCy - eggRy,     eggRx * 2 - 4, eggRy * 2);
  ctx.fillRect(eggCx - eggRx,     eggCy - eggRy + 2,  eggRx * 2,     eggRy * 2 - 4);
  ctx.fillRect(eggCx - eggRx + 1, eggCy - eggRy + 1,  eggRx * 2 - 2, eggRy * 2 - 2);

  ctx.shadowBlur = 0;

  // Reflet haut-gauche
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillRect(eggCx - eggRx + 3, eggCy - eggRy + 2, 4, 1);
  ctx.fillRect(eggCx - eggRx + 2, eggCy - eggRy + 3, 2, 2);

  // Taches (speckles) de l'œuf
  const speckle = flash ? "rgba(255,255,255,0.45)" : "rgba(70,40,15,0.38)";
  ctx.fillStyle = speckle;
  ctx.fillRect(eggCx - 2,          eggCy - eggRy + 3, 2, 1);
  ctx.fillRect(eggCx + eggRx - 4,  eggCy - 1,         2, 1);
  ctx.fillRect(eggCx - eggRx + 3,  eggCy + 2,         1, 2);
  ctx.fillRect(eggCx + 1,          eggCy + eggRy - 3, 2, 1);
  ctx.fillRect(eggCx - 1,          eggCy + 1,         1, 1);
}

export function drawBuckets(ctx: CanvasRenderingContext2D, s: GameState): void {
  const bucketMidY = H - BUCKET_H / 2 - 4;
  ctx.save();

  if (s.balls === 0 && s.phase === "firing") {
    const eggForMult = (m: number) => m === 5
      ? { egg: "#e8c840", hi: "#ffe870" }   // doré
      : m === 3
      ? { egg: "#5599ee", hi: "#99ccff" }   // bleu
      : { egg: "#e8e4d8", hi: "#ffffff" };  // blanc tacheté

    for (let i = 0; i < 3; i++) {
      const bx = BONUS_BUCKET_XS[i]!;
      const flash = (s.bonusBucketFlash[i] ?? 0) > 0;
      const mult = s.bonusBucketMults[i] ?? 1;
      const eg = eggForMult(mult);
      drawNest(ctx, bx + BUCKET_W / 2, bucketMidY, BUCKET_W, BUCKET_H + 4, eg.egg, eg.hi, flash, s.animClock);
    }
  } else {
    const isFlash = s.bucketFlash > 0;
    drawNest(ctx, s.bucket + BUCKET_W / 2, bucketMidY, BUCKET_W, BUCKET_H + 4, "#e8e4d8", "#ffffff", isFlash, s.animClock);
  }

  ctx.restore();

  // Sol herbeux sous les nids
  ctx.fillStyle = "#3a8c28";
  ctx.fillRect(0, H - 4, W, 4);
  ctx.fillStyle = "#4eb038";
  ctx.fillRect(0, H - 4, W, 1);
}
