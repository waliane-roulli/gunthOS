import { W, PEG_R } from "./constants";
import type { Peg, GreenPowerupId, Decor } from "./types";
import type { RunState } from "./roguelite";
import { CLASSES, isBossLevel } from "./roguelite";
import {
  tPixelArt, tArc, tCircle, tLine, tHexGrid, dedup,
  mkBumper, mkPlank, mkArc, mkSpike,
} from "./tableau";
import type { TableauResult } from "./tableau";

// ─── Boss peg ─────────────────────────────────────────────────────────────────

function makeBossPeg(cx: number): Peg {
  return {
    x: cx, y: 260,
    hit: false, orange: false, green: false, bomb: false, boss: true,
    armorHits: 4, hitCooldown: 0,
    popping: false, popAlpha: 1, scale: 1,
  };
}

// ─── Layout builders ──────────────────────────────────────────────────────────

function layout1(cx: number): TableauResult {
  // Cœur pixel art + rangées hex denses en bas
  const heart = [
    "0110011100",
    "1111111110",
    "1111111110",
    "0111111100",
    "0011111000",
    "0001110000",
    "0000100000",
  ];
  const pegs: Peg[] = [
    ...tPixelArt(heart, 22, 22, cx - 110, 100),
  ];
  for (let row = 0; row < 5; row++) {
    const y = 350 + row * 24;
    const offset = row % 2 === 0 ? 0 : 11;
    for (let x = 28 + offset; x < W - 20; x += 22) {
      pegs.push({ x, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    }
  }
  return {
    pegs,
    decors: [
      mkBumper(70, 440, 14),
      mkBumper(240, 395, 12),
      mkBumper(410, 440, 14),
    ],
  };
}

function layout2(cx: number): TableauResult {
  // Diamant pixel + colonnes latérales
  const diamond = [
    "000010000",
    "000111000",
    "001111100",
    "011111110",
    "111111111",
    "011111110",
    "001111100",
    "000111000",
    "000010000",
  ];
  const pegs: Peg[] = tPixelArt(diamond, 20, 20, cx - 90, 90);
  for (let y = 80; y < 490; y += 20) {
    pegs.push({ x: 22, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    pegs.push({ x: W - 22, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  for (let y = 90; y < 490; y += 20) {
    pegs.push({ x: 42, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    pegs.push({ x: W - 42, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  return {
    pegs,
    decors: [
      // Deux planches diagonales encadrant le diamant
      mkPlank(cx - 100, 390, 50, Math.PI / 5),
      mkPlank(cx + 100, 390, 50, -Math.PI / 5),
    ],
  };
}

function layout3(cx: number): TableauResult {
  // Étoile pixel art 8 branches + grille hexagonale
  const star = [
    "1000000010",
    "0100000100",
    "0010001000",
    "0001010000",
    "1111011111",
    "0001010000",
    "0010001000",
    "0100000100",
    "1000000010",
  ];
  const pegs: Peg[] = tPixelArt(star, 22, 22, cx - 110, 90);
  for (let row = 0; row < 6; row++) {
    const y = 310 + row * 22;
    const offset = row % 2 === 0 ? 0 : 11;
    for (let x = 24 + offset; x < W - 16; x += 22) {
      pegs.push({ x, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    }
  }
  return {
    pegs,
    decors: [
      // Deux arcs en bol symétriques, capturent les balles latérales
      mkArc(cx - 130, 430, 70, -0.7, 0.7, "#3399ff"),
      mkArc(cx + 130, 430, 70, Math.PI - 0.7, Math.PI + 0.7, "#3399ff"),
    ],
  };
}

function layout4(cx: number): TableauResult {
  // Grille hexagonale très dense — spikes dans les 4 coins
  const pegs: Peg[] = [];
  for (let row = 0; row < 16; row++) {
    const y = 80 + row * 27;
    const offset = row % 2 === 0 ? 0 : 13;
    for (let x = 24 + offset; x < W - 16; x += 26) {
      pegs.push({ x, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    }
  }
  return {
    pegs,
    decors: [
      // 4 épines dans les 4 coins, pointes vers le centre
      mkSpike(60,  110, 20, Math.PI * 0.25),
      mkSpike(420, 110, 20, Math.PI * 0.75),
      mkSpike(60,  450, 20, -Math.PI * 0.25),
      mkSpike(420, 450, 20, -Math.PI * 0.75),
    ],
  };
}

function layout5(cx: number): TableauResult {
  // Zigzag dense + barre centrale
  const pegs: Peg[] = [];
  for (let i = 0; i < 18; i++) {
    const y = 75 + i * 26;
    const x = i % 2 === 0
      ? 40 + (i * 12) % (W - 100)
      : W - 40 - (i * 12) % (W - 100);
    for (let dx = -2; dx <= 2; dx++) {
      pegs.push({ x: x + dx * 20, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    }
  }
  for (let x = 30; x < W - 20; x += 20) {
    pegs.push({ x, y: 260, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  return {
    pegs,
    decors: [
      // Planches inclinées le long du zigzag
      mkPlank(130, 175, 45, 0.5),
      mkPlank(310, 280, 45, -0.5),
      mkPlank(165, 385, 45, 0.4),
    ],
  };
}

function layout6(cx: number): TableauResult {
  // Spirale dense + coins
  const totalPegs = 42;
  const turns = 3.2;
  const pegs: Peg[] = [];
  for (let i = 0; i < totalPegs; i++) {
    const t = i / totalPegs;
    const a = t * Math.PI * 2 * turns;
    const r = 14 + t * 175;
    pegs.push({ x: cx + Math.cos(a) * r * 0.88, y: 280 + Math.sin(a) * r * 0.62, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  const corners = [
    [30, 90], [55, 75], [80, 90], [30, 110], [55, 95],
    [W-30, 90], [W-55, 75], [W-80, 90], [W-30, 110], [W-55, 95],
    [30, 440], [55, 460], [80, 445], [W-30, 440], [W-55, 460], [W-80, 445],
  ];
  for (const [bx, by] of corners) {
    pegs.push({ x: bx!, y: by!, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  return {
    pegs,
    decors: [
      // Arc au centre qui canalise les balles vers la spirale
      mkArc(cx, 560, 110, Math.PI, Math.PI * 2, "#44aaff"),
      // Bumper au cœur de la spirale
      mkBumper(cx, 280, 14, "#ff5500"),
    ],
  };
}

function layout7(cx: number): TableauResult {
  // Croix + cercles concentriques
  const pegs: Peg[] = [];
  for (let x = 30; x < W - 20; x += 18) pegs.push({ x, y: 260, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  for (let y = 75; y < 490; y += 18) pegs.push({ x: cx, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    pegs.push({ x: cx + Math.cos(a) * 160, y: 270 + Math.sin(a) * 115, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    pegs.push({ x: cx + Math.cos(a) * 85, y: 270 + Math.sin(a) * 62, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  return {
    pegs,
    decors: [
      // 4 planches diagonales dans les 4 quadrants entre la croix et les cercles
      mkPlank(cx - 105, 175, 48, Math.PI / 4),
      mkPlank(cx + 105, 175, 48, -Math.PI / 4),
      mkPlank(cx - 105, 355, 48, -Math.PI / 4),
      mkPlank(cx + 105, 355, 48, Math.PI / 4),
    ],
  };
}

function layout8(cx: number): TableauResult {
  // Vague sinusoïdale triple + murs latéraux
  const pegs: Peg[] = [];
  for (let x = 22; x < W - 14; x += 16) {
    pegs.push({ x, y: 140 + Math.sin(x * 0.028) * 55, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    pegs.push({ x, y: 240 + Math.sin(x * 0.028 + Math.PI * 0.66) * 55, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    pegs.push({ x, y: 340 + Math.sin(x * 0.028 + Math.PI * 1.33) * 55, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  for (let y = 75; y < 490; y += 16) {
    pegs.push({ x: 22, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
    pegs.push({ x: W - 22, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
  }
  return {
    pegs,
    decors: [
      // Épines entre les vagues, alternées gauche/droite
      mkSpike(cx - 120, 190, 18, Math.PI / 2),
      mkSpike(cx + 120, 290, 18, Math.PI / 2),
      mkSpike(cx - 120, 390, 18, Math.PI / 2),
      mkSpike(cx + 80, 150, 15, -Math.PI / 2),
    ],
  };
}

function layout9(cx: number): TableauResult {
  // Damier — cases creuses + pegs denses
  const cellSize = 24;
  const pegs: Peg[] = [];
  for (let row = 0; row < 17; row++) {
    for (let col = 0; col < 16; col++) {
      if ((row + col) % 2 === 0) {
        const x = 24 + col * cellSize;
        const y = 76 + row * cellSize;
        if (x < W - 12 && y < 490) pegs.push({ x, y, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 });
      }
    }
  }
  return {
    pegs,
    decors: [
      // Bumpers sur les cases vides (cases noires du damier)
      mkBumper(96,  172, 10),
      mkBumper(192, 172, 10),
      mkBumper(288, 172, 10),
      mkBumper(384, 172, 10),
      mkBumper(144, 268, 10),
      mkBumper(240, 268, 10),
      mkBumper(336, 268, 10),
      mkBumper(96,  364, 10),
      mkBumper(288, 364, 10),
    ],
  };
}

function layout10(cx: number): TableauResult {
  // Labyrinthe : couloirs avec murs de pegs
  const walls: [number, number][] = [
    ...Array.from({ length: 18 }, (_, i) => [28 + i * 24, 80] as [number, number]),
    ...Array.from({ length: 8 },  (_, i) => [28 + i * 24, 175] as [number, number]),
    ...Array.from({ length: 7 },  (_, i) => [260 + i * 24, 175] as [number, number]),
    ...Array.from({ length: 6 },  (_, i) => [124 + i * 24, 270] as [number, number]),
    ...Array.from({ length: 7 },  (_, i) => [28 + i * 24, 270] as [number, number]),
    ...Array.from({ length: 5 },  (_, i) => [320 + i * 24, 270] as [number, number]),
    ...Array.from({ length: 8 },  (_, i) => [180 + i * 24, 365] as [number, number]),
    ...Array.from({ length: 18 }, (_, i) => [28 + i * 24, 455] as [number, number]),
    ...[80, 200, 300, 400].flatMap(x => Array.from({ length: 4 }, (_, i) => [x, 100 + i * 24] as [number, number])),
    ...[60, 160, 260, 360, 440].flatMap(x => Array.from({ length: 3 }, (_, i) => [x, 290 + i * 24] as [number, number])),
  ];
  const pegs: Peg[] = walls
    .filter(([wx]) => wx > 10 && wx < W - 10)
    .map(([wx, wy]) => ({ x: wx, y: wy, hit: false, orange: false, green: false, bomb: false, boss: false, armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1 }));
  return {
    pegs,
    decors: [
      // Bumpers aux intersections des couloirs
      mkBumper(140, 225, 12),
      mkBumper(380, 225, 12),
      mkBumper(240, 320, 12),
      // Planches qui créent des déflecteurs dans les corridors
      mkPlank(cx - 60, 128, 40, Math.PI / 4),
      mkPlank(cx + 80, 320, 38, -Math.PI / 4),
    ],
  };
}

// ─── Main builder ──────────────────────────────────────────────────────────────

export function buildLevel(level: number, runState?: RunState): { pegs: Peg[]; decors: Decor[] } {
  const cx = W / 2;
  const layout = ((level - 1) % 10) + 1;
  const isBoss = isBossLevel(level);

  const builders = [layout1, layout2, layout3, layout4, layout5, layout6, layout7, layout8, layout9, layout10];
  const { pegs: rawPegs, decors } = (builders[layout - 1] ?? layout1)(cx);

  // Deduplicate pegs that are too close
  const filtered = dedup(rawPegs, PEG_R * 2.8);

  // Clear boss area + add boss peg
  const result = isBoss
    ? filtered.filter(p => Math.hypot(p.x - cx, p.y - 260) > 40)
    : filtered;
  if (isBoss) result.push(makeBossPeg(cx));

  // Assign orange pegs
  const orangePct = Math.min(0.40, 0.25 + (level - 1) * 0.03);
  const nonBoss = result.filter(p => !p.boss);
  const orangeCount = Math.floor(nonBoss.length * orangePct);
  const shuffled = [...Array(nonBoss.length).keys()].sort(() => Math.random() - 0.5);

  for (let i = 0; i < orangeCount; i++) {
    const idx = shuffled[i];
    if (idx !== undefined && nonBoss[idx]) nonBoss[idx]!.orange = true;
  }

  const nonOrange = shuffled.filter(i => nonBoss[i] && !nonBoss[i]!.orange);

  const greenPowerupPool: GreenPowerupId[] = runState
    ? (CLASSES[runState.classId]?.greenPowerupPool ?? (["multiball", "spooky", "extraball", "magnet"] as GreenPowerupId[]))
    : (["multiball", "spooky", "extraball", "magnet"] as GreenPowerupId[]);

  for (let i = 0; i < 5; i++) {
    const idx = nonOrange[i];
    if (idx !== undefined && nonBoss[idx]) {
      nonBoss[idx]!.green = true;
      nonBoss[idx]!.greenPowerup = greenPowerupPool[i % greenPowerupPool.length];
    }
  }

  const noBombs = runState ? CLASSES[runState.classId]?.noBombs ?? false : false;

  if (level >= 3 && !noBombs) {
    const bombCount = Math.min(3, 1 + Math.floor((level - 3) / 2));
    const bombCandidates = nonOrange.filter(i => nonBoss[i] && !nonBoss[i]!.orange && !nonBoss[i]!.green);
    for (let i = 0; i < Math.min(bombCount, bombCandidates.length); i++) {
      const idx = bombCandidates[i];
      if (idx !== undefined && nonBoss[idx]) nonBoss[idx]!.bomb = true;
    }
  }

  if (level >= 5) {
    const armorCount = Math.min(5, 2 + Math.floor((level - 5) / 2));
    const armorCandidates = nonOrange.filter(i => nonBoss[i] && !nonBoss[i]!.orange && !nonBoss[i]!.green && !nonBoss[i]!.bomb);
    for (let i = 0; i < Math.min(armorCount, armorCandidates.length); i++) {
      const idx = armorCandidates[i];
      if (idx !== undefined && nonBoss[idx]) nonBoss[idx]!.armorHits = 1;
    }
  }

  if (level >= 7) {
    const pairCount = 1 + Math.floor((level - 7) / 3);
    const warpCandidates = nonOrange.filter(i => nonBoss[i] && !nonBoss[i]!.orange && !nonBoss[i]!.green && !nonBoss[i]!.bomb && nonBoss[i]!.armorHits === 0);
    for (let pair = 0; pair < Math.min(pairCount, Math.floor(warpCandidates.length / 2)); pair++) {
      const a = warpCandidates[pair * 2];
      const b = warpCandidates[pair * 2 + 1];
      if (a !== undefined && b !== undefined && nonBoss[a] && nonBoss[b]) {
        nonBoss[a]!.warpId = pair + 1;
        nonBoss[b]!.warpId = pair + 1;
      }
    }
  }

  return { pegs: result, decors };
}
