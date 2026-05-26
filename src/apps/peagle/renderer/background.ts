import { W, H, MAX_SHAKE } from "../engine/constants";
import type { GameState } from "../engine/types";
import type { GameTheme, BgTheme } from "../engine/game-theme";

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const BG_PAD  = MAX_SHAKE + 2;
const GROUND_Y = H - 80;

// ─── PRNG déterministe ───────────────────────────────────────────────────────
// Génère les positions des étoiles / lucioles / neige de façon reproductible.

function makePrng(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── FORÊT data ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const TREE_LAYERS = [
  { x: 0,   tw: 6,  th: 8,  cw: 22, ch: 32, cl: "#2a7a28", ct: "#5a3a1a", layer: 0 },
  { x: 48,  tw: 5,  th: 6,  cw: 18, ch: 26, cl: "#287826", ct: "#5a3a1a", layer: 0 },
  { x: 110, tw: 6,  th: 9,  cw: 24, ch: 36, cl: "#2c7e2a", ct: "#4a3012", layer: 0 },
  { x: 175, tw: 5,  th: 7,  cw: 20, ch: 28, cl: "#267024", ct: "#5a3a1a", layer: 0 },
  { x: 240, tw: 6,  th: 8,  cw: 22, ch: 34, cl: "#2a7a28", ct: "#4a3012", layer: 0 },
  { x: 310, tw: 5,  th: 6,  cw: 18, ch: 26, cl: "#287826", ct: "#5a3a1a", layer: 0 },
  { x: 370, tw: 6,  th: 9,  cw: 24, ch: 32, cl: "#2c7e2a", ct: "#4a3012", layer: 0 },
  { x: 430, tw: 5,  th: 7,  cw: 20, ch: 28, cl: "#267024", ct: "#5a3a1a", layer: 0 },
  { x: 18,  tw: 8,  th: 12, cw: 30, ch: 44, cl: "#38a832", ct: "#3a2208", layer: 1 },
  { x: 80,  tw: 7,  th: 10, cw: 26, ch: 38, cl: "#3aaa34", ct: "#3a2208", layer: 1 },
  { x: 148, tw: 8,  th: 12, cw: 32, ch: 48, cl: "#36a430", ct: "#3a2208", layer: 1 },
  { x: 215, tw: 7,  th: 11, cw: 28, ch: 42, cl: "#38a832", ct: "#3a2208", layer: 1 },
  { x: 282, tw: 8,  th: 13, cw: 30, ch: 46, cl: "#3aaa34", ct: "#3a2208", layer: 1 },
  { x: 348, tw: 7,  th: 10, cw: 26, ch: 38, cl: "#36a430", ct: "#3a2208", layer: 1 },
  { x: 410, tw: 8,  th: 12, cw: 30, ch: 44, cl: "#38a832", ct: "#3a2208", layer: 1 },
  { x: 8,   tw: 10, th: 16, cw: 36, ch: 56, cl: "#1e8c1c", ct: "#2a1808", layer: 2 },
  { x: 88,  tw: 9,  th: 14, cw: 32, ch: 50, cl: "#208e1e", ct: "#2a1808", layer: 2 },
  { x: 170, tw: 10, th: 16, cw: 38, ch: 58, cl: "#1c8a1a", ct: "#2a1808", layer: 2 },
  { x: 255, tw: 9,  th: 14, cw: 34, ch: 52, cl: "#1e8c1c", ct: "#2a1808", layer: 2 },
  { x: 335, tw: 10, th: 16, cw: 36, ch: 56, cl: "#208e1e", ct: "#2a1808", layer: 2 },
  { x: 420, tw: 9,  th: 14, cw: 32, ch: 50, cl: "#1c8a1a", ct: "#2a1808", layer: 2 },
] as const;

const FIREFLY_POS = [
  { x: 60,  y: 180 }, { x: 140, y: 140 }, { x: 220, y: 200 }, { x: 300, y: 160 },
  { x: 380, y: 180 }, { x: 100, y: 220 }, { x: 250, y: 120 }, { x: 340, y: 240 },
  { x: 45,  y: 260 }, { x: 410, y: 200 }, { x: 190, y: 280 }, { x: 270, y: 100 },
] as const;

const FEVER_STARS = [
  { x: 30,  y: 20,  s: 2 }, { x: 80,  y: 45,  s: 1 }, { x: 130, y: 15,  s: 2 },
  { x: 190, y: 55,  s: 1 }, { x: 240, y: 25,  s: 2 }, { x: 300, y: 50,  s: 1 },
  { x: 350, y: 18,  s: 2 }, { x: 410, y: 40,  s: 1 }, { x: 455, y: 22,  s: 2 },
  { x: 55,  y: 80,  s: 1 }, { x: 160, y: 90,  s: 2 }, { x: 220, y: 75,  s: 1 },
  { x: 320, y: 85,  s: 2 }, { x: 390, y: 70,  s: 1 }, { x: 440, y: 95,  s: 2 },
  { x: 110, y: 120, s: 1 }, { x: 270, y: 110, s: 2 }, { x: 360, y: 130, s: 1 },
] as const;

// Oiseaux qui traversent le ciel en forêt
const FORET_BIRDS = [
  { y: 52, speed: 25, period: 28, offset: 0  },
  { y: 38, speed: 36, period: 22, offset: 8  },
  { y: 70, speed: 20, period: 34, offset: 16 },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// ─── ABÎME data ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const ABIME_NEBULAS = [
  { x: 30,  y: 58,  w: 165, h: 95,  r: 50,  g: 0,  b: 130, a: 0.07 },
  { x: 255, y: 42,  w: 135, h: 105, r: 0,   g: 30, b: 110, a: 0.06 },
  { x: 135, y: 108, w: 115, h: 68,  r: 90,  g: 0,  b: 185, a: 0.05 },
  { x: 338, y: 78,  w: 105, h: 84,  r: 0,   g: 85, b: 145, a: 0.05 },
] as const;

const ABIME_STARS = (() => {
  const rnd = makePrng(0xf1a9e5b3);
  const COLS = ["#c8c8ff", "#ffffff", "#ffe8c8", "#d8c8ff", "#c8eeff"] as const;
  return Array.from({ length: 58 }, () => ({
    x:     Math.round(rnd() * W),
    y:     Math.round(rnd() * (GROUND_Y - 60)),
    sz:    rnd() < 0.12 ? 2 : 1,
    phase: rnd() * Math.PI * 2,
    speed: 0.25 + rnd() * 0.5,
    col:   COLS[Math.floor(rnd() * COLS.length)]!,
  }));
})();

// ═══════════════════════════════════════════════════════════════════════════
// ─── ENFER data ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const ENFER_MOUNTAINS = [
  // Couche lointaine (plus claire, plus petite)
  { x: 55,  peakY: 205, bw: 68,  layer: 0 as const },
  { x: 165, peakY: 188, bw: 82,  layer: 0 as const },
  { x: 265, peakY: 198, bw: 76,  layer: 0 as const },
  { x: 375, peakY: 192, bw: 70,  layer: 0 as const },
  // Couche proche (plus sombre, plus grande)
  { x: 18,  peakY: 148, bw: 88,  layer: 1 as const },
  { x: 128, peakY: 128, bw: 102, layer: 1 as const },
  { x: 248, peakY: 138, bw: 96,  layer: 1 as const },
  { x: 378, peakY: 133, bw: 88,  layer: 1 as const },
  { x: 468, peakY: 152, bw: 80,  layer: 1 as const },
] as const;

