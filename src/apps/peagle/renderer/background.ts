import { W, H, SLOW_MO_DURATION } from "../engine/constants";
import type { GameState } from "../engine/types";

// ─── Forêt pixel art ──────────────────────────────────────────────────────────

const TREE_LAYERS = [
  // [x, trunkH, crownH, crownW, colorLeaf, colorTrunk]  — couche fond (petits, clairs)
  { x: 0,   tw: 6,  th: 8,  cw: 22, ch: 32, cl: "#2a7a28", ct: "#5a3a1a", layer: 0 },
  { x: 48,  tw: 5,  th: 6,  cw: 18, ch: 26, cl: "#287826", ct: "#5a3a1a", layer: 0 },
  { x: 110, tw: 6,  th: 9,  cw: 24, ch: 36, cl: "#2c7e2a", ct: "#4a3012", layer: 0 },
  { x: 175, tw: 5,  th: 7,  cw: 20, ch: 28, cl: "#267024", ct: "#5a3a1a", layer: 0 },
  { x: 240, tw: 6,  th: 8,  cw: 22, ch: 34, cl: "#2a7a28", ct: "#4a3012", layer: 0 },
  { x: 310, tw: 5,  th: 6,  cw: 18, ch: 26, cl: "#287826", ct: "#5a3a1a", layer: 0 },
  { x: 370, tw: 6,  th: 9,  cw: 24, ch: 32, cl: "#2c7e2a", ct: "#4a3012", layer: 0 },
  { x: 430, tw: 5,  th: 7,  cw: 20, ch: 28, cl: "#267024", ct: "#5a3a1a", layer: 0 },
  // couche milieu (moyens, saturés)
  { x: 18,  tw: 8,  th: 12, cw: 30, ch: 44, cl: "#38a832", ct: "#3a2208", layer: 1 },
  { x: 80,  tw: 7,  th: 10, cw: 26, ch: 38, cl: "#3aaa34", ct: "#3a2208", layer: 1 },
  { x: 148, tw: 8,  th: 12, cw: 32, ch: 48, cl: "#36a430", ct: "#3a2208", layer: 1 },
  { x: 215, tw: 7,  th: 11, cw: 28, ch: 42, cl: "#38a832", ct: "#3a2208", layer: 1 },
  { x: 282, tw: 8,  th: 13, cw: 30, ch: 46, cl: "#3aaa34", ct: "#3a2208", layer: 1 },
  { x: 348, tw: 7,  th: 10, cw: 26, ch: 38, cl: "#36a430", ct: "#3a2208", layer: 1 },
  { x: 410, tw: 8,  th: 12, cw: 30, ch: 44, cl: "#38a832", ct: "#3a2208", layer: 1 },
  // couche avant (grands, foncés, plus de détails)
  { x: 8,   tw: 10, th: 16, cw: 36, ch: 56, cl: "#1e8c1c", ct: "#2a1808", layer: 2 },
  { x: 88,  tw: 9,  th: 14, cw: 32, ch: 50, cl: "#208e1e", ct: "#2a1808", layer: 2 },
  { x: 170, tw: 10, th: 16, cw: 38, ch: 58, cl: "#1c8a1a", ct: "#2a1808", layer: 2 },
  { x: 255, tw: 9,  th: 14, cw: 34, ch: 52, cl: "#1e8c1c", ct: "#2a1808", layer: 2 },
  { x: 335, tw: 10, th: 16, cw: 36, ch: 56, cl: "#208e1e", ct: "#2a1808", layer: 2 },
  { x: 420, tw: 9,  th: 14, cw: 32, ch: 50, cl: "#1c8a1a", ct: "#2a1808", layer: 2 },
] as const;

// Positions des lucioles (dérivées de leurs coords fixes pour rester cohérentes)
const FIREFLY_POS = [
  { x: 60,  y: 180 }, { x: 140, y: 140 }, { x: 220, y: 200 }, { x: 300, y: 160 },
  { x: 380, y: 180 }, { x: 100, y: 220 }, { x: 250, y: 120 }, { x: 340, y: 240 },
  { x: 45,  y: 260 }, { x: 410, y: 200 }, { x: 190, y: 280 }, { x: 270, y: 100 },
] as const;

