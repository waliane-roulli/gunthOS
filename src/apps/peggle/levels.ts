import { W, PEG_R } from "./constants";
import type { Peg } from "./types";

function makePeg(x: number, y: number): Peg {
  return { x, y, hit: false, orange: false, green: false, popping: false, popAlpha: 1, scale: 1 };
}

export function buildLevel(level: number): Peg[] {
  const pegs: Peg[] = [];
  const cx = W / 2;
  const layout = ((level - 1) % 3) + 1;

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

  } else {
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
  }

  const filtered = pegs.filter((p, i) => {
    for (let j = 0; j < i; j++) {
      const d = Math.hypot(p.x - pegs[j]!.x, p.y - pegs[j]!.y);
      if (d < PEG_R * 3) return false;
    }
    return true;
  });

  const orangePct = Math.min(0.42, 0.28 + (level - 1) * 0.04);
  const orangeCount = Math.floor(filtered.length * orangePct);
  const shuffled = [...Array(filtered.length).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < orangeCount; i++) {
    const idx = shuffled[i];
    if (idx !== undefined && filtered[idx]) filtered[idx]!.orange = true;
  }

  const nonOrange = shuffled.filter(i => filtered[i] && !filtered[i]!.orange);
  for (let i = 0; i < 5; i++) {
    const idx = nonOrange[i];
    if (idx !== undefined && filtered[idx]) filtered[idx]!.green = true;
  }

  return filtered;
}
