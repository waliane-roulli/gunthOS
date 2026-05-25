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
  // 😄 Visage souriant pixel art + champ hexagonal en bas
  const face = [
    "011111110",
    "100000001",
    "101000101",
    "100000001",
    "100100001",
    "101001101",
    "011111110",
  ];
  return {
    pegs: dedup([
      ...tPixelArt(face, 26, 24, cx - 104, 88),
      ...tHexGrid(24, 298, 17, 5, 26),
    ]),
    decors: [
      mkBumper(cx - 50, 420, 13, "#ffcc00"),
      mkBumper(cx + 50, 420, 13, "#ffcc00"),
      mkBumper(cx, 460, 15, "#ff5500"),
    ],
  };
}

function layout2(cx: number): TableauResult {
  // 👾 Space Invader pixel art + terrain hexagonal
  const invader = [
    "00100100",
    "00011000",
    "01111110",
    "11011011",
    "11111111",
    "01111110",
    "01001010",
    "10001001",
  ];
  return {
    pegs: dedup([
      ...tPixelArt(invader, 24, 22, cx - 96, 85),
      ...tHexGrid(28, 290, 15, 6, 28),
    ]),
    decors: [
      mkBumper(70, 365, 14, "#ff2200"),
      mkBumper(410, 365, 14, "#ff2200"),
      mkBumper(cx, 455, 13, "#ff8800"),
      mkPlank(cx - 90, 262, 48, Math.PI / 4),
      mkPlank(cx + 90, 262, 48, -Math.PI / 4),
    ],
  };
}

function layout3(cx: number): TableauResult {
  // 🟡 Pac-Man + ligne de points + terrain + bumpers fantômes
  const pacBody = tArc(150, 200, 80, 0.45, Math.PI * 2 - 0.45, 20);
  const dots = tLine(242, 200, 450, 200, 28);
  const field = tHexGrid(28, 310, 16, 5, 27);
  return {
    pegs: dedup([...pacBody, ...dots, ...field]),
    decors: [
      mkBumper(385, 155, 11, "#ff4488"),
      mkBumper(420, 135, 9, "#4488ff"),
      mkBumper(355, 160, 10, "#ff4488"),
      mkArc(cx, 490, 95, Math.PI, 0, "#3399ff"),
    ],
  };
}

function layout4(cx: number): TableauResult {
  // 🧬 Double hélice ADN — deux brins sinusoïdaux + barreaux
  const pegs: Peg[] = [];
  const mk = (x: number, y: number): Peg => ({
    x, y, hit: false, orange: false, green: false, bomb: false, boss: false,
    armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1,
  });
  for (let i = 0; i < 24; i++) {
    const y = 80 + i * 18;
    const x1 = cx + Math.cos(i * 0.56) * 115;
    const x2 = cx - Math.cos(i * 0.56) * 115;
    pegs.push(mk(x1, y), mk(x2, y));
    if (i % 3 === 1) pegs.push(...tLine(x1, y, x2, y, 30));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, 200, 11, "#00ffaa"),
      mkBumper(cx, 370, 11, "#00ffaa"),
      mkPlank(cx - 130, 110, 30, 0.4),
      mkPlank(cx + 130, 110, 30, -0.4),
    ],
  };
}

function layout5(cx: number): TableauResult {
  // 🎱 Triangle de billard — 9 rangées + bumpers
  const spacing = 32;
  const pegs: Peg[] = [];
  const mk = (x: number, y: number): Peg => ({
    x, y, hit: false, orange: false, green: false, bomb: false, boss: false,
    armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1,
  });
  for (let row = 0; row < 9; row++) {
    const y = 88 + row * spacing;
    const count = row + 1;
    for (let col = 0; col < count; col++) {
      pegs.push(mk(cx - (count - 1) * spacing * 0.5 + col * spacing, y));
    }
  }
  pegs.push(...tHexGrid(30, 395, 13, 3, 31));
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(78, 265, 15, "#ff8800"),
      mkBumper(402, 265, 15, "#3388ff"),
      mkBumper(cx, 340, 15, "#ff2255"),
      mkSpike(cx - 40, 382, 18, Math.PI / 2),
      mkSpike(cx + 40, 382, 18, Math.PI / 2),
    ],
  };
}

function layout6(cx: number): TableauResult {
  // 🦋 Papillon — deux ailes en arc symétriques + corps central
  return {
    pegs: dedup([
      ...tArc(cx - 80, 210, 130, Math.PI * 0.52, Math.PI * 1.9, 20),
      ...tArc(cx + 80, 210, 130, -Math.PI * 0.9, Math.PI * 0.48, 20),
      ...tArc(cx - 70, 360, 85, Math.PI * 0.6, Math.PI * 1.85, 14),
      ...tArc(cx + 70, 360, 85, -Math.PI * 0.85, Math.PI * 0.4, 14),
      ...tLine(cx, 100, cx, 460, 22),
    ]),
    decors: [
      mkBumper(cx - 80, 210, 14, "#ff66cc"),
      mkBumper(cx + 80, 210, 14, "#ff66cc"),
      mkBumper(cx - 70, 360, 11, "#ff88ee"),
      mkBumper(cx + 70, 360, 11, "#ff88ee"),
    ],
  };
}

