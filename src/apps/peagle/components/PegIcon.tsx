"use client";

// Pixel art icons for Peagle 98 — pure CSS, no assets, no emoji.
// Each icon is a 5×5 or 7×7 grid of colored cells.
// Usage: <PegIcon id="canonnier" size={24} />

import React from "react";

type PegIconId =
  // Peagle mascot
  | "eagle"
  | "eagle_large"
  // Classes (abstract symbols)
  | "canonnier" | "alchimiste" | "sniper"
  // Pélican skins (5 designs)
  | "pelican_1" | "pelican_2" | "pelican_3" | "pelican_4" | "pelican_5"
  // Corbeau skins (5 designs)
  | "corbeau_1" | "corbeau_2" | "corbeau_3" | "corbeau_4" | "corbeau_5"
  // Faucon skins (5 designs)
  | "faucon_1" | "faucon_2" | "faucon_3" | "faucon_4" | "faucon_5"
  // Green powerups
  | "multiball" | "spooky" | "extraball" | "magnet"
  // Upgrades
  | "heavy_ball" | "ghost_ball" | "combo_hungry"
  | "extra_ball" | "recovery" | "bigger_ball" | "turbo_bomb"
  | "fever_forever" | "chain_master" | "lucky_spin" | "iron_will"
  // Relics
  | "boomerang" | "scorpion" | "blessed_cursor" | "trophy" | "phoenix" | "cursed_luck"
  // UI
  | "gamepad" | "victory" | "skull" | "boss" | "ball_cat" | "score_cat" | "utility_cat";

// Pixel grid: each char maps to a color key. "." = transparent.
// Colors are resolved per-icon via the `palette` map.
interface IconDef {
  grid: string[];    // rows of chars (same length each)
  palette: Record<string, string>;
}

