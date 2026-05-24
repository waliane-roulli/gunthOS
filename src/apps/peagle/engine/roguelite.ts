// ─── Green peg power-ups ────────────────────────────────────────────────────

export type GreenPowerupId = "multiball" | "spooky" | "extraball" | "magnet";

export interface GreenPowerup {
  id: GreenPowerupId;
  name: string;
  desc: string;
  color: string;
}

export const GREEN_POWERUPS: Record<GreenPowerupId, GreenPowerup> = {
  multiball:   { id: "multiball",   name: "Ponte Surprise",   desc: "L'aigle pond 2 œufs en plein vol. La physique est brisée. C'est voulu.",              color: "#ffcc44" },
  spooky:      { id: "spooky",      name: "Œuf Fantôme",      desc: "Si l'œuf tombe, l'aigle le rattrape dans son bec. Dignité zéro, résultat max.",     color: "#cc88ff" },
  extraball:   { id: "extraball",   name: "Œuf Bonus",        desc: "+1 œuf. L'aigle refuse d'expliquer d'où il vient.",                               color: "#00ffcc" },
  magnet:      { id: "magnet",      name: "Serres Aimantées", desc: "Attire l'œuf vers les cibles orange (5s). L'aigle a mangé un aimant, ça arrive.",   color: "#4488ff" },
};

// ─── Upgrades (between levels) ──────────────────────────────────────────────

export type UpgradeId =
  | "heavy_ball" | "ghost_ball" | "combo_hungry"
  | "extra_ball" | "recovery" | "bigger_ball" | "turbo_bomb"
  | "fever_forever" | "chain_master" | "lucky_spin" | "iron_will";

export interface Upgrade {
  id: UpgradeId;
  name: string;
  desc: string;
  category: "ball" | "score" | "utility";
  rarity: "common" | "rare" | "epic";
}

export const UPGRADES: Record<UpgradeId, Upgrade> = {
  heavy_ball:    { id: "heavy_ball",    name: "Œuf de Condor",    desc: "+30% de rebond. L'œuf pèse maintenant le poids des regrets d'un vautour.",         category: "ball",    rarity: "common" },
  ghost_ball:    { id: "ghost_ball",    name: "Âme Volatile",     desc: "Traverse la 1ère cible sans la compter ni la rebondir — mais elle explose quand même. L'aigle : présent mais flou.", category: "ball",    rarity: "rare"   },
  combo_hungry:  { id: "combo_hungry",  name: "Appétit de Buse",  desc: "Orange touchée juste après une autre orange : ×1.5 les points. La buse enchaîne, elle s'énerve, ça paye.", category: "score",   rarity: "common" },
  extra_ball:    { id: "extra_ball",    name: "Clutch de Ponte",  desc: "+1 œuf au démarrage de chaque niveau. L'aigle a pondu pendant la nuit, ne lui demandez pas comment.", category: "utility", rarity: "common" },
  recovery:      { id: "recovery",      name: "Migration Prudente", desc: "Finir un niveau avec +3 œufs en stock : +1 œuf bonus. Les oiseaux économes survivent l'hiver.", category: "utility", rarity: "common" },
  bigger_ball:   { id: "bigger_ball",   name: "Œuf XXL",          desc: "Rayon d'œuf +30%. Résultat d'une expérience gouvernementale sur les autruches.",    category: "ball",    rarity: "rare"   },
  turbo_bomb:    { id: "turbo_bomb",    name: "Plumage Explosif", desc: "Rayon d'explosion ×1.5. L'aigle a des complexes, alors il compense.",                 category: "score",   rarity: "rare"   },
  fever_forever: { id: "fever_forever", name: "Migration en Feu", desc: "Mode Fièvre déclenché dès 6 cibles orange restantes. L'aigle n'a jamais entendu parler de retraite.", category: "score",   rarity: "epic"   },
  chain_master:  { id: "chain_master",  name: "Maître du Nid",    desc: "+200pts par cible détruite en chaîne de bombes. L'aigle a passé un master en démolition industrielle.", category: "score",   rarity: "rare"   },
  lucky_spin:    { id: "lucky_spin",    name: "Grand Filet",      desc: "Panier +30% plus large. L'aigle a élargi son nid pour récupérer les œufs ratés. C'est du bon sens.", category: "utility", rarity: "common" },
  iron_will:     { id: "iron_will",     name: "Serres d'Acier",   desc: "1× par run : récupère 2 œufs au lieu de Game Over. L'aigle refuse la mort.",         category: "utility", rarity: "epic"   },
};

