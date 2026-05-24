import { W, PEG_R } from "./constants";
import type { Peg, GreenPowerupId } from "./types";
import type { RunState } from "./roguelite";
import { CLASSES, isBossLevel } from "./roguelite";

function makePeg(x: number, y: number): Peg {
  return {
    x, y, hit: false, orange: false, green: false,
    bomb: false, boss: false, armorHits: 0, hitCooldown: 0,
    popping: false, popAlpha: 1, scale: 1,
  };
}

// Grille pixel art — chaque '1' devient un peg
function pixelGrid(
  pixels: string[],
  cellW: number, cellH: number,
  originX: number, originY: number,
): Peg[] {
  const pegs: Peg[] = [];
  for (let row = 0; row < pixels.length; row++) {
    const line = pixels[row]!;
    for (let col = 0; col < line.length; col++) {
      if (line[col] === "1") {
        pegs.push(makePeg(originX + col * cellW, originY + row * cellH));
      }
    }
  }
  return pegs;
}

export function buildLevel(level: number, runState?: RunState): Peg[] {
  const pegs: Peg[] = [];
  const cx = W / 2;
  const layout = ((level - 1) % 10) + 1;
  const isBoss = isBossLevel(level);

  if (layout === 1) {
    // Cœur pixel art + grille dense autour
    const heart = [
      "0110011100",
      "1111111110",
      "1111111110",
      "0111111100",
      "0011111000",
      "0001110000",
      "0000100000",
    ];
    pegs.push(...pixelGrid(heart, 22, 22, cx - 110, 100));
    // rangées horizontales denses en bas
    for (let row = 0; row < 5; row++) {
      const y = 350 + row * 24;
      const offset = row % 2 === 0 ? 0 : 11;
      for (let x = 28 + offset; x < W - 20; x += 22) {
        pegs.push(makePeg(x, y));
      }
    }

  } else if (layout === 2) {
    // Diamant pixel + colonnes latérales denses
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
    pegs.push(...pixelGrid(diamond, 20, 20, cx - 90, 90));
    // Colonnes gauche/droite
    for (let y = 80; y < 490; y += 20) {
      pegs.push(makePeg(22, y));
      pegs.push(makePeg(W - 22, y));
    }
    for (let y = 90; y < 490; y += 20) {
      pegs.push(makePeg(42, y));
      pegs.push(makePeg(W - 42, y));
    }

  } else if (layout === 3) {
    // Étoile pixel art 8 branches
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
    pegs.push(...pixelGrid(star, 22, 22, cx - 110, 90));
    // Grille hexagonale en bas
    for (let row = 0; row < 6; row++) {
      const y = 310 + row * 22;
      const offset = row % 2 === 0 ? 0 : 11;
      for (let x = 24 + offset; x < W - 16; x += 22) {
        pegs.push(makePeg(x, y));
      }
    }

  } else if (layout === 4) {
    // Grille complète hexagonale très dense
    for (let row = 0; row < 16; row++) {
      const y = 80 + row * 27;
      const offset = row % 2 === 0 ? 0 : 13;
      for (let x = 24 + offset; x < W - 16; x += 26) {
        pegs.push(makePeg(x, y));
      }
    }

  } else if (layout === 5) {
    // Zigzag dense + barres horizontales
    for (let i = 0; i < 18; i++) {
      const y = 75 + i * 26;
      const x = i % 2 === 0
        ? 40 + (i * 12) % (W - 100)
        : W - 40 - (i * 12) % (W - 100);
      // cluster autour du point de zigzag
      for (let dx = -2; dx <= 2; dx++) {
        pegs.push(makePeg(x + dx * 20, y));
      }
    }
    // Barre centrale
    for (let x = 30; x < W - 20; x += 20) {
      pegs.push(makePeg(x, 260));
    }

  } else if (layout === 6) {
    // Spirale dense
    const turns = 3.2;
    const totalPegs = 42;
    for (let i = 0; i < totalPegs; i++) {
      const t = i / totalPegs;
      const a = t * Math.PI * 2 * turns;
      const r = 14 + t * 175;
      const px = cx + Math.cos(a) * r * 0.88;
      const py = 280 + Math.sin(a) * r * 0.62;
      pegs.push(makePeg(px, py));
    }
    // Coins remplis
    const corners = [
      [30, 90], [55, 75], [80, 90], [30, 110], [55, 95],
      [W-30, 90], [W-55, 75], [W-80, 90], [W-30, 110], [W-55, 95],
      [30, 440], [55, 460], [80, 445], [W-30, 440], [W-55, 460], [W-80, 445],
    ];
    for (const [bx, by] of corners) pegs.push(makePeg(bx!, by!));

  } else if (layout === 7) {
    // Croix + cercles concentriques denses
    // Barre horizontale
    for (let x = 30; x < W - 20; x += 18) pegs.push(makePeg(x, 260));
    // Barre verticale
    for (let y = 75; y < 490; y += 18) pegs.push(makePeg(cx, y));
    // Cercle extérieur
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      pegs.push(makePeg(cx + Math.cos(a) * 160, 270 + Math.sin(a) * 115));
    }
    // Cercle intérieur
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      pegs.push(makePeg(cx + Math.cos(a) * 85, 270 + Math.sin(a) * 62));
    }

  } else if (layout === 8) {
    // Vague sinusoïdale triple + colonne dense
    for (let x = 22; x < W - 14; x += 16) {
      const y1 = 140 + Math.sin(x * 0.028) * 55;
      const y2 = 240 + Math.sin(x * 0.028 + Math.PI * 0.66) * 55;
      const y3 = 340 + Math.sin(x * 0.028 + Math.PI * 1.33) * 55;
      pegs.push(makePeg(x, y1));
      pegs.push(makePeg(x, y2));
      pegs.push(makePeg(x, y3));
    }
    // murs latéraux très denses
    for (let y = 75; y < 490; y += 16) {
      pegs.push(makePeg(22, y));
      pegs.push(makePeg(W - 22, y));
    }

  } else if (layout === 9) {
    // Grille en damier — cases creuses + pegs denses
    const cellSize = 24;
    for (let row = 0; row < 17; row++) {
      for (let col = 0; col < 16; col++) {
        if ((row + col) % 2 === 0) {
          const x = 24 + col * cellSize;
          const y = 76 + row * cellSize;
          if (x < W - 12 && y < 490) pegs.push(makePeg(x, y));
        }
      }
    }

  } else {
    // layout 10 — "Labyrinthe" : couloirs avec murs de pegs
    const walls = [
      // Mur du haut
      ...Array.from({ length: 18 }, (_, i) => [28 + i * 24, 80] as [number, number]),
      // Mur intermédiaire gauche (avec gap au centre-droit)
      ...Array.from({ length: 8 }, (_, i) => [28 + i * 24, 175] as [number, number]),
      // Mur intermédiaire droit
      ...Array.from({ length: 7 }, (_, i) => [260 + i * 24, 175] as [number, number]),
      // Mur 3 gauche
      ...Array.from({ length: 6 }, (_, i) => [124 + i * 24, 270] as [number, number]),
      // Mur 3 droit
      ...Array.from({ length: 7 }, (_, i) => [28 + i * 24, 270] as [number, number]),
      // Mur 3 extrème droite
      ...Array.from({ length: 5 }, (_, i) => [320 + i * 24, 270] as [number, number]),
      // Mur 4
      ...Array.from({ length: 8 }, (_, i) => [180 + i * 24, 365] as [number, number]),
      // Mur bas
      ...Array.from({ length: 18 }, (_, i) => [28 + i * 24, 455] as [number, number]),
      // Colonnes verticales
      ...[80, 200, 300, 400].flatMap(x =>
        Array.from({ length: 4 }, (_, i) => [x, 100 + i * 24] as [number, number])
      ),
      ...[60, 160, 260, 360, 440].flatMap(x =>
        Array.from({ length: 3 }, (_, i) => [x, 290 + i * 24] as [number, number])
      ),
    ];
    for (const [wx, wy] of walls) {
      if (wx > 10 && wx < W - 10) pegs.push(makePeg(wx, wy));
    }
  }

  // Filtre les pegs trop proches entre eux (PEG_R*2.8 = safe distance)
  const filtered = pegs.filter((p, i) => {
    for (let j = 0; j < i; j++) {
      const d = Math.hypot(p.x - pegs[j]!.x, p.y - pegs[j]!.y);
      if (d < PEG_R * 2.8) return false;
    }
    return true;
  });

  const result = isBoss
    ? filtered.filter(p => Math.hypot(p.x - cx, p.y - 260) > 40)
    : filtered;

  if (isBoss) {
    const bossPeg: Peg = {
      x: cx, y: 260,
      hit: false, orange: false, green: false, bomb: false, boss: true,
      armorHits: 4, hitCooldown: 0,
      popping: false, popAlpha: 1, scale: 1,
    };
    result.push(bossPeg);
  }

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
    const bombCandidates = nonOrange.filter(i =>
      nonBoss[i] && !nonBoss[i]!.orange && !nonBoss[i]!.green
    );
    for (let i = 0; i < Math.min(bombCount, bombCandidates.length); i++) {
      const idx = bombCandidates[i];
      if (idx !== undefined && nonBoss[idx]) nonBoss[idx]!.bomb = true;
    }
  }

  if (level >= 5) {
    const armorCount = Math.min(5, 2 + Math.floor((level - 5) / 2));
    const armorCandidates = nonOrange.filter(i =>
      nonBoss[i] && !nonBoss[i]!.orange && !nonBoss[i]!.green && !nonBoss[i]!.bomb
    );
    for (let i = 0; i < Math.min(armorCount, armorCandidates.length); i++) {
      const idx = armorCandidates[i];
      if (idx !== undefined && nonBoss[idx]) nonBoss[idx]!.armorHits = 1;
    }
  }

  if (level >= 7) {
    const pairCount = 1 + Math.floor((level - 7) / 3);
    const warpCandidates = nonOrange.filter(i =>
      nonBoss[i] && !nonBoss[i]!.orange && !nonBoss[i]!.green
      && !nonBoss[i]!.bomb && nonBoss[i]!.armorHits === 0
    );
    for (let pair = 0; pair < Math.min(pairCount, Math.floor(warpCandidates.length / 2)); pair++) {
      const a = warpCandidates[pair * 2];
      const b = warpCandidates[pair * 2 + 1];
      if (a !== undefined && b !== undefined && nonBoss[a] && nonBoss[b]) {
        nonBoss[a]!.warpId = pair + 1;
        nonBoss[b]!.warpId = pair + 1;
      }
    }
  }

  return result;
}
