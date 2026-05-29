import type { ChapterId } from './chapters';

export type AscensionUpgradeId =
  | 'realityCompression'
  | 'eternalFlow'
  | 'weaponMutation'
  | 'cosmicMemory'
  | 'dimensionalPressure'
  | 'singularityStability';

export interface AscensionUpgradeDef {
  id: AscensionUpgradeId;
  i18nKey: AscensionUpgradeId;
  icon: string;
  accent: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
}

export interface AscensionContext {
  totalPrestiges: number;
  shards: number;
  bestBossTier: number;
  completedChapters: ChapterId[];
  claimedResearchCount: number;
  ownedBuildNodeCount: number;
  artifactCount: number;
}

export interface AscensionBonusSummary {
  globalProductionPct: number;
  passiveProductionPct: number;
  offlineEfficiencyPct: number;
  weaponEvolutionDamagePct: number;
  weaponEvolutionFireRatePct: number;
  retainedPrestigePct: number;
  retainedShardPct: number;
  eliteRewardPct: number;
  anomalyRewardPct: number;
  shardGainPct: number;
  instabilityReductionPct: number;
  damageReductionPct: number;
}

export const EMPTY_ASCENSION_BONUSES: AscensionBonusSummary = {
  globalProductionPct: 0,
  passiveProductionPct: 0,
  offlineEfficiencyPct: 0,
  weaponEvolutionDamagePct: 0,
  weaponEvolutionFireRatePct: 0,
  retainedPrestigePct: 0,
  retainedShardPct: 0,
  eliteRewardPct: 0,
  anomalyRewardPct: 0,
  shardGainPct: 0,
  instabilityReductionPct: 0,
  damageReductionPct: 0,
};

export const ASCENSION_UPGRADES: AscensionUpgradeDef[] = [
  { id: 'realityCompression', i18nKey: 'realityCompression', icon: '⟐', accent: '#ff5ce8', maxLevel: 5, baseCost: 1, costGrowth: 1.85 },
  { id: 'eternalFlow', i18nKey: 'eternalFlow', icon: '≋', accent: '#5cf6ff', maxLevel: 5, baseCost: 1, costGrowth: 1.75 },
  { id: 'weaponMutation', i18nKey: 'weaponMutation', icon: '✦', accent: '#ffd166', maxLevel: 5, baseCost: 2, costGrowth: 1.9 },
  { id: 'cosmicMemory', i18nKey: 'cosmicMemory', icon: '◈', accent: '#b87aff', maxLevel: 5, baseCost: 2, costGrowth: 1.9 },
  { id: 'dimensionalPressure', i18nKey: 'dimensionalPressure', icon: '⌁', accent: '#ff6b4a', maxLevel: 5, baseCost: 2, costGrowth: 1.85 },
  { id: 'singularityStability', i18nKey: 'singularityStability', icon: '⬡', accent: '#80fff4', maxLevel: 5, baseCost: 3, costGrowth: 1.8 },
];

export const REALITY_MODIFIER_HOOKS = [
  'enemySpeed',
  'hazardStrength',
  'healingPressure',
  'rewardAmplification',
  'anomalyFrequency',
] as const;

export function ascensionUpgradeById(id: string) {
  return ASCENSION_UPGRADES.find((upgrade) => upgrade.id === id);
}

export function ascensionUpgradeCost(id: AscensionUpgradeId, level: number) {
  const def = ascensionUpgradeById(id);
  if (!def) return Infinity;
  return Math.max(1, Math.ceil(def.baseCost * Math.pow(def.costGrowth, Math.max(0, level))));
}

export function ascensionUnlocked(ctx: AscensionContext) {
  return (
    ctx.completedChapters.includes('supernova') ||
    ctx.bestBossTier >= 230 ||
    ctx.totalPrestiges >= 25 ||
    ctx.shards >= 750
  );
}

export function ascensionPointGain(ctx: AscensionContext) {
  if (!ascensionUnlocked(ctx)) return 0;
  const prestigeScore = Math.sqrt(Math.max(0, ctx.totalPrestiges)) * 0.9;
  const shardScore = Math.sqrt(Math.max(0, ctx.shards)) / 7;
  const starScore = Math.max(0, ctx.bestBossTier - 100) / 32;
  const completionScore = ctx.completedChapters.includes('supernova') ? 4 : ctx.completedChapters.filter((id) => ['redDwarf', 'whiteDwarf', 'giantStar'].includes(id)).length;
  const systemScore = ctx.claimedResearchCount / 10 + ctx.ownedBuildNodeCount / 14 + ctx.artifactCount / 8;
  const raw = prestigeScore + shardScore + starScore + completionScore + systemScore;
  const softened = raw <= 35 ? raw : 35 + Math.sqrt(raw - 35) * 2.5;
  return Math.max(1, Math.min(120, Math.floor(softened)));
}

export function nextAscensionPointTarget(ctx: AscensionContext) {
  const current = ascensionPointGain(ctx);
  if (!ascensionUnlocked(ctx)) {
    return {
      current,
      progress: Math.max(
        ctx.bestBossTier / 230,
        ctx.totalPrestiges / 25,
        ctx.shards / 750,
      ),
    };
  }
  const nextGain = current + 1;
  const targetPrestiges = Math.ceil(nextGain * 5);
  return { current, nextGain, targetPrestiges, progress: Math.min(1, current / Math.max(1, nextGain)) };
}

export function summarizeAscensionBonuses(levels: Record<string, number> = {}): AscensionBonusSummary {
  const out = { ...EMPTY_ASCENSION_BONUSES };
  const level = (id: AscensionUpgradeId) => Math.max(0, Math.min(ASCENSION_UPGRADES.find((upgrade) => upgrade.id === id)?.maxLevel ?? 0, levels[id] ?? 0));

  const reality = level('realityCompression');
  out.globalProductionPct += reality * 0.065;

  const flow = level('eternalFlow');
  out.passiveProductionPct += flow * 0.075;
  out.offlineEfficiencyPct += flow * 0.07;

  const weapon = level('weaponMutation');
  out.weaponEvolutionDamagePct += weapon * 0.065;
  out.weaponEvolutionFireRatePct += weapon * 0.018;

  const memory = level('cosmicMemory');
  out.retainedPrestigePct += memory * 0.04;
  out.retainedShardPct += memory * 0.05;

  const pressure = level('dimensionalPressure');
  out.eliteRewardPct += pressure * 0.08;
  out.anomalyRewardPct += pressure * 0.08;
  out.shardGainPct += pressure * 0.045;

  const stability = level('singularityStability');
  out.instabilityReductionPct += stability * 0.08;
  out.damageReductionPct += stability * 0.025;

  return out;
}