const ENFER_STALACTITES = [
  { x: 28,  len: 44, bw: 11 },
  { x: 78,  len: 28, bw:  7 },
  { x: 140, len: 62, bw: 16 },
  { x: 198, len: 24, bw:  6 },
  { x: 262, len: 50, bw: 13 },
  { x: 328, len: 33, bw:  8 },
  { x: 398, len: 56, bw: 14 },
  { x: 448, len: 20, bw:  5 },
] as const;

const ENFER_LAVA_CRACKS = [
  { x: 28,  len: 55 }, { x: 108, len: 42 }, { x: 195, len: 66 },
  { x: 295, len: 50 }, { x: 385, len: 70 }, { x: 450, len: 36 },
] as const;

const ENFER_EMBERS = (() => {
  const rnd = makePrng(0xcc4400bb);
  return Array.from({ length: 22 }, () => ({
    x:     Math.round(rnd() * W),
    speed: 0.8 + rnd() * 2.2,
    phase: rnd() * Math.PI * 2,
    col:   rnd() < 0.6 ? "#ff6600" : "#ff3322",
  }));
})();

// ═══════════════════════════════════════════════════════════════════════════
// ─── GLACE data ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const GLACE_STALACTITES = [
  { x: 15,  len: 50, bw: 13 }, { x: 60,  len: 34, bw:  8 },
  { x: 112, len: 66, bw: 18 }, { x: 162, len: 27, bw:  6 },
  { x: 222, len: 56, bw: 14 }, { x: 272, len: 40, bw: 10 },
  { x: 342, len: 72, bw: 20 }, { x: 400, len: 30, bw:  7 },
  { x: 452, len: 48, bw: 12 },
] as const;

const GLACE_STALAGMITES = [
  { x: 44,  len: 38, bw: 10 }, { x: 132, len: 28, bw:  7 },
  { x: 202, len: 46, bw: 13 }, { x: 302, len: 32, bw:  8 },
  { x: 382, len: 50, bw: 13 }, { x: 462, len: 24, bw:  6 },
] as const;

const GLACE_TREES = [
  { x: 12,  h: 58, scale: 0.70 }, { x: 78,  h: 80, scale: 1.00 },
  { x: 198, h: 55, scale: 0.65 }, { x: 352, h: 75, scale: 0.90 },
  { x: 438, h: 62, scale: 0.75 },
] as const;

const GLACE_CRYSTALS = [
  { x: 72,  h: 44 }, { x: 158, h: 34 }, { x: 242, h: 52 },
  { x: 318, h: 38 }, { x: 408, h: 46 },
] as const;

const GLACE_SNOWDRIFTS = [
  { cx: 50,  rw: 82,  rh: 18 }, { cx: 158, rw: 102, rh: 24 },
  { cx: 278, rw: 92,  rh: 20 }, { cx: 398, rw: 112, rh: 22 },
] as const;

const GLACE_SNOW = (() => {
  const rnd = makePrng(0xa7c3d2f1);
  return Array.from({ length: 30 }, () => ({
    x:     Math.round(rnd() * W),
    speed: 0.5 + rnd() * 1.5,
    drift: (rnd() - 0.5) * 0.7,
    phase: rnd() * Math.PI * 2,
    sz:    rnd() < 0.25 ? 2 : 1,
  }));
})();

