import { BALANCE } from './balance';
import { bossPhaseHpMultiplier, bossPhaseRewardMultiplier } from './bossMissions';

export const BOSS_NAME_KEYS = [
  'faucetGhost',
  'droughtSpirit',
  'fifthBottleEntity',
  'custodianEmptyBottle',
  'fridgeShaman',
  'wellDjinn',
  'oceanEnvoy',
  'icebergJudge',
  'ancientBottleElder',
  'chlorineDwarf',
  'flowKing',
  'antiqueDamacanaLord',
  'voidDrinker',
  'transcendentBoss',
  'classificationError',
  'leakingMoon',
  'saturdayFoamBeast',
  'unstableDrip',
  'bossOfBosses',
  'unnamedLiquid',
] as const;

export type BossNameKey = (typeof BOSS_NAME_KEYS)[number];

export function bossNameKey(tier: number): BossNameKey {
  return BOSS_NAME_KEYS[(tier - 1) % BOSS_NAME_KEYS.length];
}

export function bossHp(tier: number, levelIdx: number): number {
  const { hpBase, hpScale, hpLevelMult } = BALANCE.boss;
  const safeTier = Number.isFinite(tier) ? Math.max(1, Math.floor(tier)) : 1;
  const safeLevel = Number.isFinite(levelIdx) ? Math.max(0, Math.floor(levelIdx)) : 0;
  const hp = hpBase * Math.pow(hpScale, safeTier - 1) * (1 + safeLevel * hpLevelMult) * bossPhaseHpMultiplier(safeTier);
  return Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number.isFinite(hp) ? hp : hpBase)));
}

export function bossReward(tier: number, levelIdx: number): number {
  const { rewardBase, rewardScale, hpLevelMult } = BALANCE.boss;
  const safeTier = Number.isFinite(tier) ? Math.max(1, Math.floor(tier)) : 1;
  const safeLevel = Number.isFinite(levelIdx) ? Math.max(0, Math.floor(levelIdx)) : 0;
  const reward = rewardBase * Math.pow(rewardScale, safeTier - 1) * (1 + safeLevel * hpLevelMult) * bossPhaseRewardMultiplier(safeTier);
  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number.isFinite(reward) ? reward : rewardBase)));
}

export function isMegaBoss(tier: number): boolean {
  return tier > 0 && tier % BALANCE.boss.megaInterval === 0;
}

export function shardDropChance(tier: number): number {
  if (tier <= 1) return 0;
  return Math.min(BALANCE.boss.shardChanceCap, tier * BALANCE.boss.shardChancePerTier);
}

// Elite bosses (★5 prestige unlock): 1.5× HP, guaranteed shard drop.
export const ELITE_HP_MULT = 1.5;

export function eliteBossHp(tier: number, levelIdx: number): number {
  return Math.floor(bossHp(tier, levelIdx) * ELITE_HP_MULT);
}
