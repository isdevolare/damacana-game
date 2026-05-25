export type BuildBranch = 'combo' | 'tank' | 'orbit' | 'void' | 'flow';
export type BuildCurrency = 'damacana' | 'shards';
export type BuildBonusType =
  | 'comboGainPct'
  | 'comboDecayPct'
  | 'weakPointDamagePct'
  | 'damageComboPreservePct'
  | 'maxHpPct'
  | 'armor'
  | 'hpRegenPct'
  | 'damageReductionPct'
  | 'collapseRecoveryMs'
  | 'orbitDamagePct'
  | 'orbitSlashRadiusPct'
  | 'aoeDamagePct'
  | 'orbitSlowPct'
  | 'anomalyFrequencyPct'
  | 'shardGainPct'
  | 'unstableRewardPct'
  | 'enemyAggressionPct'
  | 'passiveProductionPct'
  | 'offlineEfficiencyPct'
  | 'manaRegenPct'
  | 'cooldownReductionPct';

export interface BuildCost {
  currency: BuildCurrency;
  amount: number;
}

export interface BuildNode {
  id: string;
  branch: BuildBranch;
  tier: number;
  i18nKey: string;
  cost: BuildCost;
  bonuses: Array<{ type: BuildBonusType; value: number }>;
}

export interface BuildBranchMeta {
  id: BuildBranch;
  i18nKey: string;
  accent: string;
  symbol: string;
}

export interface BuildBonusSummary {
  comboGainPct: number;
  comboDecayPct: number;
  weakPointDamagePct: number;
  damageComboPreservePct: number;
  maxHpPct: number;
  armor: number;
  hpRegenPct: number;
  damageReductionPct: number;
  collapseRecoveryMs: number;
  orbitDamagePct: number;
  orbitSlashRadiusPct: number;
  aoeDamagePct: number;
  orbitSlowPct: number;
  anomalyFrequencyPct: number;
  shardGainPct: number;
  unstableRewardPct: number;
  enemyAggressionPct: number;
  passiveProductionPct: number;
  offlineEfficiencyPct: number;
  manaRegenPct: number;
  cooldownReductionPct: number;
}

export interface BuildUnlockContext {
  bossTier: number;
  totalPrestiges: number;
}

export const EMPTY_BUILD_BONUSES: BuildBonusSummary = {
  comboGainPct: 0,
  comboDecayPct: 0,
  weakPointDamagePct: 0,
  damageComboPreservePct: 0,
  maxHpPct: 0,
  armor: 0,
  hpRegenPct: 0,
  damageReductionPct: 0,
  collapseRecoveryMs: 0,
  orbitDamagePct: 0,
  orbitSlashRadiusPct: 0,
  aoeDamagePct: 0,
  orbitSlowPct: 0,
  anomalyFrequencyPct: 0,
  shardGainPct: 0,
  unstableRewardPct: 0,
  enemyAggressionPct: 0,
  passiveProductionPct: 0,
  offlineEfficiencyPct: 0,
  manaRegenPct: 0,
  cooldownReductionPct: 0,
};

export const BUILD_BRANCHES: BuildBranchMeta[] = [
  { id: 'combo', i18nKey: 'combo', accent: '#ffd166', symbol: '×' },
  { id: 'tank', i18nKey: 'tank', accent: '#5cf6ff', symbol: '⬢' },
  { id: 'orbit', i18nKey: 'orbit', accent: '#ff5ce8', symbol: '◌' },
  { id: 'void', i18nKey: 'void', accent: '#b87aff', symbol: '◇' },
  { id: 'flow', i18nKey: 'flow', accent: '#80fff4', symbol: '≈' },
];

const dmc = (amount: number): BuildCost => ({ currency: 'damacana', amount });
const shard = (amount: number): BuildCost => ({ currency: 'shards', amount });

