// ─── Green peg power-ups ────────────────────────────────────────────────────

export type GreenPowerupId = "multiball" | "spooky" | "extraball" | "pyromaniac" | "magnet";

export interface GreenPowerup {
  id: GreenPowerupId;
  name: string;
  desc: string;
  color: string;
  emoji: string;
}

export const GREEN_POWERUPS: Record<GreenPowerupId, GreenPowerup> = {
  multiball: { id: "multiball", name: "Multiball",    desc: "Spawne 2 balles supplémentaires",          color: "#ffcc44", emoji: "⚡" },
  spooky:    { id: "spooky",    name: "Spooky Ball",  desc: "La balle revient si elle tombe dans le vide", color: "#cc88ff", emoji: "👻" },
  extraball: { id: "extraball", name: "Balle Extra",  desc: "+1 balle dans la réserve",                 color: "#00ffcc", emoji: "🔮" },
  pyromaniac:{ id: "pyromaniac",name: "Pyromane",     desc: "Les pegs voisins deviennent des bombes",   color: "#ff6600", emoji: "🔥" },
  magnet:    { id: "magnet",    name: "Aimant",       desc: "Attire la balle vers les pegs orange (5s)",color: "#4488ff", emoji: "🧲" },
};

// ─── Upgrades (between levels) ──────────────────────────────────────────────

export type UpgradeId =
  | "heavy_ball" | "ghost_ball" | "combo_hungry" | "contamination"
  | "extra_ball" | "recovery" | "bigger_ball" | "turbo_bomb"
  | "fever_forever" | "chain_master" | "lucky_spin" | "iron_will";

export interface Upgrade {
  id: UpgradeId;
  name: string;
  desc: string;
  emoji: string;
  category: "ball" | "score" | "utility";
  rarity: "common" | "rare" | "epic";
}

export const UPGRADES: Record<UpgradeId, Upgrade> = {
  heavy_ball:    { id: "heavy_ball",    name: "Balle Lourde",      desc: "+30% de rebond sur les pegs",                        emoji: "⚫", category: "ball",    rarity: "common" },
  ghost_ball:    { id: "ghost_ball",    name: "Balle Fantôme",     desc: "Traverse le 1er peg sans rebondir",                  emoji: "👻", category: "ball",    rarity: "rare"   },
  combo_hungry:  { id: "combo_hungry",  name: "Combo Affamé",      desc: "Pegs orange ×1.5 si 2 orange consécutifs",           emoji: "🔥", category: "score",   rarity: "common" },
  contamination: { id: "contamination", name: "Contamination",     desc: "Voisins d'une bombe deviennent des bombes",           emoji: "☢️", category: "ball",    rarity: "rare"   },
  extra_ball:    { id: "extra_ball",    name: "+1 Balle",          desc: "+1 balle au début de chaque niveau",                 emoji: "🔮", category: "utility", rarity: "common" },
  recovery:      { id: "recovery",      name: "Récupération",      desc: "Finir un niveau avec >3 balles : +1 au stock",       emoji: "💊", category: "utility", rarity: "common" },
  bigger_ball:   { id: "bigger_ball",   name: "Grosse Bille",      desc: "Rayon de la balle +30%",                             emoji: "🎱", category: "ball",    rarity: "rare"   },
  turbo_bomb:    { id: "turbo_bomb",    name: "Turbo Bombe",       desc: "Rayon d'explosion des bombes ×1.5",                  emoji: "💥", category: "score",   rarity: "rare"   },
  fever_forever: { id: "fever_forever", name: "Fièvre Éternelle",  desc: "Mode Fièvre dès 6 pegs orange restants",             emoji: "🌡️", category: "score",   rarity: "epic"   },
  chain_master:  { id: "chain_master",  name: "Maître des Chaînes",desc: "+50pts par peg détruit dans une explosion",           emoji: "⛓️", category: "score",   rarity: "rare"   },
  lucky_spin:    { id: "lucky_spin",    name: "Spin Chanceux",     desc: "Le bucket se déplace 40% plus vite",                 emoji: "🍀", category: "utility", rarity: "common" },
  iron_will:     { id: "iron_will",     name: "Volonté de Fer",    desc: "1× par run : récupère 2 balles au lieu de Game Over",emoji: "🛡️", category: "utility", rarity: "epic"   },
};

// ─── Relics (passives, accumulate during run) ────────────────────────────────

export type RelicId = "boomerang" | "scorpion" | "blessed_cursor" | "trophy" | "phoenix" | "cursed_luck";

export interface Relic {
  id: RelicId;
  name: string;
  desc: string;
  emoji: string;
  color: string;
}