// ═══════════════════════════════════════════════════════════════════════════
// ─── Primitives pixel art partagées ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function drawPixelTree(
  ctx: Ctx2D,
  baseX: number, baseY: number,
  trunkW: number, trunkH: number,
  crownW: number, crownH: number,
  leafColor: string, trunkColor: string,
): void {
  const tx = Math.round(baseX - trunkW / 2);
  const crownLayers = 3;
  const crownBase = baseY - trunkH;

  ctx.fillStyle = trunkColor;
  ctx.fillRect(tx, Math.round(crownBase), trunkW, trunkH);
  ctx.fillStyle = "rgba(255,200,100,0.12)";
  ctx.fillRect(tx, Math.round(crownBase), 2, trunkH);

  for (let i = 0; i < crownLayers; i++) {
    const layerW = Math.round(crownW * (1 - i / crownLayers * 0.55));
    const layerH = Math.round(crownH / crownLayers * 1.3);
    const layerY = Math.round(crownBase - crownH * (i / crownLayers));
    const steps = Math.ceil(layerH / 3);
    for (let s = 0; s < steps; s++) {
      const p = s / steps;
      const w = Math.max(2, Math.round(layerW * (1 - p * 0.8)));
      const rx = Math.round(baseX - w / 2);
      const ry = layerY + Math.round(s * (layerH / steps));
      ctx.fillStyle = leafColor;
      ctx.fillRect(rx, ry, w, Math.max(1, Math.ceil(layerH / steps)));
    }
    ctx.fillStyle = "rgba(180,255,100,0.18)";
    ctx.fillRect(Math.round(baseX - 2), layerY, 4, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    const layerX = Math.round(baseX - layerW / 2);
    ctx.fillRect(layerX, Math.round(layerY + layerH - 3), layerW, 3);
  }
}

// Triangle de montagne (utilisé pour Enfer)
function drawMountain(ctx: Ctx2D, cx: number, peakY: number, baseY: number, bw: number, color: string): void {
  ctx.fillStyle = color;
  const h = baseY - peakY;
  for (let dy = 0; dy <= h; dy++) {
    const hw = Math.round(bw * (dy / h));
    ctx.fillRect(cx - hw, peakY + dy, hw * 2, 1);
  }
}

// Stalactite (pointe vers le bas, accrochée au plafond)
function drawStalactite(ctx: Ctx2D, cx: number, bw: number, len: number, color: string, hiColor: string): void {
  for (let dy = 0; dy < len; dy++) {
    const hw = Math.max(1, Math.round(bw / 2 * (1 - dy / len)));
    ctx.fillStyle = color;
    ctx.fillRect(cx - hw, dy, hw * 2, 1);
  }
  ctx.fillStyle = hiColor;
  for (let dy = 0; dy < len - 2; dy++) {
    const hw = Math.max(1, Math.round(bw / 2 * (1 - dy / len)));
    ctx.fillRect(cx - hw, dy, 1, 1);
  }
}

// Stalagmite (pointe vers le haut, ancrée au sol)
function drawStalagmite(ctx: Ctx2D, cx: number, groundY: number, bw: number, len: number, color: string, hiColor: string): void {
  for (let dy = 0; dy < len; dy++) {
    const hw = Math.max(1, Math.round(bw / 2 * (len - dy) / len));
    ctx.fillStyle = color;
    ctx.fillRect(cx - hw, groundY - len + dy, hw * 2, 1);
  }
  ctx.fillStyle = hiColor;
  for (let dy = 0; dy < len - 2; dy++) {
    const hw = Math.max(1, Math.round(bw / 2 * (len - dy) / len));
    ctx.fillRect(cx - hw, groundY - len + dy, 1, 1);
  }
}

// Arbre gelé (tronc + branches nues, sans feuilles)
function drawFrozenTree(ctx: Ctx2D, x: number, groundY: number, h: number, scale: number, color: string): void {
  const tw = Math.max(2, Math.round(3 * scale));
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x - tw / 2), groundY - h, tw, h);

  const b1Y = groundY - Math.round(h * 0.58);
  const b1L = Math.round(h * 0.32 * scale);
  ctx.fillRect(x - b1L, b1Y - 1, b1L, 2);
  ctx.fillRect(x,        b1Y - 4, Math.round(b1L * 0.78), 2);

  const b2Y = groundY - Math.round(h * 0.78);
  const b2L = Math.round(h * 0.20 * scale);
  ctx.fillRect(x - b2L, b2Y, b2L, 1);
  ctx.fillRect(x,       b2Y - 3, Math.round(b2L * 0.68), 1);

  ctx.fillRect(x - Math.round(b2L * 0.45), groundY - Math.round(h * 0.92), Math.round(b2L * 0.45), 1);
}