function drawPixelTree(
  ctx: CanvasRenderingContext2D,
  baseX: number, baseY: number,
  trunkW: number, trunkH: number,
  crownW: number, crownH: number,
  leafColor: string, trunkColor: string,
): void {
  const tx = Math.round(baseX - trunkW / 2);
  const crownLayers = 3;
  const crownBase = baseY - trunkH;

  // Tronc
  ctx.fillStyle = trunkColor;
  ctx.fillRect(tx, Math.round(crownBase), trunkW, trunkH);

  // Reflet tronc (côté gauche légèrement plus clair)
  ctx.fillStyle = "rgba(255,200,100,0.12)";
  ctx.fillRect(tx, Math.round(crownBase), 2, trunkH);

  // Couronne en triangles étagés (du bas vers le haut, chaque étage plus étroit)
  for (let i = 0; i < crownLayers; i++) {
    const t = i / crownLayers;
    const layerW = Math.round(crownW * (1 - t * 0.55));
    const layerH = Math.round(crownH / crownLayers * 1.3);
    const layerY = Math.round(crownBase - crownH * (i / crownLayers));
    const layerX = Math.round(baseX - layerW / 2);

    ctx.fillStyle = leafColor;
    const steps = Math.ceil(layerH / 3);
    for (let s = 0; s < steps; s++) {
      const p = s / steps;
      const w = Math.max(2, Math.round(layerW * (1 - p * 0.8)));
      const rx = Math.round(baseX - w / 2);
      const ry = layerY + Math.round(s * (layerH / steps));
      ctx.fillRect(rx, ry, w, Math.max(1, Math.ceil(layerH / steps)));
    }

    ctx.fillStyle = "rgba(180,255,100,0.18)";
    ctx.fillRect(Math.round(baseX - 2), layerY, 4, 2);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(layerX, Math.round(layerY + layerH - 3), layerW, 3);
  }
}

function drawGround(ctx: CanvasRenderingContext2D, feverMode: boolean): void {
  const groundY = H - 80;

  // Sol principal
  ctx.fillStyle = feverMode ? "#0a0a28" : "#3a8c28";
  ctx.fillRect(0, groundY, W, H - groundY);

  // Ligne d'herbe pixel art — touffes irrégulières
  ctx.fillStyle = feverMode ? "#1a1a4a" : "#4eb038";
  for (let gx = 0; gx < W; gx += 4) {
    const h = 2 + (Math.round(gx * 7 + gx * 3) % 5);
    ctx.fillRect(gx, groundY - h, 2, h);
  }

  // Sous-sol plus foncé
  ctx.fillStyle = feverMode ? "#050514" : "#1e6016";
  ctx.fillRect(0, groundY + 10, W, H - groundY - 10);

  // Brume au sol
  ctx.fillStyle = feverMode ? "rgba(100,80,200,0.06)" : "rgba(180,240,160,0.07)";
  ctx.fillRect(0, groundY - 8, W, 16);
  ctx.fillStyle = feverMode ? "rgba(80,60,180,0.04)" : "rgba(180,240,160,0.04)";
  ctx.fillRect(0, groundY - 16, W, 12);
}

// Étoiles pixel art pour la nuit magique (fever)
const FEVER_STARS = [
  { x: 30,  y: 20,  s: 2 }, { x: 80,  y: 45,  s: 1 }, { x: 130, y: 15,  s: 2 },
  { x: 190, y: 55,  s: 1 }, { x: 240, y: 25,  s: 2 }, { x: 300, y: 50,  s: 1 },
  { x: 350, y: 18,  s: 2 }, { x: 410, y: 40,  s: 1 }, { x: 455, y: 22,  s: 2 },
  { x: 55,  y: 80,  s: 1 }, { x: 160, y: 90,  s: 2 }, { x: 220, y: 75,  s: 1 },
  { x: 320, y: 85,  s: 2 }, { x: 390, y: 70,  s: 1 }, { x: 440, y: 95,  s: 2 },
  { x: 110, y: 120, s: 1 }, { x: 270, y: 110, s: 2 }, { x: 360, y: 130, s: 1 },
] as const;

