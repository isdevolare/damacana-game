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
    globalProductionPct: Math.min(0.75, scaled * 0.02),
    rewardGainPct: Math.min(0.5, scaled * 0.012),
    comboRetentionPct: Math.min(0.3, scaled * 0.01),
    maxHpPct: Math.min(0.6, scaled * 0.018),
    maxManaPct: Math.min(0.45, scaled * 0.012),
    manaRegenPct: Math.min(0.4, scaled * 0.01),
    orbitDamagePct: Math.min(0.45, scaled * 0.012),
    cooldownReductionPct: Math.min(0.16, scaled * 0.003),
  };
}