// Cristal de glace (losange vertical)
function drawIceCrystal(ctx: Ctx2D, cx: number, baseY: number, h: number, color: string, hiColor: string): void {
  const maxHw = Math.max(2, Math.round(h * 0.28));
  for (let dy = 0; dy < h; dy++) {
    const t = dy / h;
    const hw = t < 0.28
      ? Math.round(maxHw * (t / 0.28))
      : Math.round(maxHw * (1 - (t - 0.28) / 0.72));
    ctx.fillStyle = color;
    ctx.fillRect(cx - Math.max(1, hw), baseY - h + dy, Math.max(1, hw) * 2, 1);
  }
  ctx.fillStyle = hiColor;
  ctx.fillRect(cx - 1, baseY - h + 2, 2, Math.round(h * 0.2));
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── ABÎME — éléments statiques ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function drawAbimeStaticLayers(ctx: Ctx2D, feverMode: boolean): void {
  // Nébuleuses
  for (const neb of ABIME_NEBULAS) {
    const mult = feverMode ? 1.8 : 1;
    ctx.fillStyle = `rgba(${neb.r},${neb.g},${neb.b},${(neb.a * mult).toFixed(3)})`;
    ctx.fillRect(neb.x, neb.y, neb.w, neb.h);
    ctx.fillStyle = `rgba(${neb.r},${neb.g},${neb.b},${(neb.a * 0.6 * mult).toFixed(3)})`;
    ctx.fillRect(
      Math.round(neb.x + neb.w * 0.2), Math.round(neb.y + neb.h * 0.2),
      Math.round(neb.w * 0.6),         Math.round(neb.h * 0.6),
    );
  }

  // Planète
  drawAbimePlanet(ctx, feverMode);

  // Champ d'étoiles de base (les scintillements sont animés par-dessus)
  ctx.globalAlpha = 0.72;
  for (const st of ABIME_STARS) {
    ctx.fillStyle = st.col;
    ctx.fillRect(st.x, st.y, st.sz, st.sz);
  }
  ctx.globalAlpha = 1;
}

function drawAbimePlanet(ctx: Ctx2D, feverMode: boolean): void {
  const cx = W - 74, cy = 68, r = 18;

  // Halo d'atmosphère
  for (let ar = r + 7; ar > r; ar--) {
    const alpha = (ar - r - 1) * 0.014;
    ctx.fillStyle = feverMode
      ? `rgba(0,80,200,${alpha})`
      : `rgba(80,30,160,${alpha})`;
    for (let dy = -ar; dy <= ar; dy++) {
      const hw = Math.round(Math.sqrt(Math.max(0, ar * ar - dy * dy)));
      if (hw === 0) continue;
      ctx.fillRect(cx - hw, cy + dy, hw * 2, 1);
    }
  }

  // Corps avec bandes de couleur
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
    if (hw === 0) continue;
    const t = (dy + r) / (r * 2);
    ctx.fillStyle = feverMode
      ? (t < 0.35 ? "#00336a" : t < 0.65 ? "#002255" : "#001133")
      : (t < 0.35 ? "#7733bb" : t < 0.65 ? "#551199" : "#330066");
    ctx.fillRect(cx - hw, cy + dy, hw * 2, 1);
  }

  // Bande équatoriale
  for (let dy = 1; dy <= 4; dy++) {
    const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
    if (hw < 2) continue;
    ctx.fillStyle = feverMode ? "rgba(0,60,130,0.38)" : "rgba(160,80,255,0.30)";
    ctx.fillRect(cx - hw, cy + dy, hw * 2, 1);
  }

  // Highlight
  ctx.fillStyle = feverMode ? "rgba(100,180,255,0.58)" : "rgba(220,190,255,0.62)";
  ctx.fillRect(cx - r + 4, cy - r + 4, 6, 2);
  ctx.fillRect(cx - r + 4, cy - r + 5, 2, 3);

  // Anneau
  const rw = r + 12;
  for (let dx = -rw; dx <= rw; dx++) {
    if (Math.abs(dx) < r - 3) continue;
    const ovalDy = Math.round(4 * Math.sqrt(Math.max(0, 1 - (dx / rw) ** 2)));
    ctx.fillStyle = feverMode ? "rgba(0,80,180,0.44)" : "rgba(150,100,220,0.44)";
    ctx.fillRect(cx + dx, cy + ovalDy, 1, 1);
    if (ovalDy > 0) ctx.fillRect(cx + dx, cy - ovalDy, 1, 1);
  }
}

// ─── ABÎME — animation par frame ─────────────────────────────────────────────

