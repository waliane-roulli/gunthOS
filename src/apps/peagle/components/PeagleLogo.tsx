"use client";

// Vrai logo de jeu — pixel art eagle + PEAGLE 98 avec effets juicy.

import React from "react";
import { PG } from "../styles";

// ─── 5×5 bitmap font (éprouvée, toutes les lignes font 5 chars) ───────────────
const FONT7: Record<string, string[]> = {
  P: ["####.", "#...#", "####.", "#....", "#...."],
  E: ["#####", "#....", "####.", "#....", "#####"],
  A: [".###.", "#...#", "#####", "#...#", "#...#"],
  G: [".####", "#....", "#.###", "#...#", ".####"],
  L: ["#....", "#....", "#....", "#....", "#####"],
  "9": [".####", "#...#", ".####", "....#", ".###."],
  "8": [".###.", "#...#", ".###.", "#...#", ".###."],
  " ": [".....", ".....", ".....", ".....", "....."],
};

// ─── Eagle pixel art 9×9 ──────────────────────────────────────────────────────
const EAGLE_GRID: string[] = [
  "...www...",
  "..wbwbw..",
  "..wywyw..",
  "..www.y..",
  ".wbbbbbb.",
  "wwbbbbbww",
  ".wbbbbbw.",
  "...wbw...",
  "...ywy...",
];

const EAGLE_PALETTE: Record<string, string> = {
  w: "#f5f0e8",
  b: "#8b5e3c",
  y: "#f5c542",
};

// ─── PixelGrid renderer ───────────────────────────────────────────────────────
interface PixelGridProps {
  grid: string[];
  palette: Record<string, string>;
  cellSize: number;
  style?: React.CSSProperties;
}

function PixelGrid({ grid, palette, cellSize, style }: PixelGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        imageRendering: "pixelated",
        flexShrink: 0,
        ...style,
      }}
    >
      {grid.map((row, ri) =>
        row.split("").map((ch, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{
              width: cellSize,
              height: cellSize,
              background: ch === "." ? "transparent" : (palette[ch] ?? "transparent"),
            }}
          />
        ))
      )}
    </div>
  );
}

// ─── Couleurs rainbow pour chaque lettre ──────────────────────────────────────
const LETTER_FILLS = ["#ff6b35", "#ff9f00", "#ffd700", "#ff6b35", "#ff4400", "#ff8c00"];

// ─── Lettre individuelle avec bounce staggeré ─────────────────────────────────
function LogoLetter({ ch, fillColor, delay }: { ch: string; fillColor: string; delay: number }) {
  const grid = FONT7[ch] ?? FONT7[" "]!;
  const palette = { "#": fillColor };
  return (
    <div
      style={{
        display: "inline-block",
        animation: `pg-logo-letter-bounce 2s ease-in-out ${delay}s infinite`,
        filter: `drop-shadow(0 0 6px ${fillColor}dd) drop-shadow(0 0 14px ${fillColor}88)`,
      }}
    >
      <PixelGrid grid={grid} palette={palette} cellSize={5} />
    </div>
  );
}

// ─── Particules qui flottent (étoiles + pixels) ───────────────────────────────
const PARTICLES = [
  { x: 6,   y: 14, char: "★", color: PG.gold,   delay: 0,    dur: 1.8, size: 9  },
  { x: 88,  y: 10, char: "✦", color: PG.cyan,   delay: 0.6,  dur: 1.4, size: 7  },
  { x: 3,   y: 60, char: "◆", color: PG.orange, delay: 1.1,  dur: 1.6, size: 6  },
  { x: 93,  y: 55, char: "★", color: PG.gold,   delay: 0.3,  dur: 2.0, size: 8  },
  { x: 15,  y: 88, char: "✦", color: PG.cyan,   delay: 0.9,  dur: 1.2, size: 6  },
  { x: 80,  y: 84, char: "◆", color: PG.orange, delay: 1.4,  dur: 1.5, size: 7  },
  { x: 50,  y: 4,  char: "★", color: PG.gold,   delay: 0.5,  dur: 1.7, size: 8  },
  { x: 30,  y: 92, char: "✦", color: "#cc44ff", delay: 1.2,  dur: 1.3, size: 6  },
  { x: 68,  y: 90, char: "◆", color: "#cc44ff", delay: 0.2,  dur: 1.9, size: 7  },
];

// ─── Composant "98" avec effet shimmer ────────────────────────────────────────
function Badge98() {
  const grid9 = FONT7["9"]!;
  const grid8 = FONT7["8"]!;
  const palette = { "#": PG.cyan };
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        animation: "pg-badge98-pulse 1.6s ease-in-out infinite",
        filter: `drop-shadow(0 0 8px ${PG.cyan}cc) drop-shadow(0 0 20px ${PG.cyan}55)`,
      }}
    >
      <PixelGrid grid={grid9} palette={palette} cellSize={5} />
      <PixelGrid grid={grid8} palette={palette} cellSize={5} />
    </div>
  );
}

// ─── Logo principal ───────────────────────────────────────────────────────────
export function PeagleLogo() {
  const chars = "PEAGLE".split("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        userSelect: "none",
        position: "relative",
        padding: "8px 6px 4px",
      }}
    >
      {/* Particules flottantes */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            fontSize: p.size,
            lineHeight: 1,
            animation: `pg-particle-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
            pointerEvents: "none",
            zIndex: 0,
            textShadow: `0 0 6px ${p.color}`,
          }}
        >
          {p.char}
        </div>
      ))}

      {/* Eagle — bounce + glow doré pulsé */}
      <div
        style={{
          zIndex: 1,
          animation: "pg-eagle-hover 2.8s ease-in-out infinite",
          filter: "drop-shadow(0 0 8px #f5c54299) drop-shadow(0 0 20px #ff880055)",
        }}
      >
        <PixelGrid
          grid={EAGLE_GRID}
          palette={EAGLE_PALETTE}
          cellSize={8}
        />
      </div>

      {/* PEAGLE — lettres avec bounce staggeré */}
      <div
        style={{
          display: "flex",
          gap: 1,
          zIndex: 1,
        }}
      >
        {chars.map((ch, i) => (
          <LogoLetter
            key={i}
            ch={ch}
            fillColor={LETTER_FILLS[i % LETTER_FILLS.length]!}
            delay={i * 0.12}
          />
        ))}
      </div>

      {/* 98 badge cyan */}
      <div style={{ zIndex: 1 }}>
        <Badge98 />
      </div>
    </div>
  );
}
