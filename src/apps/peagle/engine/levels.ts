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
    x: cx, y: 320,
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
      ...tPixelArt(face, 26, 24, cx - 104, 108),
      ...tHexGrid(24, 367, 17, 5, 26),
    ]),
    decors: [
      mkBumper(cx - 50, 516, 13, "#cc44ff"),
      mkBumper(cx + 50, 516, 13, "#cc44ff"),
      mkBumper(cx, 566, 15, "#ff44ff"),
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
      ...tPixelArt(invader, 24, 22, cx - 96, 105),
      ...tHexGrid(28, 357, 15, 6, 28),
    ]),
    decors: [
      mkBumper(70, 449, 14, "#cc44ff"),
      mkBumper(410, 449, 14, "#cc44ff"),
      mkBumper(cx, 560, 13, "#ff44ff"),
      mkPlank(cx - 90, 322, 48, Math.PI / 4),
      mkPlank(cx + 90, 322, 48, -Math.PI / 4),
    ],
  };
}

function layout3(cx: number): TableauResult {
  // 🟡 Pac-Man + ligne de points + terrain + bumpers fantômes
  const pacBody = tArc(150, 246, 80, 0.45, Math.PI * 2 - 0.45, 20);
  const dots = tLine(242, 246, 450, 246, 28);
  const field = tHexGrid(28, 381, 16, 5, 27);
  return {
    pegs: dedup([...pacBody, ...dots, ...field]),
    decors: [
      mkBumper(385, 191, 11, "#cc44ff"),
      mkBumper(420, 166, 9, "#ff44ff"),
      mkBumper(355, 197, 10, "#cc44ff"),
      mkArc(cx, 603, 95, Math.PI, 0, "#cc44ff"),
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
    const y = 98 + i * 22;
    const x1 = cx + Math.cos(i * 0.56) * 115;
    const x2 = cx - Math.cos(i * 0.56) * 115;
    pegs.push(mk(x1, y), mk(x2, y));
    if (i % 3 === 1) pegs.push(...tLine(x1, y, x2, y, 30));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, 246, 11, "#cc44ff"),
      mkBumper(cx, 455, 11, "#cc44ff"),
      mkPlank(cx - 130, 135, 30, 0.4),
      mkPlank(cx + 130, 135, 30, -0.4),
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
    const y = 108 + row * spacing;
    const count = row + 1;
    for (let col = 0; col < count; col++) {
      pegs.push(mk(cx - (count - 1) * spacing * 0.5 + col * spacing, y));
    }
  }
  pegs.push(...tHexGrid(30, 486, 13, 3, 31));
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(78, 326, 15, "#ff44ff"),
      mkBumper(402, 326, 15, "#cc44ff"),
      mkBumper(cx, 418, 15, "#ff44ff"),
      mkSpike(cx - 40, 470, 18, Math.PI / 2),
      mkSpike(cx + 40, 470, 18, Math.PI / 2),
    ],
  };
}

function layout6(cx: number): TableauResult {
  // 🦋 Papillon — deux ailes en arc symétriques + corps central
  return {
    pegs: dedup([
      ...tArc(cx - 80, 258, 130, Math.PI * 0.52, Math.PI * 1.9, 20),
      ...tArc(cx + 80, 258, 130, -Math.PI * 0.9, Math.PI * 0.48, 20),
      ...tArc(cx - 70, 443, 85, Math.PI * 0.6, Math.PI * 1.85, 14),
      ...tArc(cx + 70, 443, 85, -Math.PI * 0.85, Math.PI * 0.4, 14),
      ...tLine(cx, 123, cx, 566, 22),
    ]),
    decors: [
      mkBumper(cx - 80, 258, 14, "#cc44ff"),
      mkBumper(cx + 80, 258, 14, "#cc44ff"),
      mkBumper(cx - 70, 443, 11, "#ff44ff"),
      mkBumper(cx + 70, 443, 11, "#ff44ff"),
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
    const y = 98 + row * 27;
    const halfSpread = Math.max(18, 200 - row * 9);
    const step = Math.max(18, 30 - row);
    for (let x = cx - halfSpread; x <= cx + halfSpread; x += step) {
      pegs.push(mk(Math.round(x), y));
    }
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkArc(cx, 92, 205, Math.PI, 0, "#cc44ff"),
      mkBumper(cx, 566, 17, "#ff44ff"),
      mkPlank(cx - 65, 480, 42, 0.62),
      mkPlank(cx + 65, 480, 42, -0.62),
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
      ...tPixelArt(cactus, 26, 24, cx - 100, 98),
      ...tHexGrid(26, 406, 16, 5, 28),
    ]),
    decors: [
      mkSpike(72, 283, 18, 0),
      mkSpike(408, 283, 18, Math.PI),
      mkBumper(cx + 148, 207, 11, "#cc44ff"),
      mkBumper(cx - 100, 372, 11, "#cc44ff"),
      mkArc(cx, 609, 80, Math.PI, 0, "#cc44ff"),
    ],
  };
}