export const BUILD_TREE: BuildNode[] = [
  { id: 'comboPrimer', branch: 'combo', tier: 1, i18nKey: 'comboPrimer', cost: dmc(600), bonuses: [{ type: 'comboGainPct', value: 0.18 }] },
  { id: 'heldRhythm', branch: 'combo', tier: 2, i18nKey: 'heldRhythm', cost: dmc(4000), bonuses: [{ type: 'comboDecayPct', value: 0.16 }] },
  { id: 'ruptureFocus', branch: 'combo', tier: 3, i18nKey: 'ruptureFocus', cost: dmc(18000), bonuses: [{ type: 'weakPointDamagePct', value: 0.26 }] },
  { id: 'impactMemory', branch: 'combo', tier: 4, i18nKey: 'impactMemory', cost: shard(3), bonuses: [{ type: 'damageComboPreservePct', value: 0.28 }] },
  { id: 'chainConductor', branch: 'combo', tier: 5, i18nKey: 'chainConductor', cost: shard(7), bonuses: [{ type: 'comboGainPct', value: 0.26 }, { type: 'comboDecayPct', value: 0.12 }] },
  { id: 'criticalCascade', branch: 'combo', tier: 6, i18nKey: 'criticalCascade', cost: shard(14), bonuses: [{ type: 'weakPointDamagePct', value: 0.4 }] },

  { id: 'denseCore', branch: 'tank', tier: 1, i18nKey: 'denseCore', cost: dmc(600), bonuses: [{ type: 'maxHpPct', value: 0.18 }] },
  { id: 'mineralShell', branch: 'tank', tier: 2, i18nKey: 'mineralShell', cost: dmc(4000), bonuses: [{ type: 'armor', value: 4 }] },
  { id: 'slowBleed', branch: 'tank', tier: 3, i18nKey: 'slowBleed', cost: dmc(18000), bonuses: [{ type: 'hpRegenPct', value: 0.35 }] },
  { id: 'pulseInsulation', branch: 'tank', tier: 4, i18nKey: 'pulseInsulation', cost: shard(3), bonuses: [{ type: 'damageReductionPct', value: 0.08 }] },
  { id: 'recoveryField', branch: 'tank', tier: 5, i18nKey: 'recoveryField', cost: shard(7), bonuses: [{ type: 'collapseRecoveryMs', value: 1600 }] },
  { id: 'planetaryCore', branch: 'tank', tier: 6, i18nKey: 'planetaryCore', cost: shard(14), bonuses: [{ type: 'maxHpPct', value: 0.28 }, { type: 'armor', value: 6 }] },

  { id: 'orbitEdge', branch: 'orbit', tier: 1, i18nKey: 'orbitEdge', cost: dmc(600), bonuses: [{ type: 'orbitDamagePct', value: 0.2 }] },
  { id: 'wideSlash', branch: 'orbit', tier: 2, i18nKey: 'wideSlash', cost: dmc(4000), bonuses: [{ type: 'orbitSlashRadiusPct', value: 0.2 }] },
  { id: 'clearanceWave', branch: 'orbit', tier: 3, i18nKey: 'clearanceWave', cost: dmc(18000), bonuses: [{ type: 'aoeDamagePct', value: 0.24 }] },
  { id: 'gravityDrag', branch: 'orbit', tier: 4, i18nKey: 'gravityDrag', cost: shard(3), bonuses: [{ type: 'orbitSlowPct', value: 0.16 }] },
  { id: 'calibratedRing', branch: 'orbit', tier: 5, i18nKey: 'calibratedRing', cost: shard(7), bonuses: [{ type: 'orbitDamagePct', value: 0.3 }] },
  { id: 'debrisStorm', branch: 'orbit', tier: 6, i18nKey: 'debrisStorm', cost: shard(14), bonuses: [{ type: 'orbitSlashRadiusPct', value: 0.3 }, { type: 'aoeDamagePct', value: 0.28 }] },

  { id: 'voidReceiver', branch: 'void', tier: 1, i18nKey: 'voidReceiver', cost: dmc(600), bonuses: [{ type: 'anomalyFrequencyPct', value: 0.16 }] },
  { id: 'fractureLuck', branch: 'void', tier: 2, i18nKey: 'fractureLuck', cost: dmc(4000), bonuses: [{ type: 'shardGainPct', value: 0.16 }] },
  { id: 'unstableHarvest', branch: 'void', tier: 3, i18nKey: 'unstableHarvest', cost: dmc(18000), bonuses: [{ type: 'unstableRewardPct', value: 0.2 }, { type: 'enemyAggressionPct', value: 0.06 }] },
  { id: 'corruptedLens', branch: 'void', tier: 4, i18nKey: 'corruptedLens', cost: shard(3), bonuses: [{ type: 'anomalyFrequencyPct', value: 0.22 }, { type: 'enemyAggressionPct', value: 0.06 }] },
  { id: 'shardMagnetism', branch: 'void', tier: 5, i18nKey: 'shardMagnetism', cost: shard(7), bonuses: [{ type: 'shardGainPct', value: 0.28 }] },
  { id: 'riskEngine', branch: 'void', tier: 6, i18nKey: 'riskEngine', cost: shard(14), bonuses: [{ type: 'unstableRewardPct', value: 0.32 }, { type: 'enemyAggressionPct', value: 0.1 }] },

  { id: 'quietPump', branch: 'flow', tier: 1, i18nKey: 'quietPump', cost: dmc(600), bonuses: [{ type: 'passiveProductionPct', value: 0.18 }] },
  { id: 'nightShift', branch: 'flow', tier: 2, i18nKey: 'nightShift', cost: dmc(4000), bonuses: [{ type: 'offlineEfficiencyPct', value: 0.18 }] },
  { id: 'cleanChannel', branch: 'flow', tier: 3, i18nKey: 'cleanChannel', cost: dmc(18000), bonuses: [{ type: 'manaRegenPct', value: 0.18 }] },
  { id: 'coolantLoop', branch: 'flow', tier: 4, i18nKey: 'coolantLoop', cost: shard(3), bonuses: [{ type: 'cooldownReductionPct', value: 0.11 }] },
  { id: 'pressurePipeline', branch: 'flow', tier: 5, i18nKey: 'pressurePipeline', cost: shard(7), bonuses: [{ type: 'passiveProductionPct', value: 0.28 }] },
  { id: 'deepReservoir', branch: 'flow', tier: 6, i18nKey: 'deepReservoir', cost: shard(14), bonuses: [{ type: 'offlineEfficiencyPct', value: 0.28 }, { type: 'manaRegenPct', value: 0.18 }] },
];