function drawAbimeAnimated(ctx: CanvasRenderingContext2D, s: GameState, feverMode: boolean): void {
  // Scintillement des étoiles
  for (let i = 0; i < ABIME_STARS.length; i++) {
    const st = ABIME_STARS[i]!;
    const t = 0.45 + 0.55 * Math.abs(Math.sin(st.phase + s.animClock * st.speed));
    if (t > 0.72) {
      ctx.globalAlpha = (t - 0.72) * 2.6;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(st.x, st.y, st.sz, st.sz);
      if (st.sz > 1) {
        ctx.fillRect(st.x - 1, (st.y + st.sz / 2) | 0, st.sz + 2, 1);
        ctx.fillRect((st.x + st.sz / 2) | 0, st.y - 1, 1, st.sz + 2);
      }
    }
  }
  ctx.globalAlpha = 1;

  // Étoile filante (toutes les ~11 secondes)
  {
    const period = 11;
    const t = s.animClock % period;
    if (t < 0.88) {
      const progress = t / 0.88;
      const sx = 55, sy = 16, ex = 365, ey = 118;
      const cx = Math.round(sx + (ex - sx) * progress);
      const cy = Math.round(sy + (ey - sy) * progress);
      const dist = Math.hypot(ex - sx, ey - sy);
      const nx = (ex - sx) / dist, ny = (ey - sy) / dist;

      for (let i = 16; i >= 0; i--) {
        ctx.globalAlpha = (1 - i / 16) * (1 - progress * 0.8) * 0.9;
        ctx.fillStyle = i < 5 ? "#ffffff" : "#8888ff";
        ctx.fillRect(Math.round(cx - nx * i * 3.8), Math.round(cy - ny * i * 3.8), i < 4 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  // Pulsation douce de la planète
  const pulse = 0.85 + 0.15 * Math.sin(s.animClock * 0.7);
  ctx.globalAlpha = pulse * (feverMode ? 0.10 : 0.06);
  ctx.fillStyle = feverMode ? "#004488" : "#6622aa";
  ctx.fillRect(W - 96, 46, 50, 50);
  ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── ENFER — éléments statiques ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function drawEnferMountains(ctx: Ctx2D, feverMode: boolean): void {
  // Colonnnes de feu lointaines (halo dans le fond)
  const fireX = [50, 140, 240, 340, 440] as const;
  for (const fx of fireX) {
    for (let dy = 0; dy < 180; dy++) {
      const t = dy / 180;
      const fw = Math.round(20 * (1 - t * 0.7));
      const a  = (1 - t) * (feverMode ? 0.11 : 0.065);
      ctx.fillStyle = `rgba(255,${80 - Math.round(50 * t)},0,${a.toFixed(3)})`;
      ctx.fillRect(((fx - fw / 2) | 0), GROUND_Y - dy, fw, 2);
    }
  }

  // Montagnes volcaniques (couche lointaine, couche proche)
  for (const layer of [0, 1] as const) {
    for (const m of ENFER_MOUNTAINS) {
      if (m.layer !== layer) continue;
      const color = layer === 0
        ? (feverMode ? "#1a0800" : "#3a1008")
        : (feverMode ? "#0e0400" : "#220600");
      drawMountain(ctx, m.x, m.peakY, GROUND_Y, m.bw, color);
    }
  }
}

function drawEnferGroundDetails(ctx: Ctx2D, feverMode: boolean): void {
  // Stalactites de lave accrochées au plafond
  for (const st of ENFER_STALACTITES) {
    drawStalactite(ctx, st.x, st.bw, st.len,
      feverMode ? "#1a0600" : "#2a0c04",
      feverMode ? "#441008" : "#661408",
    );
    // Lueur au bout
    ctx.fillStyle = feverMode ? "rgba(255,80,0,0.5)" : "rgba(200,50,0,0.35)";
    ctx.fillRect(st.x - 1, st.len - 3, 3, 4);
  }

  // Fissures de lave dans le sol
  for (const c of ENFER_LAVA_CRACKS) {
    ctx.fillStyle = feverMode ? "rgba(255,180,0,0.72)" : "rgba(255,100,0,0.55)";
    ctx.fillRect(c.x, GROUND_Y - 1, c.len, 2);
    ctx.fillStyle = feverMode ? "rgba(255,220,50,0.38)" : "rgba(255,200,0,0.28)";
    ctx.fillRect(c.x, GROUND_Y - 2, c.len, 1);
    ctx.fillRect(c.x, GROUND_Y + 1, c.len, 1);
    ctx.fillStyle = feverMode ? "rgba(255,100,0,0.18)" : "rgba(200,50,0,0.12)";
    ctx.fillRect(c.x - 2, GROUND_Y - 3, c.len + 4, 6);
  }
}

// ─── ENFER — animation par frame ─────────────────────────────────────────────

function drawEnferAnimated(ctx: CanvasRenderingContext2D, s: GameState, feverMode: boolean): void {
  // Braises qui montent
  for (let i = 0; i < ENFER_EMBERS.length; i++) {
    const e = ENFER_EMBERS[i]!;
    const rawY = GROUND_Y - ((e.phase / (Math.PI * 2) * 380 + e.speed * s.animClock * 28) % 400);
    const y = Math.round(rawY);
    if (y < 0 || y > GROUND_Y) continue;

    const drift = Math.sin(s.animClock * 1.4 + e.phase) * 14;
    const x     = Math.round((e.x + drift + W * 3) % W);
    const twink = 0.4 + 0.6 * Math.abs(Math.sin(s.animClock * 2.2 + i * 0.8));

    ctx.globalAlpha = twink * (feverMode ? 0.85 : 0.55);
    ctx.fillStyle = e.col;
    ctx.fillRect(x, y, 2, 2);
    ctx.globalAlpha = twink * (feverMode ? 0.22 : 0.12);
    ctx.fillRect(x - 2, y - 2, 6, 6);
  }
  ctx.globalAlpha = 1;

  // Bulles de lave au sol
  const bubbleXs = [38, 108, 188, 268, 358, 432] as const;
  for (let i = 0; i < bubbleXs.length; i++) {
    const bx    = bubbleXs[i]!;
    const cycle = (s.animClock * (0.5 + i * 0.08) + i * 1.7) % (Math.PI * 2);
    if (cycle >= Math.PI) continue;

    const t = cycle / Math.PI;
    const r = Math.round(2 + t * 7);
    const alpha = t < 0.7 ? 0.65 : (1 - t) * 2.2;

    ctx.globalAlpha = alpha;
    for (let dy = -r; dy <= r; dy++) {
      const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
      if (hw === 0) continue;
      ctx.fillStyle = t > 0.75 ? "#ffaa22" : "#ee4400";
      ctx.fillRect(bx - hw, GROUND_Y - 6 + dy, hw * 2, 1);
    }
    if (t < 0.5) {
      ctx.globalAlpha = alpha * 0.55;
      ctx.fillStyle = "#ffdd88";
      ctx.fillRect(bx - r + 2, GROUND_Y - 6 - r + 2, 3, 2);
    }
  }
  ctx.globalAlpha = 1;

  // Flammes au bout des stalactites
  for (const st of ENFER_STALACTITES) {
    const flicker = 0.5 + 0.5 * Math.sin(s.animClock * 4.5 + st.x * 0.055);
    ctx.globalAlpha = flicker * (feverMode ? 0.72 : 0.45);
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(st.x - 2, st.len, 4, 3);
    ctx.globalAlpha = flicker * (feverMode ? 0.18 : 0.10);
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(st.x - 5, st.len - 2, 10, 8);
  }
  ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── GLACE — éléments statiques ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function drawGlaceGroundDetails(ctx: Ctx2D, feverMode: boolean): void {
  // Congères de neige sur le sol
  for (const d of GLACE_SNOWDRIFTS) {
    for (let dy = 0; dy < d.rh; dy++) {
      const t  = dy / d.rh;
      const hw = Math.round(d.rw / 2 * Math.sqrt(1 - t * t));
      ctx.fillStyle = feverMode ? "#5577aa" : "#c8e8f0";
      ctx.fillRect(d.cx - hw, GROUND_Y - d.rh + dy, hw * 2, 1);
    }
    ctx.fillStyle = feverMode ? "rgba(100,150,200,0.38)" : "rgba(255,255,255,0.52)";
    ctx.fillRect(d.cx - Math.round(d.rw * 0.28), GROUND_Y - d.rh + 2, Math.round(d.rw * 0.38), 2);
  }

  // Arbres gelés en arrière-plan
  for (const t of GLACE_TREES) {
    drawFrozenTree(ctx, t.x, GROUND_Y, t.h, t.scale, feverMode ? "#335577" : "#88aabb");
  }

  // Stalactites de glace (plafond → bas)
  for (const st of GLACE_STALACTITES) {
    drawStalactite(ctx, st.x, st.bw, st.len,
      feverMode ? "#224466" : "#88ccee",
      feverMode ? "#336688" : "#cceeff",
    );
    ctx.fillStyle = feverMode ? "rgba(50,100,200,0.38)" : "rgba(100,220,255,0.48)";
    ctx.fillRect(st.x - 2, st.len - 3, 4, 5);
  }

  // Stalagmites de glace (sol → haut)
  for (const st of GLACE_STALAGMITES) {
    drawStalagmite(ctx, st.x, GROUND_Y, st.bw, st.len,
      feverMode ? "#1a3a55" : "#66aacc",
      feverMode ? "#2a5577" : "#aaddee",
    );
  }

  // Cristaux de glace
  for (const cr of GLACE_CRYSTALS) {
    drawIceCrystal(ctx, cr.x, GROUND_Y - 5, cr.h,
      feverMode ? "#1a4466" : "#44aadd",
      feverMode ? "rgba(50,100,180,0.65)" : "rgba(180,240,255,0.78)",
    );
  }
}

// ─── GLACE — animation par frame ─────────────────────────────────────────────

function drawGlaceAnimated(ctx: CanvasRenderingContext2D, s: GameState, feverMode: boolean): void {
  // Aurore boréale
  drawGlaceAurora(ctx, s.animClock, feverMode);

  // Chute de neige
  for (const sf of GLACE_SNOW) {
    const rawY = (sf.phase / (Math.PI * 2) * H + sf.speed * s.animClock * 28) % (H + 30);
    const y    = Math.round(rawY) - 10;
    if (y < 0 || y > GROUND_Y) continue;
    const drift = Math.sin(s.animClock * 0.9 + sf.phase) * 20 * Math.abs(sf.drift);
    const x     = Math.round((sf.x + drift + W * 4) % W);
    ctx.globalAlpha = feverMode ? 0.15 : 0.62;
    ctx.fillStyle = "#ddeeff";
    ctx.fillRect(x, y, sf.sz, sf.sz);
  }
  ctx.globalAlpha = 1;

  // Scintillement des cristaux
  for (let i = 0; i < GLACE_CRYSTALS.length; i++) {
    const cr = GLACE_CRYSTALS[i]!;
    const t  = Math.abs(Math.sin(s.animClock * 0.85 + i * 1.45));
    if (t > 0.82) {
      ctx.globalAlpha = (t - 0.82) * 4 * (feverMode ? 0.28 : 0.88);
      ctx.fillStyle = "#ffffff";
      const sparkY = (GROUND_Y - cr.h / 2) | 0;
      ctx.fillRect(cr.x - 1, sparkY, 3, 1);
      ctx.fillRect(cr.x,     sparkY - 1, 1, 3);
    }
  }
  ctx.globalAlpha = 1;
}

function drawGlaceAurora(ctx: CanvasRenderingContext2D, animClock: number, feverMode: boolean): void {
  const bands = [
    { baseY: 50, r: 0,   g: 255, b: 140, amp: 14, speed: 0.28, freq: 0.018, a: 0.20 },
    { baseY: 70, r: 0,   g: 180, b: 255, amp: 10, speed: 0.20, freq: 0.022, a: 0.15 },
    { baseY: 88, r: 80,  g: 80,  b: 255, amp:  8, speed: 0.24, freq: 0.016, a: 0.11 },
  ];
  for (const band of bands) {
    for (let x = 0; x < W; x += 4) {
      const wave = Math.sin(x * band.freq + animClock * band.speed);
      const py   = Math.round(band.baseY + band.amp * wave);
      const si   = band.a * (0.55 + 0.45 * Math.sin(x * 0.035 + animClock * 0.18));
      const fa   = feverMode ? si * 0.38 : si;
      ctx.fillStyle = `rgba(${band.r},${band.g},${band.b},${fa.toFixed(3)})`;
      ctx.fillRect(x, py, 4, 14);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── FORÊT — oiseaux ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function drawBirdPixel(ctx: CanvasRenderingContext2D, x: number, y: number, wingPhase: number): void {
  const wo = Math.round(Math.sin(wingPhase) * 2);
  ctx.fillRect(Math.round(x - 4), y + wo, 3, 1);
  ctx.fillRect(Math.round(x),     y,      2, 2);
  ctx.fillRect(Math.round(x + 2), y + wo, 3, 1);
}

function drawForetBirds(ctx: CanvasRenderingContext2D, s: GameState, feverMode: boolean): void {
  if (feverMode) return;
  ctx.fillStyle = "#0a2a06";
  for (const bird of FORET_BIRDS) {
    const t = (s.animClock + bird.offset) % bird.period;
    const x = t * bird.speed - 10;
    if (x < -10 || x > W + 10) continue;
    drawBirdPixel(ctx, x, bird.y, s.animClock * 6 + bird.offset);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Corps céleste (soleil / lune) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function drawCelestialBody(ctx: CanvasRenderingContext2D, s: GameState, feverMode: boolean): void {
  if (feverMode) {
    const pulse = 0.88 + 0.12 * Math.sin(s.animClock * 1.2);
    ctx.fillStyle = `rgba(180,150,255,${0.12 * pulse})`;
    ctx.fillRect(W - 66, 10, 44, 44);
    ctx.fillStyle = `rgba(210,190,255,${0.22 * pulse})`;
    ctx.fillRect(W - 60, 14, 32, 32);
    ctx.fillStyle = `rgba(240,230,180,${0.95 * pulse})`;
    ctx.fillRect(W - 54, 18, 20, 20);
    ctx.fillStyle = "rgba(255,255,220,0.7)";
    ctx.fillRect(W - 52, 20, 6, 3);
    ctx.fillRect(W - 52, 20, 3, 6);
    ctx.fillStyle = "rgba(180,160,100,0.4)";
    ctx.fillRect(W - 46, 26, 3, 3);
    ctx.fillRect(W - 40, 30, 2, 2);
  } else {
    const pulse = 0.9 + 0.1 * Math.sin(s.animClock * 0.5);
    ctx.fillStyle = `rgba(255,230,100,${0.9 * pulse})`;
    ctx.fillRect(W - 50, 20, 16, 16);
    ctx.fillStyle = `rgba(255,245,160,${0.6 * pulse})`;
    ctx.fillRect(W - 54, 16, 24, 24);
    ctx.fillStyle = `rgba(255,220,80,${0.5 * pulse})`;
    ctx.fillRect(W - 42, 10, 2, 6);
    ctx.fillRect(W - 42, 42, 2, 6);
    ctx.fillRect(W - 58, 27, 6, 2);
    ctx.fillRect(W - 28, 27, 6, 2);
  }
}

// ─── Étoiles de fièvre ───────────────────────────────────────────────────────

function drawFeverStars(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (let i = 0; i < FEVER_STARS.length; i++) {
    const st = FEVER_STARS[i]!;
    const twinkle = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.3 + s.animClock * (0.6 + (i % 4) * 0.2)));
    ctx.globalAlpha = twinkle * 0.85;
    ctx.fillStyle = i % 3 === 0 ? "#ccaaff" : i % 3 === 1 ? "#ffffff" : "#aaccff";
    ctx.fillRect(st.x, st.y, st.s, st.s);
    if (st.s > 1) {
      ctx.fillRect(st.x - st.s, (st.y + st.s / 2) | 0, st.s * 3, 1);
      ctx.fillRect((st.x + st.s / 2) | 0, st.y - st.s, 1, st.s * 3);
    }
  }
  ctx.globalAlpha = 1;
}

// ─── Lucioles (Forêt) ────────────────────────────────────────────────────────

function drawFireflies(ctx: CanvasRenderingContext2D, s: GameState, feverMode: boolean): void {
  for (let i = 0; i < FIREFLY_POS.length; i++) {
    const ff = FIREFLY_POS[i]!;
    if (ff.y > GROUND_Y - 20) continue;
    const phase   = i * 1.7 + s.animClock * (0.4 + (i % 3) * 0.15);
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(phase));

    if (feverMode) {
      const wobbleX = ff.x + Math.round(Math.sin(s.animClock * 2.5 + i * 0.8) * 18);
      const wobbleY = ff.y + Math.round(Math.cos(s.animClock * 1.8 + i * 1.1) * 12);
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillStyle = i % 2 === 0 ? "#cc66ff" : "#8844ff";
      ctx.fillRect(Math.round(wobbleX), Math.round(wobbleY), 3, 3);
      ctx.globalAlpha = twinkle * 0.25;
      ctx.fillStyle = "#aa44ff";
      ctx.fillRect(Math.round(wobbleX - 3), Math.round(wobbleY - 3), 9, 9);
    } else {
      ctx.globalAlpha = twinkle * 0.55;
      ctx.fillStyle = "#ccff44";
      ctx.fillRect(Math.round(ff.x), Math.round(ff.y), 2, 2);
      ctx.globalAlpha = twinkle * 0.15;
      ctx.fillStyle = "#aaffaa";
      ctx.fillRect(Math.round(ff.x - 2), Math.round(ff.y - 2), 6, 6);
    }
  }
  ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Cache de fond statique (OffscreenCanvas) ────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const _staticBgCache = new Map<string, OffscreenCanvas>();

function buildStaticBg(feverMode: boolean, bg: BgTheme, themeId: string): OffscreenCanvas {
  const CW = W + BG_PAD * 2;
  const CH = H + BG_PAD * 2;
  const canvas = new OffscreenCanvas(CW, CH);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(BG_PAD, BG_PAD);

  const skyRows = 12;
  const topC = feverMode ? bg.skyTopFever : bg.skyTop;
  const botC = feverMode ? bg.skyBotFever : bg.skyBot;

  // ① Dégradé de ciel
  for (let row = 0; row < skyRows; row++) {
    const t = row / skyRows;
    const r = Math.round(topC[0] + (botC[0] - topC[0]) * t);
    const g = Math.round(topC[1] + (botC[1] - topC[1]) * t);
    const b = Math.round(topC[2] + (botC[2] - topC[2]) * t);
    const rowH = Math.ceil(GROUND_Y / skyRows);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(-BG_PAD, row * rowH, CW, rowH + 1);
  }

  // ② Éléments de fond d'Abîme (nébuleuses + planète + étoiles)
  if (themeId === "abime") drawAbimeStaticLayers(ctx, feverMode);

  // ③ Montagnes d'Enfer (dessinées avant le sol pour que la base soit cachée)
  if (themeId === "enfer") drawEnferMountains(ctx, feverMode);

  // ④ Arbres (Forêt seulement)
  if (bg.hasTrees) {
    for (const layer of [0, 1, 2] as const) {
      for (const tree of TREE_LAYERS) {
        if (tree.layer !== layer) continue;
        const leafColor = feverMode
          ? (layer === 2 ? "#080820" : layer === 1 ? "#0c0c30" : "#101040")
          : tree.cl;
        const trunkColor = feverMode ? "#050510" : tree.ct;
        ctx.globalAlpha = layer === 0 ? 0.55 : layer === 1 ? 0.78 : 1.0;
        drawPixelTree(ctx, tree.x, GROUND_Y, tree.tw, tree.th, tree.cw, tree.ch, leafColor, trunkColor);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ⑤ Sol principal (étendu au-delà des bords pour couvrir le shake)
  ctx.fillStyle = feverMode ? bg.groundColorFever : bg.groundColor;
  ctx.fillRect(-BG_PAD, GROUND_Y, CW, CH);

  // ⑥ Herbe (Forêt / Glace — pas pour Enfer)
  if (themeId !== "enfer") {
    ctx.fillStyle = feverMode ? bg.subGroundColorFever : bg.subGroundColor;
    for (let gx = -BG_PAD; gx < W + BG_PAD; gx += 4) {
      const h = 2 + (Math.round(gx * 7 + gx * 3) % 5);
      ctx.fillRect(gx, GROUND_Y - h, 2, h);
    }
    ctx.fillStyle = feverMode ? bg.subGroundColorFever : bg.subGroundColor;
    ctx.fillRect(-BG_PAD, GROUND_Y + 10, CW, CH);
  }

  // ⑦ Détails au sol : Enfer (fissures + stalactites) / Glace (glace + neige)
  if (themeId === "enfer") drawEnferGroundDetails(ctx, feverMode);
  if (themeId === "glace") drawGlaceGroundDetails(ctx, feverMode);

  // ⑧ Brume au sol
  ctx.fillStyle = feverMode ? bg.mistColorFever : bg.mistColor;
  ctx.fillRect(-BG_PAD, GROUND_Y - 8, CW, 16);
  ctx.fillStyle = feverMode ? bg.mistFarColorFever : bg.mistFarColor;
  ctx.fillRect(-BG_PAD, GROUND_Y - 16, CW, 12);

  // ⑨ Scanlines (baked une seule fois)
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  for (let sy = -BG_PAD; sy < H + BG_PAD; sy += 2) {
    ctx.fillRect(-BG_PAD, sy, CW, 1);
  }

  return canvas;
}

function getStaticBg(feverMode: boolean, theme: GameTheme): OffscreenCanvas {
  const key = `${feverMode ? 1 : 0}:${theme.id}`;
  let cached = _staticBgCache.get(key);
  if (!cached) {
    cached = buildStaticBg(feverMode, theme.bg, theme.id);
    _staticBgCache.set(key, cached);
  }
  return cached;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Point d'entrée principal ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  feverIntensity: number,
  theme: GameTheme,
): void {
  const feverMode = feverIntensity > 0.3;

  // Fond statique (blit depuis OffscreenCanvas)
  ctx.drawImage(getStaticBg(feverMode, theme), -BG_PAD, -BG_PAD);

  // Éléments animés selon le thème
  switch (theme.id) {
    case "abime": drawAbimeAnimated(ctx, s, feverMode); break;
    case "enfer": drawEnferAnimated(ctx, s, feverMode); break;
    case "glace": drawGlaceAnimated(ctx, s, feverMode); break;
    case "foret": drawForetBirds(ctx, s, feverMode);    break;
  }

  // Corps céleste (soleil / lune de fièvre)
  drawCelestialBody(ctx, s, feverMode);

  // Étoiles de fièvre (commun à tous les thèmes)
  if (feverMode) drawFeverStars(ctx, s);

  // Lucioles (Forêt uniquement)
  if (theme.bg.hasFireflies) drawFireflies(ctx, s, feverMode);
}
