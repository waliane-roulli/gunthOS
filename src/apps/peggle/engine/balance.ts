export const BALANCE = {
  magnet: {
    force: 0.06,
    duration: 300,
  },
  multiball: {
    spreadAngle: 0.22,
    launchSpread: 0.13,
  },
  combo: {
    interval: 3,
  },
  wall: {
    traumaPerHit: 0.06,
  },
  peg: {
    ghostCooldown: 20,
    armorCooldown: 12,
    warpCooldown: 20,
    armorScale: 1.5,
    bossArmorScale: 1.6,
    popStartAlpha: 0.25,
    popStartScale: 1.7,
  },
  score: {
    warpBase: 30,
    orangeBase: 100,
    greenBase: 50,
    normalBase: 10,
    bossKill: 5000,
    bossBallBonus: 2,
    ballBonus: 1000,
  },
  trauma: {
    wall: 0.06,
    armorPeg: 0.12,
    bossArmorPeg: 0.22,
    normalPeg: 0.08,
    orangePeg: 0.35,
    bossPeg: 0.9,
    bucketCatch: 0.15,
    bonusBucketCatch: 0.2,
    phoenixSave: 0.3,
  },
  flash: {
    warpPeg: 0.3,
    bossArmorPeg: 0.35,
    orangePeg: 0.5,
    bossPeg: 1.0,
    greenPeg: 0.4,
    spookySave: 0.45,
    phoenixSave: 0.6,
    ironWill: 0.8,
  },
  cursedLuck: {
    hitInterval: 5,
    multiplier: 3,
  },
  particles: {
    maxCount: 200,
  },
  phoenix: {
    reboundSpeed: 0.65,
    vxDamp: 0.5,
    yReset: 58,
  },
  spooky: {
    reboundSpeed: 0.65,
    vxDamp: 0.5,
    yReset: 58,
  },
} as const;