export const RELICS: Record<RelicId, Relic> = {
  boomerang:      { id: "boomerang",      name: "Boomerang",       desc: "La balle rebondit 40% plus fort sur les murs",           emoji: "🪃", color: "#ffaa44" },
  scorpion:       { id: "scorpion",       name: "Scorpion",        desc: "Chaque bomb peg détruit donne +1 balle",                 emoji: "🦂", color: "#ff6644" },
  blessed_cursor: { id: "blessed_cursor", name: "Curseur Béni",    desc: "Ligne de visée 60% plus longue",                        emoji: "✨", color: "#ffee88" },
  trophy:         { id: "trophy",         name: "Trophée",         desc: "Finir un niveau sans perdre de balle : +2 balles bonus", emoji: "🏆", color: "#ffd700" },
  phoenix:        { id: "phoenix",        name: "Phénix",          desc: "1× par niveau : la balle renaît si elle tombe",         emoji: "🔥", color: "#ff8800" },
  cursed_luck:    { id: "cursed_luck",    name: "Chance Maudite",  desc: "Chaque 5e peg touché : multiplicateur ×3",              emoji: "🎲", color: "#cc44ff" },
};

// ─── Classes ─────────────────────────────────────────────────────────────────

export type ClassId = "canonnier" | "alchimiste" | "sniper";

export interface PlayerClass {
  id: ClassId;
  name: string;
  desc: string;
  emoji: string;
  startBalls: number;
  startRelics: RelicId[];
  greenPowerupPool: GreenPowerupId[];
  noBombs: boolean;
  ballRadiusMult: number;
  aimStepsMult: number;
  flavorText: string;
}

export const CLASSES: Record<ClassId, PlayerClass> = {
  canonnier: {
    id: "canonnier",
    name: "Canonnier",
    desc: "+2 balles par niveau. Aucun peg bombe.",
    emoji: "🎯",
    startBalls: 12,
    startRelics: [],
    greenPowerupPool: ["multiball", "spooky", "extraball", "magnet"],
    noBombs: true,
    ballRadiusMult: 1,
    aimStepsMult: 1,
    flavorText: "La quantité est une qualité en soi.",
  },
  alchimiste: {
    id: "alchimiste",
    name: "Alchimiste",
    desc: "2 reliques aléatoires au départ. -1 balle par niveau.",
    emoji: "⚗️",
    startBalls: 9,
    startRelics: [],
    greenPowerupPool: ["multiball", "spooky", "extraball", "pyromaniac", "magnet"],
    noBombs: false,
    ballRadiusMult: 1,
    aimStepsMult: 1,
    flavorText: "Le chaos est une opportunité pour ceux qui savent l'exploiter.",
  },
  sniper: {
    id: "sniper",
    name: "Sniper",
    desc: "Ligne de visée ×2. Balles plus petites (−30%).",
    emoji: "🔭",
    startBalls: 10,
    startRelics: ["blessed_cursor"],
    greenPowerupPool: ["multiball", "extraball", "magnet", "spooky"],
    noBombs: false,
    ballRadiusMult: 0.7,
    aimStepsMult: 2,
    flavorText: "Un seul tir bien placé vaut mieux que cent au hasard.",
  },
};

// ─── Run state (persists across levels in a run) ─────────────────────────────

export interface RunState {
  classId: ClassId;
  relics: RelicId[];
  upgrades: UpgradeId[];
  ironWillUsed: boolean;
}

export function makeInitialRunState(classId: ClassId): RunState {
  const cls = CLASSES[classId]!;
  const relics: RelicId[] = [...cls.startRelics];

  if (classId === "alchimiste") {
    const all = Object.keys(RELICS) as RelicId[];
    const pool = all.filter(r => !relics.includes(r)).sort(() => Math.random() - 0.5);
    relics.push(...pool.slice(0, 2));
  }

  return {
    classId,
    relics,
    upgrades: [],
    ironWillUsed: false,
  };
}

// ─── Upgrade offer generation ────────────────────────────────────────────────

export function generateUpgradeOffer(existing: UpgradeId[], bossKilled: boolean): UpgradeId[] {
  const all = Object.keys(UPGRADES) as UpgradeId[];
  const notOwned = all.filter(id => !existing.includes(id));

  const weighted: UpgradeId[] = [];
  for (const id of notOwned) {
    const u = UPGRADES[id]!;
    const w = u.rarity === "common" ? 4 : u.rarity === "rare" ? 2 : 1;
    for (let i = 0; i < w; i++) weighted.push(id);
  }

  const result: UpgradeId[] = [];
  const seen = new Set<UpgradeId>();

  // Boss killed → guarantee one epic if available
  if (bossKilled) {
    const epics = notOwned.filter(id => UPGRADES[id]!.rarity === "epic");
    if (epics.length > 0) {
      const pick = epics[Math.floor(Math.random() * epics.length)]!;
      result.push(pick);
      seen.add(pick);
    }
  }

  const shuffled = [...weighted].sort(() => Math.random() - 0.5);
  for (const id of shuffled) {
    if (result.length >= 3) break;
    if (!seen.has(id)) { result.push(id); seen.add(id); }
  }

  // Fill from non-owned if not enough (avoids offering already-owned upgrades)
  if (result.length < 3) {
    for (const id of notOwned.sort(() => Math.random() - 0.5)) {
      if (result.length >= 3) break;
      if (!seen.has(id)) { result.push(id); seen.add(id); }
    }
  }

  return result.slice(0, 3);
}

export function isBossLevel(level: number): boolean {
  return level % 3 === 0;
}