function layout7(cx: number): TableauResult {
  // 🌪 Tornade — entonnoir qui rétrécit vers le bas
  const pegs: Peg[] = [];
  const mk = (x: number, y: number): Peg => ({
    x, y, hit: false, orange: false, green: false, bomb: false, boss: false,
    armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1,
  });
  for (let row = 0; row < 19; row++) {
    const y = 80 + row * 22;
    const halfSpread = Math.max(18, 200 - row * 9);
    const step = Math.max(18, 30 - row);
    for (let x = cx - halfSpread; x <= cx + halfSpread; x += step) {
      pegs.push(mk(Math.round(x), y));
    }
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkArc(cx, 75, 205, Math.PI, 0, "#44aaff"),
      mkBumper(cx, 460, 17, "#ff5500"),
      mkPlank(cx - 65, 390, 42, 0.62),
      mkPlank(cx + 65, 390, 42, -0.62),
    ],
  };
}

function layout8(cx: number): TableauResult {
  // 🌵 Cactus pixel art + champ de pegs + épines latérales
  const cactus = [
    "001000000",
    "001000000",
    "011100000",
    "111000100",
    "001001110",
    "001111000",
    "001000000",
    "011100000",
    "001000000",
    "011111110",
  ];
  return {
    pegs: dedup([
      ...tPixelArt(cactus, 26, 24, cx - 100, 80),
      ...tHexGrid(26, 330, 16, 5, 28),
    ]),
    decors: [
      mkSpike(72, 230, 18, 0),
      mkSpike(408, 230, 18, Math.PI),
      mkBumper(cx + 148, 168, 11, "#ffcc22"),
      mkBumper(cx - 100, 302, 11, "#ffcc22"),
      mkArc(cx, 495, 80, Math.PI, 0, "#ffaa44"),
    ],
  };
}

function layout9(cx: number): TableauResult {
  // 🎆 Feu d'artifice — 12 rayons radiaux depuis le centre
  const pegs: Peg[] = [];
  const cy = 252;
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const ex = Math.max(22, Math.min(W - 22, cx + Math.cos(angle) * 178));
    const ey = Math.max(82, Math.min(485, cy + Math.sin(angle) * 155));
    pegs.push(...tLine(cx, cy, ex, ey, 28));
  }
  pegs.push(...tCircle(cx, cy, 72, 16));
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, cy, 16, "#ff4400"),
      mkBumper(cx - 82, cy - 62, 10, "#ffcc00"),
      mkBumper(cx + 82, cy - 62, 10, "#ffcc00"),
      mkBumper(cx - 82, cy + 62, 10, "#ffcc00"),
      mkBumper(cx + 82, cy + 62, 10, "#ffcc00"),
    ],
  };
}

function layout10(cx: number): TableauResult {
  // 🎉 Délire de bumpers — chaos total façon flipper
  return {
    pegs: dedup([
      ...tCircle(cx, 185, 105, 16),
      ...tCircle(cx, 185, 52, 9),
      ...tCircle(cx, 355, 85, 13),
      ...tCircle(cx, 355, 42, 7),
    ]),
    decors: [
      mkBumper(75,  128, 15, "#ff2200"),
      mkBumper(405, 128, 15, "#ff2200"),
      mkBumper(55,  280, 13, "#ff8800"),
      mkBumper(425, 280, 13, "#ff8800"),
      mkBumper(cx - 105, 205, 12, "#ffcc00"),
      mkBumper(cx + 105, 205, 12, "#ffcc00"),
      mkBumper(78,  425, 14, "#44ff88"),
      mkBumper(402, 425, 14, "#44ff88"),
      mkBumper(cx - 58, 375, 12, "#44ff88"),
      mkBumper(cx + 58, 375, 12, "#44ff88"),
      mkBumper(cx, 460, 16, "#ff2255"),
      mkArc(cx, 515, 150, Math.PI * 1.1, Math.PI * 1.9, "#3399ff"),
      mkArc(cx, 95, 105, 0.1, Math.PI - 0.1, "#ff5500"),
      mkPlank(cx - 82, 292, 62, Math.PI / 4),
      mkPlank(cx + 82, 292, 62, -Math.PI / 4),
    ],
  };
}