const ICONS: Record<PegIconId, IconDef> = {
  // ─── Peagle mascot ────────────────────────────────────────────────────────
  eagle: {
    // Cute pixel eagle — 9×9, white head, brown body, yellow beak+feet
    grid: [
      "...www...",
      "..wbwbw..",
      "..wywyw..",
      "..www.y..",
      ".wbbbbbb.",
      "wwbbbbbww",
      ".wbbbbbw.",
      "...wbw...",
      "...ywy...",
    ],
    palette: {
      w: "#f5f0e8",
      b: "#8b5e3c",
      y: "#f5c542",
    },
  },

  // ─── Large menu eagle (16×16) ─────────────────────────────────────────────
  eagle_large: {
    grid: [
      "......wwww......",
      "....wwwwwwww....",
      "...wwbbwwbbww...",
      "...wwbbwwbbww...",
      "...wwwwwwyyww...",
      "....wwwwwwww....",
      "..bbwwwwwwwwbb..",
      ".bbbbbwwwwbbbbb.",
      "bbbbbbbbbbbbbbbb",
      ".bbbbbbbbbbbbbbb",
      "..bbbbbbbbbbbb..",
      "....bbbbbbbb....",
      "....wwbbbbww....",
      "....wwwbbwww....",
      ".....yywwyy.....",
      ".....yy..yy.....",
    ],
    palette: {
      w: "#f5f0e8",
      b: "#8b5e3c",
      y: "#f5c542",
    },
  },

  // ─── Classes ──────────────────────────────────────────────────────────────
  canonnier: {
    // Cannon barrel pointing right
    grid: [
      ".....",
      ".aaa.",
      "aabba",
      ".aaa.",
      ".....",
    ],
    palette: { a: "#4488ff", b: "#aaccff" },
  },
  alchimiste: {
    // Flask / potion
    grid: [
      ".aaa.",
      ".aaa.",
      "abbba",
      "abbba",
      ".bbb.",
    ],
    palette: { a: "#cc44ff", b: "#ee88ff" },
  },
  sniper: {
    // Crosshair / scope
    grid: [
      ".a.a.",
      "a...a",
      "..b..",
      "a...a",
      ".a.a.",
    ],
    palette: { a: "#44ffaa", b: "#ffffff" },
  },

  // ─── Pélican skins (5 designs, 9×9) ──────────────────────────────────────

  pelican_1: {
    // Pélican classique — grosse poche sous le bec, ailes déployées
    grid: [
      "...www...",
      "..wbbw...",
      ".wbbbbw..",
      "wwbbbbwww",
      ".wbbbbw..",
      "..wyyyw..",
      "..wywyw..",
      "...www...",
      "...y.y...",
    ],
    palette: { w: "#f0ece0", b: "#d4c4a0", y: "#f5c542" },
  },

  pelican_2: {
    // Pélican tropical — bec long orange, ventre blanc, ailes bleues
    grid: [
      "....www..",
      "...wbbww.",
      "..wbbbba.",
      ".wbbbbba.",
      "wwbbbbwa.",
      ".wbbbw...",
      "..wyyw...",
      "...www...",
      "...y.y...",
    ],
    palette: { w: "#e8f4ff", b: "#c8e0ff", a: "#ff7722", y: "#ffdd44" },
  },

  pelican_3: {
    // Pélican rose — espèce flamant-pélican, bec recourbé
    grid: [
      "...www...",
      "..wpppw..",
      ".wppppw..",
      "wwppppww.",
      ".wppppw..",
      "..wppw...",
      "..wnyw...",
      "...www...",
      "...y.y...",
    ],
    palette: { w: "#ffe8f0", p: "#ffaacc", n: "#ff6688", y: "#ffdd44" },
  },

  pelican_4: {
    // Pélican brun — teintes terreuses, gros bec pointe vers bas
    grid: [
      "...www...",
      "..wbbw...",
      ".wbbbbw..",
      "wwbbbbww.",
      ".wbbbbw..",
      "..wddw...",
      "..wdyw...",
      "...wdw...",
      "...ydy...",
    ],
    palette: { w: "#c8a878", b: "#a07848", d: "#884422", y: "#f5c542" },
  },

  pelican_5: {
    // Pélican doré — version épique, plumes or, bec vermillon
    grid: [
      "...ggg...",
      "..ggoog..",
      ".gooooog.",
      "ggooooogg",
      ".gooooog.",
      "..goorr..",
      "..gorgg..",
      "...ggg...",
      "...r.r...",
    ],
    palette: { g: "#ffd700", o: "#ffeeaa", r: "#ff4422" },
  },

  // ─── Corbeau skins (5 designs, 9×9) ──────────────────────────────────────

  corbeau_1: {
    // Corbeau classique — tout noir, œil rouge, bec crochu
    grid: [
      "...bbb...",
      "..brrbb..",
      "..bbbbb..",
      ".bbbbbbb.",
      "bbbbbbbb.",
      ".bbbbbbb.",
      "..bbbbb..",
      "..bb.bb..",
      "..b...b..",
    ],
    palette: { b: "#1a1a2e", r: "#ff2244" },
  },

  corbeau_2: {
    // Corbeau détective — avec un petit chapeau, air mystérieux
    grid: [
      "..hhhh...",
      ".hbbbbh..",
      ".hbbbbh..",
      "..brrb...",
      "..bbbbb..",
      ".bbbbbbb.",
      "..bbbbb..",
      "..bb.bb..",
      "..b...b..",
    ],
    palette: { b: "#1a1a2e", r: "#ff2244", h: "#111111" },
  },

  corbeau_3: {
    // Corbeau violet sombre — plumes irisées, genre sorcier
    grid: [
      "...ppp...",
      "..pvvpp..",
      "..ppppp..",
      ".ppppppp.",
      "pppppppp.",
      ".ppppppp.",
      "..ppppp..",
      "..pp.pp..",
      "..p...p..",
    ],
    palette: { p: "#2d0a4e", v: "#cc00ff" },
  },

  corbeau_4: {
    // Corbeau pirate — bandeau sur l'œil, air menaçant
    grid: [
      "...bbb...",
      "..bXrbb..",
      "..bbbbb..",
      ".bbbbbbb.",
      "bbbbbbbb.",
      ".bbbbbbb.",
      "..bbbbb..",
      "..bb.bb..",
      "..b...b..",
    ],
    palette: { b: "#1a1a2e", r: "#ff2244", X: "#cc2200" },
  },

  corbeau_5: {
    // Corbeau albinos — plumes blanches, œil rouge rare
    grid: [
      "...www...",
      "..wrrww..",
      "..wwwww..",
      ".wwwwwww.",
      "wwwwwwww.",
      ".wwwwwww.",
      "..wwwww..",
      "..ww.ww..",
      "..w...w..",
    ],
    palette: { w: "#e8e0f0", r: "#ff2244" },
  },

  // ─── Faucon skins (5 designs, 9×9) ───────────────────────────────────────

  faucon_1: {
    // Faucon pèlerin classique — masque noir, poitrine blanche, ailes brunes
    grid: [
      "...mmm...",
      "..mbbwm..",
      "..mwwwm..",
      ".mwwwwwm.",
      "mmwwwwwmm",
      ".mbbbbbm.",
      "..mbbm...",
      "..mbbm...",
      "..y..y...",
    ],
    palette: { m: "#1a1a1a", b: "#8b6040", w: "#f0ece8", y: "#f5c542" },
  },

  faucon_2: {
    // Faucon rouge — crécerelle, teintes rouille, queue rayée
    grid: [
      "...rrr...",
      "..roorr..",
      "..rrrrr..",
      ".rrrrrrr.",
      "rrrrrrrr.",
      ".rrrddrr.",
      "..rdddr..",
      "..r.r.r..",
      "..y..y...",
    ],
    palette: { r: "#cc4422", o: "#ffcc88", d: "#882200", y: "#f5c542" },
  },

  faucon_3: {
    // Faucon sacré — plumes blanches et or, bec doré, air royal
    grid: [
      "...www...",
      "..wggww..",
      "..wwwww..",
      ".wwwwwww.",
      "wwwwwwww.",
      ".wgggggw.",
      "..wggw...",
      "..w..w...",
      "..g..g...",
    ],
    palette: { w: "#f8f0e8", g: "#ffd700" },
  },

  faucon_4: {
    // Faucon gerfaut — arctique, blanc pur, taches sombres
    grid: [
      "...www...",
      "..wsbww..",
      "..wwwww..",
      ".wwwwwww.",
      "wwswwsww.",
      ".wwwwwww.",
      "..wwsww..",
      "..w..w...",
      "..y..y...",
    ],
    palette: { w: "#f8fcff", s: "#334455", b: "#4488cc", y: "#f5c542" },
  },

  faucon_5: {
    // Faucon cyber — version néon, plumes électriques, œil laser
    grid: [
      "...ccc...",
      "..cnnccc.",
      "..ccccc..",
      ".ccccccc.",
      "cccccccc.",
      ".cceeecc.",
      "..ceec...",
      "..c..c...",
      "..e..e...",
    ],
    palette: { c: "#003344", n: "#00ffff", e: "#00ff88" },
  },

  // ─── Green powerups ───────────────────────────────────────────────────────
  multiball: {
    // 3 small dots (balls)
    grid: [
      "a.a.a",
      "a.a.a",
      ".....",
      "..a..",
      "..a..",
    ],
    palette: { a: "#ffcc44" },
  },
  spooky: {
    // Ghost silhouette
    grid: [
      ".aaa.",
      "aaaaa",
      "aaaaa",
      "aaaaa",
      "a.a.a",
    ],
    palette: { a: "#cc88ff" },
  },
  extraball: {
    // Plus sign inside circle
    grid: [
      ".aaa.",
      "aabaa",
      "abbba",
      "aabaa",
      ".aaa.",
    ],
    palette: { a: "#00ffcc", b: "#ffffff" },
  },
  magnet: {
    // U-shape magnet
    grid: [
      "a...a",
      "a...a",
      "a...a",
      ".aaa.",
      ".....",
    ],
    palette: { a: "#4488ff" },
  },

  // ─── Upgrades ─────────────────────────────────────────────────────────────
  heavy_ball: {
    // Solid dark ball
    grid: [
      ".aaa.",
      "aaaaa",
      "aabaa",
      "aaaaa",
      ".aaa.",
    ],
    palette: { a: "#555577", b: "#888899" },
  },
  ghost_ball: {
    // Dashed / hollow ball
    grid: [
      ".aaa.",
      "a...a",
      "a.b.a",
      "a...a",
      ".aaa.",
    ],
    palette: { a: "#aaaacc", b: "#ffffff" },
  },
  combo_hungry: {
    // X2 symbol
    grid: [
      "a...a",
      ".a.a.",
      "..b..",
      ".a.a.",
      "a...a",
    ],
    palette: { a: "#ff6600", b: "#ffaa00" },
  },
  extra_ball: {
    // Ball with +
    grid: [
      ".aaa.",
      "aabaa",
      "abbba",
      "aabaa",
      ".aaa.",
    ],
    palette: { a: "#00ffcc", b: "#ffffff" },
  },
  recovery: {
    // Cross / medkit
    grid: [
      ".aaa.",
      ".aaa.",
      "aaaaa",
      ".aaa.",
      ".aaa.",
    ],
    palette: { a: "#ff4455" },
  },
  bigger_ball: {
    // Large filled circle
    grid: [
      "aaaaa",
      "abbba",
      "abbba",
      "abbba",
      "aaaaa",
    ],
    palette: { a: "#4466cc", b: "#6688ff" },
  },
  turbo_bomb: {
    // Bomb shape
    grid: [
      "...a.",
      ".aaa.",
      "aaaaa",
      ".aaa.",
      "..a..",
    ],
    palette: { a: "#ff2244" },
  },
  fever_forever: {
    // Thermometer
    grid: [
      "..a..",
      ".aaa.",
      ".aba.",
      ".aba.",
      ".bbb.",
    ],
    palette: { a: "#ff00cc", b: "#ff88ee" },
  },
  chain_master: {
    // Chain links
    grid: [
      ".aa..",
      "a..a.",
      ".aa..",
      "..aa.",
      "..aa.",
    ],
    palette: { a: "#aaaacc" },
  },
  lucky_spin: {
    // Clover / 4 lobes
    grid: [
      ".a.a.",
      "aaaaa",
      ".aaa.",
      "aaaaa",
      ".a.a.",
    ],
    palette: { a: "#44cc44" },
  },
  iron_will: {
    // Shield
    grid: [
      "aaaaa",
      "aaaaa",
      ".aaa.",
      "..a..",
      ".....",
    ],
    palette: { a: "#aaaaee" },
  },

  // ─── Relics ───────────────────────────────────────────────────────────────
  boomerang: {
    // Arc shape
    grid: [
      "a....",
      ".a...",
      "..a..",
      "...aa",
      ".....",
    ],
    palette: { a: "#ffaa44" },
  },
  scorpion: {
    // Stylized S / scorpion claw
    grid: [
      ".aaa.",
      "a....",
      ".aaa.",
      "....a",
      ".aaa.",
    ],
    palette: { a: "#ff6644" },
  },
  blessed_cursor: {
    // Star / sparkle
    grid: [
      "..a..",
      ".aaa.",
      "aaaaa",
      ".aaa.",
      "..a..",
    ],
    palette: { a: "#ffee88" },
  },
  trophy: {
    // Trophy cup
    grid: [
      "aaaaa",
      ".aaa.",
      ".aaa.",
      "..a..",
      ".aaa.",
    ],
    palette: { a: "#ffd700" },
  },
  phoenix: {
    // Flame / wings
    grid: [
      ".a.a.",
      "aaaaa",
      ".bab.",
      "..b..",
      ".....",
    ],
    palette: { a: "#ff8800", b: "#ffcc44" },
  },
  cursed_luck: {
    // Die face (4 dots)
    grid: [
      "aaaaa",
      "a.b.a",
      "a...a",
      "a.b.a",
      "aaaaa",
    ],
    palette: { a: "#cc44ff", b: "#ffffff" },
  },

  // ─── UI ───────────────────────────────────────────────────────────────────
  gamepad: {
    // Simplified gamepad
    grid: [
      ".aaa.",
      "aaaaa",
      "aabba",
      "aaaaa",
      ".a.a.",
    ],
    palette: { a: "#8888cc", b: "#ffffff" },
  },
  victory: {
    // Star burst
    grid: [
      "a.a.a",
      ".aaa.",
      "aaaaa",
      ".aaa.",
      "a.a.a",
    ],
    palette: { a: "#ffcc00" },
  },
  skull: {
    // Skull
    grid: [
      ".aaa.",
      "aaaaa",
      "aabba",
      ".aaa.",
      ".a.a.",
    ],
    palette: { a: "#ddddee", b: "#111122" },
  },
  boss: {
    // Crown
    grid: [
      "a.a.a",
      "aaaaa",
      "aaaaa",
      ".aaa.",
      ".....",
    ],
    palette: { a: "#ffd700" },
  },
  ball_cat: {
    // Circle (ball)
    grid: [
      ".aaa.",
      "aaaaa",
      "aabaa",
      "aaaaa",
      ".aaa.",
    ],
    palette: { a: "#4488ff", b: "#aaccff" },
  },
  score_cat: {
    // Bar chart
    grid: [
      "....a",
      "..a.a",
      ".aa.a",
      "aaa.a",
      "aaaaa",
    ],
    palette: { a: "#ffcc44" },
  },
  utility_cat: {
    // Gear / cog
    grid: [
      ".aaa.",
      "aaaaa",
      "aabaa",
      "aaaaa",
      ".aaa.",
    ],
    palette: { a: "#44ffaa", b: "#ffffff" },
  },
};

interface PegIconProps {
  id: PegIconId;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PegIcon({ id, size = 20, style }: PegIconProps) {
  const def = ICONS[id];
  if (!def) return null;

  const rows = def.grid.length;
  const cols = def.grid[0]?.length ?? 5;
  const cellSize = size / Math.max(rows, cols);

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
      {def.grid.map((row, ri) =>
        row.split("").map((ch, ci) => {
          const color = ch === "." ? "transparent" : (def.palette[ch] ?? "transparent");
          return (
            <div
              key={`${ri}-${ci}`}
              style={{
                width: cellSize,
                height: cellSize,
                background: color,
              }}
            />
          );
        })
      )}
    </div>
  );
}

export type { PegIconId };