function layout9(cx: number): TableauResult {
  // 🎆 Feu d'artifice — 12 rayons radiaux depuis le centre
  const pegs: Peg[] = [];
  const cy = 310;
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const ex = Math.max(22, Math.min(W - 22, cx + Math.cos(angle) * 178));
    const ey = Math.max(101, Math.min(597, cy + Math.sin(angle) * 190));
    pegs.push(...tLine(cx, cy, ex, ey, 28));
  }
  pegs.push(...tCircle(cx, cy, 72, 16));
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, cy, 16, "#cc44ff"),
      mkBumper(cx - 82, cy - 76, 10, "#cc44ff"),
      mkBumper(cx + 82, cy - 76, 10, "#cc44ff"),
      mkBumper(cx - 82, cy + 76, 10, "#cc44ff"),
      mkBumper(cx + 82, cy + 76, 10, "#cc44ff"),
    ],
  };
}

function layout10(cx: number): TableauResult {
  // 🎉 Délire de bumpers — chaos total façon flipper
  return {
    pegs: dedup([
      ...tCircle(cx, 228, 105, 16),
      ...tCircle(cx, 228, 52, 9),
      ...tCircle(cx, 437, 85, 13),
      ...tCircle(cx, 437, 42, 7),
    ]),
    decors: [
      mkBumper(75,  157, 15, "#cc44ff"),
      mkBumper(405, 157, 15, "#cc44ff"),
      mkBumper(55,  344, 13, "#ff44ff"),
      mkBumper(425, 344, 13, "#ff44ff"),
      mkBumper(cx - 105, 252, 12, "#cc44ff"),
      mkBumper(cx + 105, 252, 12, "#cc44ff"),
      mkBumper(78,  523, 14, "#cc44ff"),
      mkBumper(402, 523, 14, "#cc44ff"),
      mkBumper(cx - 58, 461, 12, "#cc44ff"),
      mkBumper(cx + 58, 461, 12, "#cc44ff"),
      mkBumper(cx, 566, 16, "#ff44ff"),
      mkArc(cx, 634, 150, Math.PI * 1.1, Math.PI * 1.9, "#cc44ff"),
      mkArc(cx, 117, 105, 0.1, Math.PI - 0.1, "#cc44ff"),
      mkPlank(cx - 82, 359, 62, Math.PI / 4),
      mkPlank(cx + 82, 359, 62, -Math.PI / 4),
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
      ...tPixelArt(skull, 24, 22, cx - 96, 108),
      ...tHexGrid(26, 369, 16, 5, 28),
    ]),
    decors: [
      mkBumper(cx - 72, 465, 13, "#cc44ff"),
      mkBumper(cx + 72, 465, 13, "#cc44ff"),
      mkBumper(cx, 560, 15, "#9933cc"),
      mkArc(cx, 108, 105, 0.2, Math.PI - 0.2, "#cc44ff"),
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
      ...tPixelArt(shroom, 24, 22, cx - 96, 105),
      ...tHexGrid(28, 381, 15, 5, 28),
    ]),
    decors: [
      mkBumper(cx - 90, 437, 12, "#cc44ff"),
      mkBumper(cx + 90, 437, 12, "#cc44ff"),
      mkBumper(cx, 566, 15, "#ff44ff"),
      mkSpike(50, 197, 16, 0),
      mkSpike(430, 197, 16, Math.PI),
    ],
  };
}

