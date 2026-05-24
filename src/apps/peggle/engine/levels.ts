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

export function buildLevel(level: number, runState?: RunState): Peg[] {
  const pegs: Peg[] = [];
  const cx = W / 2;
  const layout = ((level - 1) % 8) + 1;
  const isBoss = isBossLevel(level);

  if (layout === 1) {
    const ringR = 90;
    const ringCount = 14;
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      pegs.push(makePeg(cx + Math.cos(a) * ringR, 200 + Math.sin(a) * ringR * 0.7));
    }
    const innerR = 44;
    const innerCount = 7;
    for (let i = 0; i < innerCount; i++) {
      const a = (i / innerCount) * Math.PI * 2 + Math.PI / innerCount;
      pegs.push(makePeg(cx + Math.cos(a) * innerR, 200 + Math.sin(a) * innerR * 0.7));
    }
    for (let i = 0; i < 5; i++) {
      pegs.push(makePeg(60 + i * 34, 110 + i * 30));
      pegs.push(makePeg(W - 60 - i * 34, 110 + i * 30));
    }
    const bottomPositions = [
      [80, 390], [150, 420], [240, 400], [330, 420], [400, 390],
      [120, 450], [200, 465], [280, 455], [360, 450],
    ];
    for (const [bx, by] of bottomPositions) pegs.push(makePeg(bx!, by!));
    const topCorners = [
      [50, 130], [90, 115], [130, 130],
      [W - 50, 130], [W - 90, 115], [W - 130, 130],
    ];
    for (const [tx, ty] of topCorners) pegs.push(makePeg(tx!, ty!));

  } else if (layout === 2) {
    for (let row = 0; row < 7; row++) {
      const count = row + 2;
      const startX = cx - (count - 1) * 28 / 2;
      for (let col = 0; col < count; col++) {
        pegs.push(makePeg(startX + col * 28, 100 + row * 38));
      }
    }
    for (let i = 0; i < 5; i++) {
      pegs.push(makePeg(40, 140 + i * 60));
      pegs.push(makePeg(W - 40, 140 + i * 60));
    }
    const archR = 120;
    const archCount = 9;
    for (let i = 0; i < archCount; i++) {
      const a = Math.PI + (i / (archCount - 1)) * Math.PI;
      pegs.push(makePeg(cx + Math.cos(a) * archR, 430 + Math.sin(a) * 60));
    }

  } else if (layout === 3) {
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 5;
      const r = 20 + i * 4.5;
      pegs.push(makePeg(cx + Math.cos(a) * r * 0.85, 240 + Math.sin(a) * r * 0.62));
    }
    const corners = [
      [55, 95], [115, 80], [170, 100], [55, 155], [115, 140],
      [W - 55, 95], [W - 115, 80], [W - 170, 100], [W - 55, 155], [W - 115, 140],
      [80, 420], [160, 440], [240, 415], [320, 440], [400, 420],
    ];
    for (const [cx2, cy2] of corners) pegs.push(makePeg(cx2!, cy2!));

  } else if (layout === 4) {
    const armLen = 5;
    const spacing = 36;
    for (let i = -armLen; i <= armLen; i++) {
      pegs.push(makePeg(cx + i * spacing, 260));
      pegs.push(makePeg(cx, 260 + i * spacing * 0.65));
    }
    for (let row = 0; row < 6; row++) {
      pegs.push(makePeg(55, 130 + row * 55));
      pegs.push(makePeg(W - 55, 130 + row * 55));
    }
    for (let i = 0; i < 5; i++) {
      pegs.push(makePeg(100 + i * 70, 90));
    }

  } else if (layout === 5) {
    const topArcR = 130;
    const botArcR = 130;
    for (let i = 0; i < 11; i++) {
      const a = (i / 10) * Math.PI;
      pegs.push(makePeg(cx + Math.cos(a) * topArcR, 160 + Math.sin(a) * 55));
    }
    for (let i = 0; i < 11; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      pegs.push(makePeg(cx + Math.cos(a) * botArcR, 360 + Math.sin(a) * 55));
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      pegs.push(makePeg(cx + Math.cos(a) * 48, 260 + Math.sin(a) * 35));
    }
    for (let r = 0; r < 4; r++) {
      pegs.push(makePeg(50, 180 + r * 50));
      pegs.push(makePeg(W - 50, 180 + r * 50));
    }

  } else if (layout === 6) {
    for (let row = 0; row < 8; row++) {
      const cols = 7;
      const offsetX = row % 2 === 0 ? 0 : 30;
      for (let col = 0; col < cols; col++) {
        pegs.push(makePeg(70 + offsetX + col * 52, 95 + row * 50));
      }
    }

  } else if (layout === 7) {
    const starR1 = 130;
    const starR2 = 60;
    const points = 6;
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? starR1 : starR2;
      pegs.push(makePeg(cx + Math.cos(a) * r, 250 + Math.sin(a) * r * 0.8));
    }
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      pegs.push(makePeg(cx + Math.cos(a) * 185, 250 + Math.sin(a) * 120));
    }
    [[cx - 80, 100], [cx, 90], [cx + 80, 100], [cx - 80, 410], [cx, 420], [cx + 80, 410]].forEach(([px, py]) =>
      pegs.push(makePeg(px!, py!))
    );

  } else {
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      const y = 110 + r * 65;
      const goLeft = r % 2 === 0;
      const holeLeft = goLeft ? Math.floor(W * 0.55) : Math.floor(W * 0.2);
      for (let x = 40; x < W - 40; x += 34) {
        const distToHole = Math.abs(x - holeLeft);
        if (distToHole > 38) pegs.push(makePeg(x, y));
      }
    }
    for (let i = 0; i < 4; i++) {
      pegs.push(makePeg(22, 130 + i * 80));
      pegs.push(makePeg(W - 22, 130 + i * 80));
    }
  }

  const filtered = pegs.filter((p, i) => {
    for (let j = 0; j < i; j++) {
      const d = Math.hypot(p.x - pegs[j]!.x, p.y - pegs[j]!.y);
      if (d < PEG_R * 3) return false;
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

  const orangePct = Math.min(0.42, 0.28 + (level - 1) * 0.04);
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