export function buildNodeById(id: string) {
  return BUILD_TREE.find((node) => node.id === id);
}

export function buildNodesOfBranch(branch: BuildBranch) {
  return BUILD_TREE.filter((node) => node.branch === branch).sort((a, b) => a.tier - b.tier);
}

export function previousBuildNode(node: BuildNode) {
  if (node.tier <= 1) return undefined;
  return BUILD_TREE.find((candidate) => candidate.branch === node.branch && candidate.tier === node.tier - 1);
}

export function buildTierUnlocked(tier: number, ctx: BuildUnlockContext): boolean {
  if (tier <= 1) return ctx.bossTier >= 26 || ctx.totalPrestiges >= 1;
  if (tier === 2) return ctx.bossTier >= 30 || ctx.totalPrestiges >= 1;
  if (tier === 3) return ctx.bossTier >= 35 || ctx.totalPrestiges >= 1;
  if (tier === 4) return ctx.bossTier >= 46 || ctx.totalPrestiges >= 1;
  if (tier === 5) return ctx.bossTier >= 53 || ctx.totalPrestiges >= 2;
  return ctx.bossTier >= 71 || ctx.totalPrestiges >= 3;
}

export function buildTierRequirementKey(tier: number): string {
  if (tier <= 1) return 'requirements.tier1';
  if (tier === 2) return 'requirements.tier2';
  if (tier === 3) return 'requirements.tier3';
  if (tier === 4) return 'requirements.tier4';
  if (tier === 5) return 'requirements.tier5';
  return 'requirements.tier6';
}

export function summarizeBuildBonuses(ids: string[]): BuildBonusSummary {
  const out = { ...EMPTY_BUILD_BONUSES };
  for (const id of ids) {
    const node = buildNodeById(id);
    if (!node) continue;
    for (const bonus of node.bonuses) {
      out[bonus.type] += bonus.value;
    }
  }
  return out;
}