function layout13(cx: number): TableauResult {
  // ⚓ Ancre — anneau + mât + traverse + courbe du bas + flukes
  return {
    pegs: dedup([
      ...tCircle(cx, 157, 28, 10),
      ...tLine(cx, 123, cx, 510, 22),
      ...tLine(cx - 90, 182, cx + 90, 182, 22),
      ...tArc(cx, 480, 78, Math.PI, Math.PI * 2, 13),
      ...tLine(cx - 78, 480, cx - 58, 418, 18),
      ...tLine(cx + 78, 480, cx + 58, 418, 18),
    ]),
    decors: [
      mkBumper(cx - 90, 182, 10, "#cc44ff"),
      mkBumper(cx + 90, 182, 10, "#cc44ff"),
      mkBumper(cx, 480, 12, "#9933cc"),
      mkBumper(cx - 58, 418, 9, "#ff44ff"),
      mkBumper(cx + 58, 418, 9, "#ff44ff"),
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
    const y = 92 + row * 26;
    const d = Math.abs(row - 9.5);
    const halfWidth = Math.max(20, Math.round(20 + d * 18));
    for (let x = cx - halfWidth; x <= cx + halfWidth; x += 22) {
      pegs.push(mk(Math.round(x), y));
    }
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, 351, 10, "#cc44ff"),
      mkPlank(cx - 42, 351, 52, Math.PI / 5),
      mkPlank(cx + 42, 351, 52, -Math.PI / 5),
      mkArc(cx, 86, 120, Math.PI * 1.1, Math.PI * 1.9, "#cc44ff"),
    ],
  };
}

function layout15(cx: number): TableauResult {
  // 🎯 Cible — 4 cercles concentriques + bullseye
  return {
    pegs: dedup([
      ...tCircle(cx, 338, 160, 26),
      ...tCircle(cx, 338, 115, 20),
      ...tCircle(cx, 338, 72, 13),
      ...tCircle(cx, 338, 36, 7),
    ]),
    decors: [
      mkBumper(cx, 338, 14, "#cc44ff"),
      mkSpike(50, 160, 16, Math.PI * 0.25),
      mkSpike(430, 160, 16, Math.PI * 0.75),
      mkSpike(50, 517, 16, -Math.PI * 0.25),
      mkSpike(430, 517, 16, -Math.PI * 0.75),
    ],
  };
}

function layout16(cx: number): TableauResult {
  // ☯ Yin-Yang — cercle extérieur + diviseur en S + deux petits cercles
  return {
    pegs: dedup([
      ...tCircle(cx, 344, 140, 22),
      ...tArc(cx, 258, 70, -Math.PI / 2, Math.PI / 2, 10),
      ...tArc(cx, 430, 70, Math.PI / 2, Math.PI * 1.5, 10),
      ...tCircle(cx, 258, 28, 6),
      ...tCircle(cx, 430, 28, 6),
    ]),
    decors: [
      mkBumper(cx - 65, 344, 11, "#cc44ff"),
      mkBumper(cx + 65, 344, 11, "#9933cc"),
      mkBumper(cx, 344, 9, "#ff44ff"),
      mkArc(cx, 344, 145, Math.PI, Math.PI * 2, "#cc44ff"),
    ],
  };
}

