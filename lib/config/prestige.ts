import { BALANCE } from './balance';

export interface PrestigePermanentBonuses {
  globalProductionPct: number;
  rewardGainPct: number;
  comboRetentionPct: number;
  maxHpPct: number;
  maxManaPct: number;
  manaRegenPct: number;
  orbitDamagePct: number;
  cooldownReductionPct: number;
}

export const EMPTY_PRESTIGE_BONUSES: PrestigePermanentBonuses = {
  globalProductionPct: 0,
  rewardGainPct: 0,
  comboRetentionPct: 0,
  maxHpPct: 0,
  maxManaPct: 0,
  manaRegenPct: 0,
  orbitDamagePct: 0,
  cooldownReductionPct: 0,
};

export function prestigeShardGain(
  totalEarned: number,
  totalPrestiges: number,
  prestigeGainPct = 0,
  guaranteedShards = false,
) {
  const stageMult = 1 + Math.min(1.5, totalPrestiges * 0.04);
  const base = Math.floor(BALANCE.prestige.shardFormula(totalEarned) * stageMult * (1 + prestigeGainPct));
  return Math.max(guaranteedShards ? 5 : 0, base + (guaranteedShards ? 5 : 0));
}

export function prestigePermanentBonuses(totalPrestiges: number): PrestigePermanentBonuses {
  const count = Math.max(0, totalPrestiges);
  const early = Math.min(count, 10);
  const late = Math.max(0, count - early);
  const scaled = early + late * 0.6;
  return {
    globalProductionPct: Math.min(1.75, scaled * 0.05),
    rewardGainPct: Math.min(1.2, scaled * 0.032),
    comboRetentionPct: Math.min(0.6, scaled * 0.024),
    maxHpPct: Math.min(1.5, scaled * 0.045),
    maxManaPct: Math.min(1, scaled * 0.03),
    manaRegenPct: Math.min(0.9, scaled * 0.026),
    orbitDamagePct: Math.min(1, scaled * 0.034),
    cooldownReductionPct: Math.min(0.28, scaled * 0.008),
  };
}

export function nextPrestigeGainTarget(
  totalEarned: number,
  totalPrestiges: number,
  prestigeGainPct = 0,
  guaranteedShards = false,
) {
  const currentGain = prestigeShardGain(totalEarned, totalPrestiges, prestigeGainPct, guaranteedShards);
  const stageMult = 1 + Math.min(1.5, totalPrestiges * 0.04);
  const mult = stageMult * (1 + prestigeGainPct);
  const guaranteedOffset = guaranteedShards ? 5 : 0;
  const nextBaseGain = Math.max(1, currentGain - guaranteedOffset + 1);
  const nextTotalEarned = Math.ceil(Math.pow(nextBaseGain / Math.max(0.0001, mult), 2) * 20_000);
  const previousBaseGain = Math.max(0, currentGain - guaranteedOffset);
  const previousTotalEarned = Math.floor(Math.pow(previousBaseGain / Math.max(0.0001, mult), 2) * 20_000);
  const span = Math.max(1, nextTotalEarned - previousTotalEarned);
  const progress = Math.max(0, Math.min(1, (totalEarned - previousTotalEarned) / span));
  return { currentGain, nextGain: currentGain + 1, nextTotalEarned, progress };
}
