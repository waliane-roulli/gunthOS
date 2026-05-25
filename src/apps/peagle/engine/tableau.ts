import type { Peg, Decor, DecorBumper, DecorPlank, DecorArc, DecorSpike } from "./types";
import { PEG_R } from "./constants";

// ─── Peg factory ─────────────────────────────────────────────────────────────

function makePeg(x: number, y: number): Peg {
  return {
    x, y,
    hit: false, orange: false, green: false,
    bomb: false, boss: false, armorHits: 0, hitCooldown: 0,
    popping: false, popAlpha: 1, scale: 1,
  };
}

type PegOverride = Partial<Pick<Peg, "orange" | "green" | "bomb">>;

function applyOv(p: Peg, ov?: PegOverride): Peg {
  return ov ? { ...p, ...ov } : p;
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Pegs equally spaced along a straight line from (x1,y1) to (x2,y2). */
export function tLine(
  x1: number, y1: number, x2: number, y2: number,
  spacing: number, ov?: PegOverride,
): Peg[] {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const count = Math.max(2, Math.round(dist / spacing));
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    return applyOv(makePeg(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t), ov);
  });
}

/** Pegs along an arc (partial circle). */
export function tArc(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number, count: number,
  ov?: PegOverride,
): Peg[] {
  return Array.from({ length: count }, (_, i) => {
    const a = count === 1 ? startAngle : startAngle + (endAngle - startAngle) * (i / (count - 1));
    return applyOv(makePeg(cx + Math.cos(a) * r, cy + Math.sin(a) * r), ov);
  });
}

/** Full circle of pegs. */
export function tCircle(
  cx: number, cy: number, r: number, count: number,
  ov?: PegOverride,
): Peg[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return applyOv(makePeg(cx + Math.cos(a) * r, cy + Math.sin(a) * r), ov);
  });
}

/** Hex-offset grid (odd rows shifted by half spacing). */
export function tHexGrid(
  originX: number, originY: number,
  cols: number, rows: number, spacing: number,
  ov?: PegOverride,
): Peg[] {
  const pegs: Peg[] = [];
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : spacing * 0.5;
    for (let col = 0; col < cols; col++) {
      pegs.push(applyOv(makePeg(
        originX + col * spacing + offset,
        originY + row * spacing * 0.866,
      ), ov));
    }
  }
  return pegs;
}

/** Rectangular grid. */
export function tGrid(
  originX: number, originY: number,
  cols: number, rows: number,
  spacingX: number, spacingY: number,
  ov?: PegOverride,
): Peg[] {
  const pegs: Peg[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pegs.push(applyOv(makePeg(originX + col * spacingX, originY + row * spacingY), ov));
    }
  }
  return pegs;
}

/** Pixel-art template: '1' = peg, other chars = empty. */
export function tPixelArt(
  pixels: string[],
  cellW: number, cellH: number,
  originX: number, originY: number,
  ov?: PegOverride,
): Peg[] {
  const pegs: Peg[] = [];
  for (let row = 0; row < pixels.length; row++) {
    const line = pixels[row]!;
    for (let col = 0; col < line.length; col++) {
      if (line[col] === "1") {
        pegs.push(applyOv(makePeg(originX + col * cellW, originY + row * cellH), ov));
      }
    }
  }
  return pegs;
}

/** Remove pegs that are too close to a previously placed peg (deduplication). */
export function dedup(pegs: Peg[], minDist = PEG_R * 2.8): Peg[] {
  return pegs.filter((p, i) => {
    for (let j = 0; j < i; j++) {
      if (Math.hypot(p.x - pegs[j]!.x, p.y - pegs[j]!.y) < minDist) return false;
    }
    return true;
  });
}

// ─── Decor factories ──────────────────────────────────────────────────────────

/** Round bumper — reflects the ball with a boost, lights up on hit. */
export function mkBumper(x: number, y: number, r = 12, color = "#ff5500"): DecorBumper {
  return { kind: "bumper", x, y, r, flashFrames: 0, color };
}

/** Rectangular plank at a given angle (radians). len = half-length. */
export function mkPlank(
  x: number, y: number,
  len: number, angle: number,
  color = "#cc44ff",
): DecorPlank {
  return { kind: "plank", x, y, len, thickness: 5, angle, flashFrames: 0, color };
}

/**
 * Curved arc wall — ball bounces off inner (concave) or outer (convex) surface.
 * startAngle / endAngle in radians (standard math convention: 0=right, PI/2=down in canvas).
 */
export function mkArc(
  x: number, y: number, r: number,
  startAngle: number, endAngle: number,
  color = "#cc44ff",
): DecorArc {
  return { kind: "arc", x, y, r, startAngle, endAngle, thickness: 8, flashFrames: 0, color };
}

/** Triangular spike — wedge deflector. angle = direction the tip points (radians). */
export function mkSpike(
  x: number, y: number,
  size: number, angle: number,
  color = "#cc44ff",
): DecorSpike {
  return { kind: "spike", x, y, size, angle, flashFrames: 0, color };
}

// ─── Tableau result ───────────────────────────────────────────────────────────

export interface TableauResult {
  pegs: Peg[];
  decors: Decor[];
}