function layout17(cx: number): TableauResult {
  // 🐛 Chenille — chaîne de cercles serpentant + tête
  const segments: [number, number][] = [
    [155, 160], [315, 228], [155, 314], [315, 400], [155, 486], [315, 566],
  ];
  const pegs: Peg[] = [
    ...tCircle(155, 96, 35, 9),
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
      ...segments.map(([sx, sy]) => mkBumper(sx, sy, 11, "#cc44ff")),
      mkBumper(155, 96, 12, "#ff44ff"),
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
      ...tPixelArt(bolt, 22, 24, cx - 88, 98),
      ...tHexGrid(28, 381, 15, 5, 28),
    ]),
    decors: [
      mkBumper(cx - 60, 443, 13, "#cc44ff"),
      mkBumper(cx + 60, 443, 13, "#cc44ff"),
      mkBumper(cx, 535, 15, "#cc44ff"),
      mkPlank(cx - 20, 326, 40, Math.PI / 4),
    ],
  };
}

function layout19(cx: number): TableauResult {
  // 🌈 Arc-en-ciel — 7 arcs de rayon décroissant depuis la base
  const radii = [190, 162, 135, 108, 82, 58, 38];
  const counts = [26, 22, 18, 14, 11, 8, 6];
  const pegs: Peg[] = [
    ...tHexGrid(28, 101, 15, 3, 30),
  ];
  for (let i = 0; i < radii.length; i++) {
    pegs.push(...tArc(cx, 603, radii[i]!, Math.PI, Math.PI * 2, counts[i]!));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx - 100, 492, 12, "#cc44ff"),
      mkBumper(cx, 391, 12, "#cc44ff"),
      mkBumper(cx + 100, 492, 12, "#ff44ff"),
      mkArc(cx, 603, 210, Math.PI, Math.PI * 2, "#cc44ff"),
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
    pegs.push(mk(cx + Math.cos(a) * r * 0.9, 332 + Math.sin(a) * r * 0.64));
    pegs.push(mk(cx + Math.cos(a + Math.PI) * r * 0.9, 332 + Math.sin(a + Math.PI) * r * 0.64));
  }
  const stars: [number, number][] = [
    [55, 113], [415, 108], [32, 289], [448, 344], [68, 517], [412, 532],
    [158, 96], [338, 101], [28, 194], [450, 207], [85, 585], [395, 578],
  ];
  for (const [sx, sy] of stars) {
    pegs.push(mk(sx, sy));
  }
  return {
    pegs: dedup(pegs),
    decors: [
      mkBumper(cx, 332, 16, "#cc44ff"),
      mkBumper(cx - 100, 240, 10, "#ff44ff"),
      mkBumper(cx + 100, 424, 10, "#ff44ff"),
      mkPlank(cx - 58, 215, 36, Math.PI / 6),
      mkPlank(cx + 58, 449, 36, Math.PI / 6),
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
  const deduped = dedup(rawPegs, PEG_R * 2.8);

  // Remove pegs that overlap non-poppable decors
  const filtered = deduped.filter(p => {
    for (const d of decors) {
      if (d.kind === "bumper" && Math.hypot(p.x - d.x, p.y - d.y) < d.r + PEG_R + 4) return false;
      if (d.kind === "spike" && Math.hypot(p.x - d.x, p.y - d.y) < d.size * 0.8 + PEG_R) return false;
      if (d.kind === "plank") {
        // project peg onto plank axis, check distance to segment
        const cos = Math.cos(d.angle), sin = Math.sin(d.angle);
        const dx = p.x - d.x, dy = p.y - d.y;
        const along = dx * cos + dy * sin;
        const perp = Math.abs(-dx * sin + dy * cos);
        if (Math.abs(along) <= d.len + PEG_R && perp < d.thickness + PEG_R + 3) return false;
      }
      if (d.kind === "arc") {
        // distance from peg to arc curve
        const dist = Math.hypot(p.x - d.x, p.y - d.y);
        if (Math.abs(dist - d.r) < d.thickness + PEG_R + 3) {
          // check angle is within arc span
          const a = Math.atan2(p.y - d.y, p.x - d.x);
          const start = d.startAngle % (Math.PI * 2);
          const end = d.endAngle % (Math.PI * 2);
          const norm = ((a - start) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const span = ((end - start) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          if (norm <= span) return false;
        }
      }
    }
    return true;
  });

  // Clear boss area + add boss peg
  const result = isBoss
    ? filtered.filter(p => Math.hypot(p.x - cx, p.y - 320) > 40)
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
