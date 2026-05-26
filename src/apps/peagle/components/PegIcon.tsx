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
  // Aigle skins (5 designs)
  | "aigle_1" | "aigle_2" | "aigle_3" | "aigle_4" | "aigle_5"
  // Hibou skins (5 designs)
  | "hibou_1" | "hibou_2" | "hibou_3" | "hibou_4" | "hibou_5"
  // Pingouin skins (5 designs)
  | "pingouin_1" | "pingouin_2" | "pingouin_3" | "pingouin_4" | "pingouin_5"
  // Peg Normal skins (5 designs)
  | "peg_normal_1" | "peg_normal_2" | "peg_normal_3" | "peg_normal_4" | "peg_normal_5"
  // Peg Orange skins (5 designs)
  | "peg_orange_1" | "peg_orange_2" | "peg_orange_3" | "peg_orange_4" | "peg_orange_5"
  // Peg Vert skins (5 designs)
  | "peg_green_1" | "peg_green_2" | "peg_green_3" | "peg_green_4" | "peg_green_5"
  // Boss Peg skins (3 designs)
  | "peg_boss_1" | "peg_boss_2" | "peg_boss_3"
  // Bombe skins (3 designs)
  | "peg_bomb_1" | "peg_bomb_2" | "peg_bomb_3"
  // Blindé skins (3 designs)
  | "peg_armor_1" | "peg_armor_2" | "peg_armor_3"
  // Warp skins (3 designs)
  | "peg_warp_1" | "peg_warp_2" | "peg_warp_3"
  // Bumper skins (3 designs)
  | "decor_bumper_1" | "decor_bumper_2" | "decor_bumper_3"
  // Planche skins (3 designs)
  | "decor_plank_1" | "decor_plank_2" | "decor_plank_3"
  // Arc skins (3 designs)
  | "decor_arc_1" | "decor_arc_2" | "decor_arc_3"
  // Pointe skins (3 designs)
  | "decor_spike_1" | "decor_spike_2" | "decor_spike_3"
  // Green powerups
  | "multiball" | "spooky" | "extraball" | "magnet"
  // Upgrades
  | "heavy_ball" | "ghost_ball" | "combo_hungry"
  | "extra_ball" | "recovery" | "bigger_ball" | "turbo_bomb"
  | "fever_forever" | "chain_master" | "lucky_spin" | "iron_will"
  // Relics
  | "boomerang" | "scorpion" | "blessed_cursor" | "trophy" | "phoenix" | "cursed_luck"
  // UI
  | "gamepad" | "victory" | "skull" | "boss" | "ball_cat" | "score_cat" | "utility_cat"
  // Décors (Showroom)
  | "decor_bumper" | "decor_plank" | "decor_arc" | "decor_spike";

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

  // ─── Aigle skins (5 designs, 30×30) ─────────────────────────────────────

  aigle_1: {
    // Pygargue classique — tête blanche, corps brun, bec jaune crochu
    grid: [
      "..............w...............",
      ".............www..............",
      "............wwwww.............",
      "...........wwwwwww............",
      "..........wwwwwwwww...........",
      ".........wwwEwwwwwww..........",
      "........wwwwwwwwwwwww.........",
      ".......wwwwwwwwwwwwwww........",
      "......wwwwwwwwwwwwwwwww.......",
      ".....yyyywwwwwwwwwwwwwww......",
      "....yyyyywwwwwwwwwwwwwwww.....",
      "...yyyyyyywwwwwwwwwwwwwwww....",
      "..bbbbbbbbbbbbbbbbbbbbbbbbb...",
      ".bbbbbbbbbbbbbbbbbbbbbbbbbbb..",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ".bbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
      "..bbbbbbbbbbbbbbbbbbbbbbbbbbb.",
      "...bbbbbbbbbbbbbbbbbbbbbbbbbb.",
      "....bbbbbbbbbbbbbbbbbbbbbbbbb.",
      ".....bbbbbbbbbbbbbbbbbbbbbbb..",
      "......bbbbbbbbbbbbbbbbbbbbbb..",
      ".......bbbbbbbbbbbbbbbbbbbbb..",
      "........bbbbbbbbbbbbbbbbbbbb..",
      ".........bbbbbbbbbbbbbbbbbbb..",
      "..........bbbbbbbbbbbbbbbbbb..",
      "...........bbbbbbbbbbbbbbbbb..",
      "............bbbbbbbbbbbbbbbb..",
      "..............yyy.....yyy.....",
    ],
    palette: { w: "#f0ece0", b: "#6b4226", E: "#111111", y: "#f5c542" },
  },

  aigle_2: {
    // Aigle royal doré — plumes or et brun chaud, couronne lumineuse
    grid: [
      "..............g...............",
      ".............ggg..............",
      "............ggggg.............",
      "...........ggggggg............",
      "..........ggggggggg...........",
      ".........gggEggggggg..........",
      "........ggggggggggggg.........",
      ".......ggggggggggggggg........",
      "......ggggggggggggggggg.......",
      ".....HHHHggggggggggggggg......",
      "....HHHHHgggggggggggggggH.....",
      "...HHHHHHHgggggggggggggggH....",
      "..ddddddddddddddddddddddddd...",
      ".ddddddddddddddddddddddddddd..",
      "dddddddddddddddddddddddddddddd",
      "dddddddddddddddddddddddddddddd",
      "dddddddddddddddddddddddddddddd",
      ".ddddddddddddddddddddddddddddd",
      "..dddddddddddddddddddddddddddd",
      "...ddddddddddddddddddddddddddd",
      "....dddddddddddddddddddddddddd",
      ".....ddddddddddddddddddddddddd",
      "......dddddddddddddddddddddddd",
      ".......ddddddddddddddddddddddd",
      "........dddddddddddddddddddddd",
      ".........ddddddddddddddddddddd",
      "..........dddddddddddddddddddd",
      "...........ddddddddddddddddddd",
      "............dddddddddddddddddd",
      "..............HHH.....HHH.....",
    ],
    palette: { g: "#e8c84a", d: "#8b5e2a", E: "#111111", H: "#fff0a0" },
  },

  aigle_3: {
    // Aigle tempête — plumes sombres presque noires, œil électrique cyan
    grid: [
      "..............d...............",
      ".............ddd..............",
      "............ddddd.............",
      "...........ddddddd............",
      "..........ddddddddd...........",
      ".........dddEddddddd..........",
      "........ddddddddddddd.........",
      ".......ddddddddddddddd........",
      "......ddddddddddddddddd.......",
      ".....nnnnddddddddddddddd......",
      "....nnnnnddddddddddddddddn....",
      "...nnnnnnndddddddddddddddddn..",
      "..sssssssssssssssssssssssss...",
      ".sssssssssssssssssssssssssss..",
      "ssssssssssssssssssssssssssssss",
      "ssssssssssssssssssssssssssssss",
      "ssssssssssssssssssssssssssssss",
      ".sssssssssssssssssssssssssssss",
      "..ssssssssssssssssssssssssssss",
      "...sssssssssssssssssssssssssss",
      "....ssssssssssssssssssssssssss",
      ".....sssssssssssssssssssssssss",
      "......ssssssssssssssssssssssss",
      ".......sssssssssssssssssssssss",
      "........ssssssssssssssssssssss",
      ".........sssssssssssssssssssss",
      "..........ssssssssssssssssssss",
      "...........sssssssssssssssssss",
      "............ssssssssssssssssss",
      "..............nnn.....nnn.....",
    ],
    palette: { d: "#c8c0b0", s: "#1a1a2e", E: "#00ffff", n: "#8888aa" },
  },

  aigle_4: {
    // Aigle albinos — plumes blanc pur, œil rose, bec rose pâle
    grid: [
      "..............w...............",
      ".............www..............",
      "............wwwww.............",
      "...........wwwwwww............",
      "..........wwwwwwwww...........",
      ".........wwwPwwwwwww..........",
      "........wwwwwwwwwwwww.........",
      ".......wwwwwwwwwwwwwww........",
      "......wwwwwwwwwwwwwwwww.......",
      ".....ppppwwwwwwwwwwwwwww......",
      "....pppppwwwwwwwwwwwwwwwp.....",
      "...pppppppwwwwwwwwwwwwwwwp....",
      "..lllllllllllllllllllllllll...",
      ".lllllllllllllllllllllllllll..",
      "llllllllllllllllllllllllllllll",
      "llllllllllllllllllllllllllllll",
      "llllllllllllllllllllllllllllll",
      ".lllllllllllllllllllllllllllll",
      "..llllllllllllllllllllllllllll",
      "...lllllllllllllllllllllllllll",
      "....llllllllllllllllllllllllll",
      ".....lllllllllllllllllllllllll",
      "......llllllllllllllllllllllll",
      ".......lllllllllllllllllllllll",
      "........llllllllllllllllllllll",
      ".........lllllllllllllllllllll",
      "..........llllllllllllllllllll",
      "...........lllllllllllllllllll",
      "............llllllllllllllllll",
      "..............ppp.....ppp.....",
    ],
    palette: { w: "#f8f4f0", l: "#e0dcd8", P: "#ff88aa", p: "#ffaacc" },
  },

  aigle_5: {
    // Aigle cyber — armure métallique, œil laser rouge, circuits néon
    grid: [
      "..............c...............",
      ".............ccc..............",
      "............ccccc.............",
      "...........ccccccc............",
      "..........ccccccccc...........",
      ".........cccEccccccc..........",
      "........ccccccccccccc.........",
      ".......ccccccccccccccc........",
      "......ccccccccccccccccc.......",
      ".....nnnncccccccccccccccc.....",
      "....nnnnnccccccccccccccccn....",
      "...nnnnnnnccccccccccccccccn...",
      "..kkkkkkkkkkkkkkkkkkkkkkkkk...",
      ".kkkkkkkkkkkkkkkkkkkkkkkkkkk..",
      "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
      "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
      ".kkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
      "..kkkkkkkkkkkkkkkkkkkkkkkkkkkk",
      "...kkkkkkkkkkkkkkkkkkkkkkkkkkk",
      "....kkkkkkkkkkkkkkkkkkkkkkkkkk",
      ".....kkkkkkkkkkkkkkkkkkkkkkkkk",
      "......kkkkkkkkkkkkkkkkkkkkkkkk",
      ".......kkkkkkkkkkkkkkkkkkkkkkk",
      "........kkkkkkkkkkkkkkkkkkkkkk",
      ".........kkkkkkkkkkkkkkkkkkkkk",
      "..........kkkkkkkkkkkkkkkkkkkk",
      "...........kkkkkkkkkkkkkkkkkkk",
      "............kkkkkkkkkkkkkkkkkk",
      "..............nnn.....nnn.....",
    ],
    palette: { c: "#dce8f0", k: "#1a2a3a", E: "#ff2244", n: "#00ffff" },
  },

  // ─── Hibou skins (5 designs, 30×30) ──────────────────────────────────────

  hibou_1: {
    // Grand duc classique — yeux orange, disque facial, aigrettes
    grid: [
      "............tt..tt............",
      "...........tttt.tttt..........",
      "..........ttttttttttt.........",
      ".........ttttttttttttt........",
      "........ttttttttttttttt.......",
      ".......ttttttttttttttttt......",
      "......ttttttttttttttttttt.....",
      ".....ttttttttttttttttttttt....",
      "....ttttttttttttttttttttttt...",
      "....ttttttttttttttttttttttt...",
      "....tttttOOttttttOOttttttt....",
      "....ttttOooOtttttOooOtttttt...",
      "....ttttOooOtttttOooOtttttt...",
      "....tttttOOttBBttOOttttttt....",
      "....ttttttttBBBBttttttttttt...",
      "....tttttttttttttttttttttt....",
      "....tttttttttttttttttttttt....",
      ".....tttttttttttttttttttt.....",
      "......ttttttttttttttttttt.....",
      ".......ttttttttttttttttt......",
      "........ttttttttttttttt.......",
      ".......ttttttttttttttttt......",
      "......ttttttttttttttttttt.....",
      ".....ttttttttttttttttttttt....",
      "....ttttttttttttttttttttttt...",
      "...ttttttttttttttttttttttttt..",
      "...ttttttttttttttttttttttttt..",
      "....ttttttttttttttttttttttt...",
      ".....tt.tt.tttttttttt.tt.tt...",
      "......t...t.tttttttt.t...t....",
    ],
    palette: { t: "#c8942a", O: "#ff8800", o: "#ffcc44", B: "#d4a060" },
  },

  hibou_2: {
    // Hibou des neiges — blanc arctique, yeux jaunes perçants
    grid: [
      "............tt..tt............",
      "...........tttttttttt.........",
      "..........ttttttttttttt.......",
      ".........ttttttttttttttt......",
      "........tttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "......ttttttttttttttttttttt...",
      ".....ttttttttttttttttttttttt..",
      "....ttttttttttttttttttttttttt.",
      "....ttttttttttttttttttttttttt.",
      "....tttttYYtttttYYtttttttttt..",
      "....ttttYyyYtttYyyYttttttttt..",
      "....ttttYyyYtttYyyYttttttttt..",
      "....tttttYYtttBBttYYtttttttt..",
      "....ttttttttBBBBtttttttttttt..",
      "....ttttttttttttttttttttttt...",
      "....ttttttttttttttttttttttt...",
      ".....ttttttttttttttttttttt....",
      "......tttttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "........tttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "......ttttttttttttttttttttt...",
      ".....ttttttttttttttttttttttt..",
      "....ttttttttttttttttttttttttt.",
      "...ttttttttttttttttttttttttttt",
      "...ttttttttttttttttttttttttttt",
      "....ttttttttttttttttttttttttt.",
      ".....tt.tt.tttttttttt.tt.tt...",
      "......t...t.tttttttt.t...t....",
    ],
    palette: { t: "#f0ece8", Y: "#ffcc00", y: "#ffee66", B: "#d0ccc8" },
  },

  hibou_3: {
    // Hibou sorcier — plumes violettes, œil magie violet
    grid: [
      "............tt..tt............",
      "...........ttttttttt..........",
      "..........ttttttttttt.........",
      ".........ttttttttttttt........",
      "........ttttttttttttttt.......",
      ".......ttttttttttttttttt......",
      "......ttttttttttttttttttt.....",
      ".....ttttttttttttttttttttt....",
      "....ttttttttttttttttttttttt...",
      "....ttttttttttttttttttttttt...",
      "....tttttVVtttttVVttttttttt...",
      "....ttttVvvVtttVvvVtttttttt...",
      "....ttttVvvVtttVvvVtttttttt...",
      "....tttttVVtttBBttVVtttttttt..",
      "....ttttttttBBBBtttttttttttt..",
      "....ttttttttttttttttttttttt...",
      "....ttttttttttttttttttttttt...",
      ".....ttttttttttttttttttttt....",
      "......tttttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "........ttttttttttttttttt.....",
      ".......ttttttttttttttttttt....",
      "......ttttttttttttttttttttt...",
      ".....ttttttttttttttttttttttt..",
      "....ttttttttttttttttttttttttt.",
      "...ttttttttttttttttttttttttttt",
      "...ttttttttttttttttttttttttttt",
      "....ttttttttttttttttttttttttt.",
      ".....tt.tt.tttttttttt.tt.tt...",
      "......t...t.tttttttt.t...t....",
    ],
    palette: { t: "#2a0a3e", V: "#cc44ff", v: "#ee88ff", B: "#440066" },
  },

  hibou_4: {
    // Effraie des clochers — visage en cœur blanc, plumes dorées
    grid: [
      "..............tt..............",
      ".............tttt.............",
      "............tttttt............",
      "...........tttttttt...........",
      "..........tttttttttt..........",
      ".........tttttttttttt.........",
      "........tttttttttttttt........",
      ".......tttttttttttttttt.......",
      "......tttttttttttttttttt......",
      "......tttttttttttttttttt......",
      "......ttttffffffffftttttt.....",
      "......tttffffffffffff ttttt...",
      "......tttfffffBBffffftttttt...",
      "......tttfffffBBffffftttttt...",
      "......ttttfffBBBBfffttttttt...",
      "......tttttttttttttttttttt....",
      "......tttttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "........tttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "......ttttttttttttttttttttt...",
      ".....ttttttttttttttttttttttt..",
      "....ttttttttttttttttttttttttt.",
      "...ttttttttttttttttttttttttttt",
      "..ttttttttttttttttttttttttttt.",
      "...ttttttttttttttttttttttttttt",
      "....ttttttttttttttttttttttttt.",
      ".....ttttttttttttttttttttttt..",
      "......tt.tt.tttttttttt.tt.tt..",
      ".......t...t.tttttttt.t...t...",
    ],
    palette: { t: "#d4a84b", f: "#f4f0e8", B: "#c8a060" },
  },

  hibou_5: {
    // Hibou démon — plumes noires, yeux rouges brillants, aura menaçante
    grid: [
      "............tt..tt............",
      "...........ttttttttt..........",
      "..........ttttttttttt.........",
      ".........ttttttttttttt........",
      "........ttttttttttttttt.......",
      ".......ttttttttttttttttt......",
      "......ttttttttttttttttttt.....",
      ".....ttttttttttttttttttttt....",
      "....ttttttttttttttttttttttt...",
      "....ttttttttttttttttttttttt...",
      "....tttttRRtttttRRttttttttt...",
      "....ttttRrrRtttRrrRtttttttt...",
      "....ttttRrrRtttRrrRtttttttt...",
      "....tttttRRtttBBttRRtttttttt..",
      "....ttttttttBBBBtttttttttttt..",
      "....ttttttttttttttttttttttt...",
      "....ttttttttttttttttttttttt...",
      ".....ttttttttttttttttttttt....",
      "......tttttttttttttttttttt....",
      ".......ttttttttttttttttttt....",
      "........ttttttttttttttttt.....",
      ".......ttttttttttttttttttt....",
      "......ttttttttttttttttttttt...",
      ".....ttttttttttttttttttttttt..",
      "....ttttttttttttttttttttttttt.",
      "...ttttttttttttttttttttttttttt",
      "...ttttttttttttttttttttttttttt",
      "....ttttttttttttttttttttttttt.",
      ".....tt.tt.tttttttttt.tt.tt...",
      "......t...t.tttttttt.t...t....",
    ],
    palette: { t: "#0a0a14", R: "#ff2244", r: "#ff6677", B: "#330011" },
  },

  // ─── Pingouin skins (5 designs, 30×30) ───────────────────────────────────

  pingouin_1: {
    // Manchot classique — smoking noir/blanc, ventre blanc, bec orange
    grid: [
      "..............b...............",
      ".............bbb..............",
      "............bbbbb.............",
      "...........bbbbbbb............",
      "..........bbbbbbbbb...........",
      ".........bbbbbbbbbbb..........",
      "........bbbbbbbbbbbbb.........",
      ".......bbbbbbbbbbbbbbb........",
      "......bbbbbwwwwwwwbbbbbb......",
      ".....bbbbbwwwwwwwwwbbbbbb.....",
      "....bbbbbwwwwwwwwwwwbbbbbb....",
      "...bbbbbwwwwwwwwwwwwwbbbbbb...",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      "...bbbbbwwwwwwwwwwwwwbbbbbb...",
      "....bbbbbbwwwwwwwwwbbbbbbb....",
      ".....bbbbbbbwwwwwbbbbbbbb.....",
      "......bbbbbbbbbbbbbbbbbbb.....",
      ".......bbbbbbbbbbbbbbbbb......",
      "........bbbbbbbbbbbbbbb.......",
      ".........bbbbbbbbbbbbb........",
      "..........bbbbbbbbbbb.........",
      "...........bbbbbbbbb..........",
      "...........ooo...ooo..........",
      "...........ooo...ooo..........",
    ],
    palette: { b: "#111122", w: "#f0ece8", o: "#ff8800" },
  },

  pingouin_2: {
    // Manchot royal — tache jaune dorée sur le cou, port majestueux
    grid: [
      "..............b...............",
      ".............bbb..............",
      "............bbbbb.............",
      "...........bbbbbbb............",
      "..........bbbbbbbbb...........",
      ".........bbbbbbbbbbb..........",
      "........bbbbbbbbbbbbb.........",
      ".......bbbbbbbbbbbbbbb........",
      "......bbbbbwwwwwwwbbbbbb......",
      ".....bbbbbwwwwwwwwwbbbbbb.....",
      "....bbbbbwwwyyyyywwwbbbbbb....",
      "...bbbbbwwyyyyyyyyyywbbbbbb...",
      "..bbbbbwwyyyyyyyyyyyywbbbbbb..",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      "...bbbbbwwwwwwwwwwwwwbbbbbb...",
      "....bbbbbbwwwwwwwwwbbbbbbb....",
      ".....bbbbbbbwwwwwbbbbbbbb.....",
      "......bbbbbbbbbbbbbbbbbbb.....",
      ".......bbbbbbbbbbbbbbbbb......",
      "........bbbbbbbbbbbbbbb.......",
      ".........bbbbbbbbbbbbb........",
      "..........bbbbbbbbbbb.........",
      "...........bbbbbbbbb..........",
      "...........ooo...ooo..........",
      "...........ooo...ooo..........",
    ],
    palette: { b: "#111122", w: "#f0ece8", y: "#ffcc00", o: "#ff8800" },
  },

  pingouin_3: {
    // Rockhopper — huppe jaune punk, sourcils jaunes, regard de défi
    grid: [
      ".............yyy.yyy..........",
      "............yyyyy.yyyyy.......",
      "............yyyyy.yyyyy.......",
      "...........bbbbbbbbbbb........",
      "..........bbbbbbbbbbbbb.......",
      ".........bbbbbbbbbbbbbbb......",
      "........bbbbbbbbbbbbbbbbb.....",
      ".......bbbbbbbbbbbbbbbbbbb....",
      "......bbbbbwwwwwwwbbbbbbbb....",
      ".....bbbbbwwwwwwwwwbbbbbbbb...",
      "....bbbbbwwwwwwwwwwwbbbbbbbb..",
      "...bbbbbwwwwwwwwwwwwwbbbbbbb..",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      "...bbbbbwwwwwwwwwwwwwbbbbbb...",
      "....bbbbbbwwwwwwwwwbbbbbbb....",
      ".....bbbbbbbwwwwwbbbbbbbb.....",
      "......bbbbbbbbbbbbbbbbbbb.....",
      ".......bbbbbbbbbbbbbbbbb......",
      "........bbbbbbbbbbbbbbb.......",
      ".........bbbbbbbbbbbbb........",
      "..........bbbbbbbbbbb.........",
      "...........bbbbbbbbb..........",
      "...........ooo...ooo..........",
      "...........ooo...ooo..........",
    ],
    palette: { b: "#111122", w: "#f0ece8", y: "#ffcc00", o: "#ff8800" },
  },

  pingouin_4: {
    // Manchot pygmée — plumes bleu ardoise, petit et vif
    grid: [
      "..............b...............",
      ".............bbb..............",
      "............bbbbb.............",
      "...........bbbbbbb............",
      "..........bbbbbbbbb...........",
      ".........bbbbbbbbbbb..........",
      "........bbbbbbbbbbbbb.........",
      ".......bbbbbbbbbbbbbbb........",
      "......bbbbbwwwwwwwbbbbbb......",
      ".....bbbbbwwwwwwwwwbbbbbb.....",
      "....bbbbbwwwwwwwwwwwbbbbbb....",
      "...bbbbbwwwwwwwwwwwwwbbbbbb...",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      "bbbbbwwwwwwwwwwwwwwwwwwwbbbbb.",
      ".bbbbbwwwwwwwwwwwwwwwwwbbbbb..",
      "..bbbbbwwwwwwwwwwwwwwwbbbbbb..",
      "...bbbbbwwwwwwwwwwwwwbbbbbb...",
      "....bbbbbbwwwwwwwwwbbbbbbb....",
      ".....bbbbbbbwwwwwbbbbbbbb.....",
      "......bbbbbbbbbbbbbbbbbbb.....",
      ".......bbbbbbbbbbbbbbbbb......",
      "........bbbbbbbbbbbbbbb.......",
      ".........bbbbbbbbbbbbb........",
      "..........bbbbbbbbbbb.........",
      "...........bbbbbbbbb..........",
      "...........sss...sss..........",
      "...........sss...sss..........",
    ],
    palette: { b: "#2a4466", w: "#f0ece8", s: "#ffcc44" },
  },

  pingouin_5: {
    // Manchot cyber — armure bleue électrique, propulsion néon
    grid: [
      "..............b...............",
      ".............bbb..............",
      "............bbbbb.............",
      "...........bbbbbbb............",
      "..........bbbbbbbbb...........",
      ".........bbbbbbbbbbb..........",
      "........bbbbbbbbbbbbb.........",
      ".......bbbbbbbbbbbbbbb........",
      "......bbbbbcccccccbbbbbb......",
      ".....bbbbbcccccccccbbbbbb.....",
      "....bbbbbcccccccccccbbbbbb....",
      "...bbbbbcccccccccccccbbbbbb...",
      "..bbbbbcccccccccccccccbbbbbb..",
      ".bbbbbcccccccccccccccccbbbbb..",
      "bbbbbcccccccccccccccccccbbbbb.",
      "bbbbbcccccccccccccccccccbbbbb.",
      "bbbbbcccccccccccccccccccbbbbb.",
      ".bbbbbcccccccccccccccccbbbbb..",
      "..bbbbbcccccccccccccccbbbbbb..",
      "...bbbbbcccccccccccccbbbbbb...",
      "....bbbbbbcccccccccbbbbbbb....",
      ".....bbbbbbbcccccbbbbbbbb.....",
      "......bbbbbbbbbbbbbbbbbbb.....",
      ".......bbbbbbbbbbbbbbbbb......",
      "........bbbbbbbbbbbbbbb.......",
      ".........bbbbbbbbbbbbb........",
      "..........bbbbbbbbbbb.........",
      "...........bbbbbbbbb..........",
      "...........nnn...nnn..........",
      "...........nnn...nnn..........",
    ],
    palette: { b: "#0a1a2e", c: "#aaddff", n: "#00ffff" },
  },

  // ─── Peg Normal skins (7×7) ──────────────────────────────────────────────
  peg_normal_1: {
    // Classique — carré bleu avec bevel
    grid: [
      ".......",
      ".bbbbb.",
      ".bhhhb.",
      ".bh.hb.",
      ".bhhhb.",
      ".bbbbb.",
      ".......",
    ],
    palette: { b: "#2233aa", h: "#4455ff" },
  },
  peg_normal_2: {
    // Ardoise — gris-bleu froid, reflet métallique
    grid: [
      ".......",
      ".bbbbb.",
      ".bhhbb.",
      ".bh.bb.",
      ".bbbbb.",
      ".bbbbb.",
      ".......",
    ],
    palette: { b: "#445577", h: "#aabbcc" },
  },
  peg_normal_3: {
    // Minuit — bleu très sombre, presque noir
    grid: [
      ".......",
      ".bbbbb.",
      ".bhhhb.",
      ".b.h.b.",
      ".bhhhb.",
      ".bbbbb.",
      ".......",
    ],
    palette: { b: "#0a0a2e", h: "#1133aa" },
  },
  peg_normal_4: {
    // Acier — argent brossé, reflets blancs
    grid: [
      ".......",
      ".wwwww.",
      ".whhww.",
      ".whsww.",
      ".wwwww.",
      ".ssssw.",
      ".......",
    ],
    palette: { w: "#8899bb", h: "#ddeeff", s: "#334466" },
  },
  peg_normal_5: {
    // Fantôme — translucide, contours pointillés
    grid: [
      ".......",
      ".b.b.b.",
      "b.....b",
      ".......",
      "b.....b",
      ".b.b.b.",
      ".......",
    ],
    palette: { b: "#6677cc" },
  },

  // ─── Peg Orange skins (7×7) ───────────────────────────────────────────────
  peg_orange_1: {
    // Classique — orange vif avec glow
    grid: [
      ".......",
      ".ooooo.",
      ".ohhho.",
      ".oh.ho.",
      ".ohhho.",
      ".ooooo.",
      ".......",
    ],
    palette: { o: "#ff5500", h: "#ffdd44" },
  },
  peg_orange_2: {
    // Soleil — rayons dorés, cœur éclatant
    grid: [
      ".r...r.",
      "..ooo..",
      ".ohhho.",
      "rohh.or",
      ".ohhho.",
      "..ooo..",
      ".r...r.",
    ],
    palette: { o: "#ff7700", h: "#ffee66", r: "#ffbb00" },
  },
  peg_orange_3: {
    // Braise — rouge-orange, bords noircis
    grid: [
      ".......",
      ".ddddd.",
      ".dohod.",
      ".do.od.",
      ".dohod.",
      ".ddddd.",
      ".......",
    ],
    palette: { d: "#882200", o: "#ff3300", h: "#ffaa44" },
  },
  peg_orange_4: {
    // Lava — teintes volcanique, cracks internes
    grid: [
      ".......",
      ".ooooo.",
      ".odooo.",
      ".oddoo.",
      ".ooooo.",
      ".ooooo.",
      ".......",
    ],
    palette: { o: "#cc3300", d: "#ff8800", h: "#ffcc44" },
  },
  peg_orange_5: {
    // Soleil doré — édition légendaire
    grid: [
      "g.....g",
      ".goooog",
      ".ohhho.",
      "goh.hog",
      ".ohhho.",
      "g.oooo.",
      "g.....g",
    ],
    palette: { o: "#ff8800", h: "#ffee88", g: "#ffd700" },
  },

  // ─── Peg Vert skins (7×7) ─────────────────────────────────────────────────
  peg_green_1: {
    // Classique — vert avec checkmark
    grid: [
      ".......",
      ".ggggg.",
      ".ghhhg.",
      ".gh.hg.",
      ".ghhhg.",
      ".ggggg.",
      ".......",
    ],
    palette: { g: "#009922", h: "#aaffcc" },
  },
  peg_green_2: {
    // Trèfle — motif feuille vert foncé
    grid: [
      "..g.g..",
      ".ggggg.",
      ".ggggg.",
      "..ggg..",
      "...g...",
      "..ggg..",
      ".......",
    ],
    palette: { g: "#00cc44" },
  },
  peg_green_3: {
    // Émeraude — vert précieux, facettes
    grid: [
      ".......",
      "..eee..",
      ".eggge.",
      ".egEge.",
      ".eggge.",
      "..eee..",
      ".......",
    ],
    palette: { e: "#005522", g: "#00aa44", E: "#88ffbb" },
  },
  peg_green_4: {
    // Toxic — vert acide, bulle centrale
    grid: [
      ".......",
      ".ttttt.",
      ".tbbbt.",
      ".tb.bt.",
      ".tbbbt.",
      ".ttttt.",
      ".......",
    ],
    palette: { t: "#44cc00", b: "#aaff00" },
  },
  peg_green_5: {
    // Nature — mousse, texture organique
    grid: [
      ".......",
      ".ngngn.",
      "nggggng",
      ".ggGgg.",
      "nggggng",
      ".ngngn.",
      ".......",
    ],
    palette: { n: "#003311", g: "#006622", G: "#00ff88" },
  },

  // ─── Boss Peg skins (7×7) ─────────────────────────────────────────────────
  peg_boss_1: {
    // Classique — or avec couronne
    grid: [
      "g.g.g.g",
      ".ggggg.",
      "ggggggg",
      ".gBgBg.",
      "ggggggg",
      ".ggggg.",
      ".......",
    ],
    palette: { g: "#cc8800", B: "#ffff88" },
  },
  peg_boss_2: {
    // Démon — rouge sang, crocs
    grid: [
      "r.....r",
      ".rrrrr.",
      "rrRrRrr",
      ".r...r.",
      "rrrrrrr",
      ".rrrrr.",
      "..r.r..",
    ],
    palette: { r: "#aa0000", R: "#ff4400" },
  },
  peg_boss_3: {
    // Obsidienne — noir profond, runes violettes
    grid: [
      ".......",
      ".bbbbb.",
      ".bpbpb.",
      ".b.p.b.",
      ".bpbpb.",
      ".bbbbb.",
      ".......",
    ],
    palette: { b: "#111122", p: "#cc44ff" },
  },

  // ─── Bombe skins (7×7) ────────────────────────────────────────────────────
  peg_bomb_1: {
    // Classique — rouge vif, mèche en haut
    grid: [
      "...f...",
      "..fff..",
      ".bbbbb.",
      ".bBBBb.",
      ".bBbBb.",
      ".bBBBb.",
      ".bbbbb.",
    ],
    palette: { b: "#cc1133", B: "#ff4466", f: "#ffaa44" },
  },
  peg_bomb_2: {
    // Grenade — verte militaire, nervures
    grid: [
      "...f...",
      "..fff..",
      ".ggggg.",
      ".gnGng.",
      ".gGgGg.",
      ".gnGng.",
      ".ggggg.",
    ],
    palette: { g: "#336611", G: "#66aa22", n: "#223300", f: "#ffaa44" },
  },
  peg_bomb_3: {
    // Mine — noire avec croix rouge
    grid: [
      ".......",
      ".bbbbb.",
      ".brbrb.",
      ".bbbbb.",
      ".brbrb.",
      ".bbbbb.",
      ".......",
    ],
    palette: { b: "#111111", r: "#ff2244" },
  },

  // ─── Blindé skins (7×7) ───────────────────────────────────────────────────
  peg_armor_1: {
    // Classique — gris métal, rivets
    grid: [
      ".......",
      ".aaaaa.",
      ".ahaha.",
      ".a.a.a.",
      ".ahaha.",
      ".aaaaa.",
      ".......",
    ],
    palette: { a: "#888899", h: "#dddde8" },
  },
  peg_armor_2: {
    // Titane — bleu acier, très dur
    grid: [
      ".......",
      ".ttttt.",
      ".thHht.",
      ".th.ht.",
      ".thHht.",
      ".ttttt.",
      ".......",
    ],
    palette: { t: "#334466", h: "#556688", H: "#aabbdd" },
  },
  peg_armor_3: {
    // Bois — planche clouée, rustique
    grid: [
      ".......",
      ".wwwww.",
      ".wnwnw.",
      ".w.w.w.",
      ".wnwnw.",
      ".wwwww.",
      ".......",
    ],
    palette: { w: "#886644", n: "#442211" },
  },

  // ─── Warp skins (7×7) ────────────────────────────────────────────────────
  peg_warp_1: {
    // Classique — violet pulsant, spirale
    grid: [
      ".......",
      "..ppp..",
      ".pPPPp.",
      ".pPwPp.",
      ".pPPPp.",
      "..ppp..",
      ".......",
    ],
    palette: { p: "#6600cc", P: "#9933ff", w: "#ffffff" },
  },
  peg_warp_2: {
    // Portail — bleu électrique, anneau
    grid: [
      ".......",
      ".bbbbb.",
      ".b...b.",
      ".b.B.b.",
      ".b...b.",
      ".bbbbb.",
      ".......",
    ],
    palette: { b: "#0044cc", B: "#88ccff" },
  },
  peg_warp_3: {
    // Néon — rose flashy, halo
    grid: [
      ".......",
      "..ppp..",
      ".pnnnp.",
      ".pn.np.",
      ".pnnnp.",
      "..ppp..",
      ".......",
    ],
    palette: { p: "#cc0088", n: "#ff44cc" },
  },

  // ─── Bumper skins (7×7) ───────────────────────────────────────────────────
  decor_bumper_1: {
    // Classique — bleu arrondi, bevel
    grid: [
      ".bbbbb.",
      "bbbbbbb",
      "bbhhhbb",
      "bbh.hbb",
      "bbhhhbb",
      "bbbbbbb",
      ".bbbbb.",
    ],
    palette: { b: "#3355dd", h: "#6688ff" },
  },
  decor_bumper_2: {
    // Néon — rouge pulsant
    grid: [
      ".rrrrr.",
      "rrrrrrr",
      "rrHHHrr",
      "rrH.Hrr",
      "rrHHHrr",
      "rrrrrrr",
      ".rrrrr.",
    ],
    palette: { r: "#cc1133", H: "#ff6688" },
  },
  decor_bumper_3: {
    // Or — bumper doré, prestige
    grid: [
      ".ggggg.",
      "ggggggg",
      "ggGGGgg",
      "ggG.Ggg",
      "ggGGGgg",
      "ggggggg",
      ".ggggg.",
    ],
    palette: { g: "#cc8800", G: "#ffee44" },
  },

  // ─── Planche skins (7×7) ──────────────────────────────────────────────────
  decor_plank_1: {
    // Bois classique — marron, nœud visible
    grid: [
      ".......",
      "wwwwwww",
      "wnnnnww",
      "ww.www.",
      ".......",
      ".......",
      ".......",
    ],
    palette: { w: "#aa7733", n: "#884422" },
  },
  decor_plank_2: {
    // Métal — plaque d'acier grise
    grid: [
      ".......",
      "mmmmmmm",
      "mhhhhm.",
      "m.mmmm.",
      ".......",
      ".......",
      ".......",
    ],
    palette: { m: "#778899", h: "#aabbcc" },
  },
  decor_plank_3: {
    // Pierre — dalle de roc grise
    grid: [
      ".......",
      "sssssss",
      "sddddss",
      "ss.sss.",
      ".......",
      ".......",
      ".......",
    ],
    palette: { s: "#666677", d: "#888899" },
  },

  // ─── Arc skins (7×7) ──────────────────────────────────────────────────────
  decor_arc_1: {
    // Bois classique — courbe organique
    grid: [
      ".......",
      "w.....w",
      ".w...w.",
      "..www..",
      ".......",
      ".......",
      ".......",
    ],
    palette: { w: "#5544cc" },
  },
  decor_arc_2: {
    // Acier — arc métallique brillant
    grid: [
      ".......",
      "m.....m",
      ".mhhmm.",
      "..mmm..",
      ".......",
      ".......",
      ".......",
    ],
    palette: { m: "#667788", h: "#aabbcc" },
  },
  decor_arc_3: {
    // Néon — arc lumineux rose
    grid: [
      ".......",
      "p.....p",
      ".pnnnp.",
      "..ppp..",
      ".......",
      ".......",
      ".......",
    ],
    palette: { p: "#cc0088", n: "#ff88dd" },
  },

  // ─── Pointe skins (7×7) ───────────────────────────────────────────────────
  decor_spike_1: {
    // Classique — rouge tranchant
    grid: [
      "...r...",
      "...r...",
      "..rrr..",
      "..rrr..",
      ".rrrrr.",
      ".rrrrr.",
      "rrrrrrr",
    ],
    palette: { r: "#cc3355" },
  },
  decor_spike_2: {
    // Glace — pointe translucide bleue
    grid: [
      "...b...",
      "...b...",
      "..bib..",
      "..bib..",
      ".biiiib",
      ".bibib.",
      "bbbbbbb",
    ],
    palette: { b: "#3388cc", i: "#aaddff" },
  },
  decor_spike_3: {
    // Or — pointe dorée, précieux et dangereux
    grid: [
      "...g...",
      "...g...",
      "..gGg..",
      "..gGg..",
      ".gGGGg.",
      ".gGgGg.",
      "ggggggg",
    ],
    palette: { g: "#cc8800", G: "#ffdd44" },
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

  // ─── Décors ───────────────────────────────────────────────────────────────
  decor_bumper: {
    // Disque rond avec reflet central
    grid: [
      "...bbb...",
      "..bhhhb..",
      ".bhhhhhb.",
      "bhhhhhhhb",
      "bhhhhhhhb",
      "bhhhhhhhb",
      ".bhhhhhb.",
      "..bhhhb..",
      "...bbb...",
    ],
    palette: { b: "#224488", h: "#4477cc" },
  },
  decor_plank: {
    // Planche avec bevel (vue de dessus)
    grid: [
      "hhhhhhhhhhh",
      "bbbbbbbbbbb",
      "bbbbbbbbbbb",
      "bbbbbbbbbbb",
      "ddddddddddd",
    ],
    palette: { h: "#ddbb88", b: "#aa7733", d: "#553311" },
  },
  decor_arc: {
    // Arc en U ouvert vers le bas
    grid: [
      "b.......b",
      "b.......b",
      "b.......b",
      ".bb...bb.",
      "..bbbbb..",
      ".........",
    ],
    palette: { b: "#7766ee" },
  },
  decor_spike: {
    // Pointe triangulaire vers le haut
    grid: [
      "...b...",
      "..bbb..",
      "..bbb..",
      ".bbbbb.",
      ".bbbbb.",
      "bbbbbbb",
      "bbbbbbb",
      ".hhhhh.",
      ".......",
    ],
    palette: { b: "#cc3355", h: "#ff6677" },
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