function layout11(cx: number): TableauResult {
  // 💀 Tête de mort pixel art + terrain hanté
  const skull = [
    "001111100",
    "011111110",
    "111011101",
    "111111111",
    "011111110",
    "001111100",
    "001010100",
    "001111100",
  ];
  return {
    pegs: dedup([
      ...tPixelArt(skull, 24, 22, cx - 96, 88),
      ...tHexGrid(26, 300, 16, 5, 28),
    ]),
    decors: [
      mkBumper(cx - 72, 378, 13, "#aa00ff"),
      mkBumper(cx + 72, 378, 13, "#aa00ff"),
      mkBumper(cx, 455, 15, "#660099"),
      mkArc(cx, 88, 105, 0.2, Math.PI - 0.2, "#aa00ff"),
    ],
  };
}

function layout12(cx: number): TableauResult {
  // 🍄 Champignon Mario pixel art + terrain
  const shroom = [
    "001111100",
    "011111110",
    "110101011",
    "111111111",
    "011111110",
    "001111100",
    "000111000",
    "001111100",
    "000111000",
  ];
  return {
    pegs: dedup([
      ...tPixelArt(shroom, 24, 22, cx - 96, 85),
      ...tHexGrid(28, 310, 15, 5, 28),
    ]),
    decors: [
      mkBumper(cx - 90, 355, 12, "#ff4444"),
      mkBumper(cx + 90, 355, 12, "#ff4444"),
      mkBumper(cx, 460, 15, "#cc0000"),
      mkSpike(50, 160, 16, 0),
      mkSpike(430, 160, 16, Math.PI),
    ],
  };
}

function layout13(cx: number): TableauResult {
  // ⚓ Ancre — anneau + mât + traverse + courbe du bas + flukes
  return {
    pegs: dedup([
      ...tCircle(cx, 128, 28, 10),
      ...tLine(cx, 100, cx, 415, 22),
      ...tLine(cx - 90, 148, cx + 90, 148, 22),
      ...tArc(cx, 390, 78, Math.PI, Math.PI * 2, 13),
      ...tLine(cx - 78, 390, cx - 58, 340, 18),
      ...tLine(cx + 78, 390, cx + 58, 340, 18),
    ]),
    decors: [
      mkBumper(cx - 90, 148, 10, "#3388ff"),
      mkBumper(cx + 90, 148, 10, "#3388ff"),
      mkBumper(cx, 390, 12, "#1155cc"),
      mkBumper(cx - 58, 340, 9, "#66aaff"),
      mkBumper(cx + 58, 340, 9, "#66aaff"),
    ],
  };
}

function layout14(cx: number): TableauResult {
  // ⏳ Sablier — large en haut et en bas, étroit au centre
  const pegs: Peg[] = [];
  const mk = (x: number, y: number): Peg => ({
    x, y, hit: false, orange: false, green: false, bomb: false, boss: false,
    armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1,
  });
  for (let row = 0; row < 20; row++) {
    const y = 75 + row * 21;
    const d = Math.abs(row - 9.5);
    const halfWidth = Math.max(20, Math.round(20 + d * 18));
    for (let x = cx - halfWidth; x <= cx + halfWidth; x += 22) {
      pegs.push(mk(Math.round(x), y));
    }
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, 285, 10, "#44aaff"),
      mkPlank(cx - 42, 285, 52, Math.PI / 5),
      mkPlank(cx + 42, 285, 52, -Math.PI / 5),
      mkArc(cx, 70, 120, Math.PI * 1.1, Math.PI * 1.9, "#44aaff"),
    ],
  };
}

function layout15(cx: number): TableauResult {
  // 🎯 Cible — 4 cercles concentriques + bullseye
  return {
    pegs: dedup([
      ...tCircle(cx, 275, 160, 26),
      ...tCircle(cx, 275, 115, 20),
      ...tCircle(cx, 275, 72, 13),
      ...tCircle(cx, 275, 36, 7),
    ]),
    decors: [
      mkBumper(cx, 275, 14, "#ff0000"),
      mkSpike(50, 130, 16, Math.PI * 0.25),
      mkSpike(430, 130, 16, Math.PI * 0.75),
      mkSpike(50, 420, 16, -Math.PI * 0.25),
      mkSpike(430, 420, 16, -Math.PI * 0.75),
    ],
  };
}

function layout16(cx: number): TableauResult {
  // ☯ Yin-Yang — cercle extérieur + diviseur en S + deux petits cercles
  return {
    pegs: dedup([
      ...tCircle(cx, 280, 140, 22),
      ...tArc(cx, 210, 70, -Math.PI / 2, Math.PI / 2, 10),
      ...tArc(cx, 350, 70, Math.PI / 2, Math.PI * 1.5, 10),
      ...tCircle(cx, 210, 28, 6),
      ...tCircle(cx, 350, 28, 6),
    ]),
    decors: [
      mkBumper(cx - 65, 280, 11, "#dddddd"),
      mkBumper(cx + 65, 280, 11, "#888888"),
      mkBumper(cx, 280, 9, "#ff8800"),
      mkArc(cx, 280, 145, Math.PI, Math.PI * 2, "#3399ff"),
    ],
  };
}

