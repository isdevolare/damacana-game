export const BALANCE = {
  evolution: { thresholds: [0, 150, 700, 4000, 25000, 150000, 1000000] },
  combo: {
    window: 900,
    decay: 2600,
    baseMax: 15,
    masterMax: 25,
    step: 0.35,
  },
  boss: {
    hpBase: 10,
    hpScale: 1.7,
    hpLevelMult: 0.5,
    rewardBase: 20,
    rewardScale: 1.6,
    megaInterval: 5,
    shardChanceCap: 0.15,
    shardChancePerTier: 0.01,
  },
  prestige: {
    shardFormula: (totalEarned: number) =>
      Math.floor(Math.sqrt(totalEarned / 20000)),
    requiredLevelIdx: 6,
  },
  events: {
    baseIntervalMin: 60_000,
    baseIntervalMax: 120_000,
    magnetIntervalMin: 30_000,
    magnetIntervalMax: 60_000,
  },
  abilities: {
    voidBurst: { cooldown: 90_000, dmgMult: 50, dmcMult: 100 },
    flood: { cooldown: 60_000, duration: 10_000, mult: 10 },
    timeLoop: { cooldown: 120_000, replaySeconds: 15 },
  },
  crit: {
    baseChance: 0.0,
    critDropChance: 0.1,
    critMult: 5,
    voidClawCritMult: 10,
  },
  luckyTap: { interval: 10, mult: 5 },
};