export function drawBackground(ctx: CanvasRenderingContext2D, s: GameState, feverIntensity: number, inSlowMo: boolean): void {
  const feverMode = feverIntensity > 0.3;
  const groundY = H - 80;
  const skyRows = 12;

  // ── Ciel dégradé ────────────────────────────────────────────────────────────
  for (let row = 0; row < skyRows; row++) {
    const t = row / skyRows;
    let r: number, g: number, b: number;
    if (feverMode) {
      // Nuit magique — noir profond vers bleu-violet sombre
      const topC = [8, 4, 28];
      const botC = [18, 10, 52];
      r = Math.round(topC[0]! + (botC[0]! - topC[0]!) * t);
      g = Math.round(topC[1]! + (botC[1]! - topC[1]!) * t);
      b = Math.round(topC[2]! + (botC[2]! - topC[2]!) * t);
    } else if (inSlowMo) {
      const pct = s.slowMoFrames / SLOW_MO_DURATION;
      const topC = [26, 58, 110];
      const botC = [42, 90, 58];
      r = Math.round(topC[0]! + (botC[0]! - topC[0]!) * t - pct * 10);
      g = Math.round(topC[1]! + (botC[1]! - topC[1]!) * t);
      b = Math.round(topC[2]! + (botC[2]! - topC[2]!) * t - pct * 20);
    } else {
      const topC = [58, 110, 140];
      const botC = [106, 170, 68];
      r = Math.round(topC[0]! + (botC[0]! - topC[0]!) * t);
      g = Math.round(topC[1]! + (botC[1]! - topC[1]!) * t);
      b = Math.round(topC[2]! + (botC[2]! - topC[2]!) * t);
    }
    const rowH = Math.ceil(groundY / skyRows);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(-10, row * rowH, W + 20, rowH + 1);
  }

  // ── Pleine lune (fever) ou soleil (normal) ───────────────────────────────────
  if (feverMode) {
    // Pleine lune dorée — pulsante
    const pulse = 0.88 + 0.12 * Math.sin(s.animClock * 1.2);
    // Halo extérieur diffus
    ctx.fillStyle = `rgba(180,150,255,${0.12 * pulse})`;
    ctx.fillRect(W - 66, 10, 44, 44);
    // Halo intermédiaire
    ctx.fillStyle = `rgba(210,190,255,${0.22 * pulse})`;
    ctx.fillRect(W - 60, 14, 32, 32);
    // Corps de la lune
    ctx.fillStyle = `rgba(240,230,180,${0.95 * pulse})`;
    ctx.fillRect(W - 54, 18, 20, 20);
    // Reflet top-left
    ctx.fillStyle = "rgba(255,255,220,0.7)";
    ctx.fillRect(W - 52, 20, 6, 3);
    ctx.fillRect(W - 52, 20, 3, 6);
    // Cratères pixel
    ctx.fillStyle = "rgba(180,160,100,0.4)";
    ctx.fillRect(W - 46, 26, 3, 3);
    ctx.fillRect(W - 40, 30, 2, 2);
  } else {
    // Soleil pixel art
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

  // ── Étoiles scintillantes (fever uniquement) ─────────────────────────────────
  if (feverMode) {
    for (let i = 0; i < FEVER_STARS.length; i++) {
      const st = FEVER_STARS[i]!;
      const twinkle = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.3 + s.animClock * (0.6 + (i % 4) * 0.2)));
      const sz = st.s;
      // Étoile en croix pixel
      ctx.globalAlpha = twinkle * 0.85;
      ctx.fillStyle = i % 3 === 0 ? "#ccaaff" : i % 3 === 1 ? "#ffffff" : "#aaccff";
      ctx.fillRect(st.x, st.y, sz, sz);
      if (sz > 1) {
        ctx.fillRect(st.x - sz, st.y + sz / 2 | 0, sz * 3, 1);
        ctx.fillRect(st.x + sz / 2 | 0, st.y - sz, 1, sz * 3);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ── Arbres ───────────────────────────────────────────────────────────────────
  for (const layer of [0, 1, 2] as const) {
    for (const tree of TREE_LAYERS) {
      if (tree.layer !== layer) continue;
      // En fever/nuit les arbres deviennent des silhouettes sombres bleutées
      const leafColor = feverMode
        ? (layer === 2 ? "#080820" : layer === 1 ? "#0c0c30" : "#101040")
        : tree.cl;
      const trunkColor = feverMode ? "#050510" : tree.ct;
      const alpha = layer === 0 ? 0.55 : layer === 1 ? 0.78 : 1.0;
      ctx.save();
      ctx.globalAlpha = alpha;
      drawPixelTree(ctx, tree.x, groundY, tree.tw, tree.th, tree.cw, tree.ch, leafColor, trunkColor);
      ctx.restore();
    }
  }

  // ── Sol herbeux ───────────────────────────────────────────────────────────────
  drawGround(ctx, feverMode);

  // ── Lucioles (normal jaune-vert) ou lucioles magiques violettes (fever) ──────
  for (let i = 0; i < FIREFLY_POS.length; i++) {
    const ff = FIREFLY_POS[i]!;
    if (ff.y > groundY - 20) continue;
    const phase = i * 1.7 + s.animClock * (0.4 + (i % 3) * 0.15);
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(phase));

    if (feverMode) {
      // Lucioles violettes frénétiques — bougent plus vite
      const wobbleX = ff.x + Math.round(Math.sin(s.animClock * 2.5 + i * 0.8) * 18);
      const wobbleY = ff.y + Math.round(Math.cos(s.animClock * 1.8 + i * 1.1) * 12);
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillStyle = i % 2 === 0 ? "#cc66ff" : "#8844ff";
      ctx.fillRect(Math.round(wobbleX), Math.round(wobbleY), 3, 3);
      // Halo violet
      ctx.globalAlpha = twinkle * 0.25;
      ctx.fillStyle = "#aa44ff";
      ctx.fillRect(Math.round(wobbleX - 3), Math.round(wobbleY - 3), 9, 9);
    } else {
      // Luciole normale — jaune-vert
      ctx.globalAlpha = twinkle * 0.55;
      ctx.fillStyle = "#ccff44";
      ctx.fillRect(Math.round(ff.x), Math.round(ff.y), 2, 2);
      ctx.globalAlpha = twinkle * 0.15;
      ctx.fillStyle = "#aaffaa";
      ctx.fillRect(Math.round(ff.x - 2), Math.round(ff.y - 2), 6, 6);
    }
    ctx.globalAlpha = 1;
  }

  // ── Scanlines très légères ────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  for (let sy = 0; sy < H; sy += 2) {
    ctx.fillRect(-10, sy, W + 20, 1);
  }
}