function layout17(cx: number): TableauResult {
  // 🐛 Chenille — chaîne de cercles serpentant + tête
  const segments: [number, number][] = [
    [155, 130], [315, 185], [155, 255], [315, 325], [155, 395], [315, 460],
  ];
  const pegs: Peg[] = [
    ...tCircle(155, 78, 35, 9),
    ...segments.flatMap(([sx, sy]) => tCircle(sx, sy, 42, 10)),
  ];
  for (let i = 0; i < segments.length - 1; i++) {
    const [sx, sy] = segments[i]!;
    const [ex, ey] = segments[i + 1]!;
    pegs.push(...tLine(sx, sy, ex, ey, 26));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      ...segments.map(([sx, sy]) => mkBumper(sx, sy, 11, "#44cc44")),
      mkBumper(155, 78, 12, "#66ff44"),
    ],
  };
}

function layout18(cx: number): TableauResult {
  // ⚡ Éclair pixel art + terrain électrisé
  const bolt = [
    "011110000",
    "011110000",
    "001111000",
    "001111000",
    "000011110",
    "000011110",
    "000001111",
    "000001111",
    "000000110",
  ];
  return {
    pegs: dedup([
      ...tPixelArt(bolt, 22, 24, cx - 88, 80),
      ...tHexGrid(28, 310, 15, 5, 28),
    ]),
    decors: [
      mkBumper(cx - 60, 360, 13, "#ffff00"),
      mkBumper(cx + 60, 360, 13, "#ffff00"),
      mkBumper(cx, 435, 15, "#ffcc00"),
      mkPlank(cx - 20, 265, 40, Math.PI / 4),
    ],
  };
}

function layout19(cx: number): TableauResult {
  // 🌈 Arc-en-ciel — 7 arcs de rayon décroissant depuis la base
  const radii = [190, 162, 135, 108, 82, 58, 38];
  const counts = [26, 22, 18, 14, 11, 8, 6];
  const pegs: Peg[] = [
    ...tHexGrid(28, 82, 15, 3, 30),
  ];
  for (let i = 0; i < radii.length; i++) {
    pegs.push(...tArc(cx, 490, radii[i]!, Math.PI, Math.PI * 2, counts[i]!));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx - 100, 400, 12, "#ff4444"),
      mkBumper(cx, 318, 12, "#44ff44"),
      mkBumper(cx + 100, 400, 12, "#4444ff"),
      mkArc(cx, 490, 210, Math.PI, Math.PI * 2, "#ff8800"),
    ],
  };
}

function layout20(cx: number): TableauResult {
  // 🌌 Galaxie — deux bras spiralés + champ d'étoiles
  const pegs: Peg[] = [];
  const mk = (x: number, y: number): Peg => ({
    x, y, hit: false, orange: false, green: false, bomb: false, boss: false,
    armorHits: 0, hitCooldown: 0, popping: false, popAlpha: 1, scale: 1,
  });
  for (let i = 0; i < 28; i++) {
    const t = i / 28;
    const a = t * Math.PI * 2 * 2;
    const r = 12 + t * 162;
    pegs.push(mk(cx + Math.cos(a) * r * 0.9, 270 + Math.sin(a) * r * 0.64));
    pegs.push(mk(cx + Math.cos(a + Math.PI) * r * 0.9, 270 + Math.sin(a + Math.PI) * r * 0.64));
  }
  const stars: [number, number][] = [
    [55, 92], [415, 88], [32, 235], [448, 280], [68, 420], [412, 432],
    [158, 78], [338, 82], [28, 158], [450, 168], [85, 475], [395, 470],
  ];
  for (const [sx, sy] of stars) {
    pegs.push(mk(sx, sy));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, 270, 16, "#ffcc00"),
      mkBumper(cx - 100, 195, 10, "#4499ff"),
      mkBumper(cx + 100, 345, 10, "#4499ff"),
      mkPlank(cx - 58, 175, 36, Math.PI / 6),
      mkPlank(cx + 58, 365, 36, Math.PI / 6),
    ],
  };
}

// ─── Main builder ──────────────────────────────────────────────────────────────

export function buildLevel(level: number, runState?: RunState): { pegs: Peg[]; decors: Decor[] } {
  const cx = W / 2;
  const layout = ((level - 1) % 20) + 1;
  const isBoss = isBossLevel(level);

  const builders = [layout1, layout2, layout3, layout4, layout5, layout6, layout7, layout8, layout9, layout10, layout11, layout12, layout13, layout14, layout15, layout16, layout17, layout18, layout19, layout20];
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
