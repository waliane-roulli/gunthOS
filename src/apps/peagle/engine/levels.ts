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