// ─── Relics (passives, accumulate during run) ────────────────────────────────

export type RelicId = "boomerang" | "scorpion" | "blessed_cursor" | "trophy" | "phoenix" | "cursed_luck";

export interface Relic {
  id: RelicId;
  name: string;
  desc: string;
  color: string;
}

export const RELICS: Record<RelicId, Relic> = {
  boomerang:      { id: "boomerang",      name: "Aile Élastique",   desc: "L'œuf rebondit 40% plus fort sur les murs. L'aigle s'est entraîné au squash.", color: "#ffaa44" },
  scorpion:       { id: "scorpion",       name: "Serres Venimeuses",desc: "Chaque bombe détruite donne +1 œuf. Synergie avec les scorpions inexpliquée.", color: "#ff6644" },
  blessed_cursor: { id: "blessed_cursor", name: "Vision d'Aigle",   desc: "Ligne de visée 60% plus longue. C'est d'où vient l'expression. Maintenant vous savez.", color: "#ffee88" },
  trophy:         { id: "trophy",         name: "Coupe du Nid",     desc: "Finir un niveau sans perdre d'œuf : +2 œufs. L'aigle collectionne les trophées qu'il n'a pas gagnés.", color: "#ffd700" },
  phoenix:        { id: "phoenix",        name: "Phénix Syndiqué",  desc: "1× par niveau : l'œuf renaît. Le phénix a un contrat de travail maintenant.", color: "#ff8800" },
  cursed_luck:    { id: "cursed_luck",    name: "Superstition Aviaire", desc: "Chaque 5e cible touchée : multiplicateur ×3. L'aigle évite les miroirs depuis 2003.", color: "#cc44ff" },
};

// ─── Classes ─────────────────────────────────────────────────────────────────

export type ClassId = "canonnier" | "alchimiste" | "sniper";

export interface PlayerClass {
  id: ClassId;
  name: string;
  desc: string;
  startBalls: number;
  startRelics: RelicId[];
  greenPowerupPool: GreenPowerupId[];
  noBombs: boolean;
  ballRadiusMult: number;
  aimStepsMult: number;
  flavorText: string;
}

export const CLASS_COLORS: Record<ClassId, string> = {
  canonnier: "#4488ff",
  alchimiste: "#cc44ff",
  sniper: "#44ffaa",
};

export const CLASSES: Record<ClassId, PlayerClass> = {
  canonnier: {
    id: "canonnier",
    name: "Pélican",
    desc: "+2 œufs par niveau. Pas de bombes — trop dangereux pour le bec.",
    startBalls: 12,
    startRelics: [],
    greenPowerupPool: ["multiball", "spooky", "extraball", "magnet"],
    noBombs: true,
    ballRadiusMult: 1,
    aimStepsMult: 1,
    flavorText: "Qui a besoin de précision quand on a une poche sous le bec ?",
  },
  alchimiste: {
    id: "alchimiste",
    name: "Corbeau",
    desc: "2 reliques aléatoires au départ. Les corbeaux volent les trucs brillants.",
    startBalls: 9,
    startRelics: [],
    greenPowerupPool: ["multiball", "spooky", "extraball", "magnet"],
    noBombs: false,
    ballRadiusMult: 1,
    aimStepsMult: 1,
    flavorText: "Le corbeau ne sait pas ce qu'il a volé. Il s'en fiche. Ça brille.",
  },
  sniper: {
    id: "sniper",
    name: "Faucon",
    desc: "Ligne de visée ×2. Petits œufs (−30%). Vision à 4K comme dans les docs.",
    startBalls: 10,
    startRelics: ["blessed_cursor"],
    greenPowerupPool: ["multiball", "extraball", "magnet", "spooky"],
    noBombs: false,
    ballRadiusMult: 0.7,
    aimStepsMult: 2,
    flavorText: "Le faucon n'a jamais raté une cible. On ne lui pose pas de questions.",
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

  return { classId, relics, upgrades: [], ironWillUsed: false };
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
