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
