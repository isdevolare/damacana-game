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

const shard = (amount: number): BuildCost => ({ currency: 'shards', amount });

export const BUILD_TREE: BuildNode[] = [
  { id: 'comboPrimer', branch: 'combo', tier: 1, i18nKey: 'comboPrimer', cost: shard(4), bonuses: [{ type: 'comboGainPct', value: 0.28 }] },
  { id: 'heldRhythm', branch: 'combo', tier: 2, i18nKey: 'heldRhythm', cost: shard(12), bonuses: [{ type: 'comboDecayPct', value: 0.24 }] },
  { id: 'ruptureFocus', branch: 'combo', tier: 3, i18nKey: 'ruptureFocus', cost: shard(35), bonuses: [{ type: 'weakPointDamagePct', value: 0.42 }] },
  { id: 'impactMemory', branch: 'combo', tier: 4, i18nKey: 'impactMemory', cost: shard(110), bonuses: [{ type: 'damageComboPreservePct', value: 0.42 }] },
  { id: 'chainConductor', branch: 'combo', tier: 5, i18nKey: 'chainConductor', cost: shard(360), bonuses: [{ type: 'comboGainPct', value: 0.42 }, { type: 'comboDecayPct', value: 0.22 }] },
  { id: 'criticalCascade', branch: 'combo', tier: 6, i18nKey: 'criticalCascade', cost: shard(900), bonuses: [{ type: 'weakPointDamagePct', value: 0.72 }] },

  { id: 'denseCore', branch: 'tank', tier: 1, i18nKey: 'denseCore', cost: shard(4), bonuses: [{ type: 'maxHpPct', value: 0.32 }] },
  { id: 'mineralShell', branch: 'tank', tier: 2, i18nKey: 'mineralShell', cost: shard(12), bonuses: [{ type: 'armor', value: 9 }] },
  { id: 'slowBleed', branch: 'tank', tier: 3, i18nKey: 'slowBleed', cost: shard(35), bonuses: [{ type: 'hpRegenPct', value: 0.55 }] },
  { id: 'pulseInsulation', branch: 'tank', tier: 4, i18nKey: 'pulseInsulation', cost: shard(110), bonuses: [{ type: 'damageReductionPct', value: 0.14 }] },
  { id: 'recoveryField', branch: 'tank', tier: 5, i18nKey: 'recoveryField', cost: shard(360), bonuses: [{ type: 'collapseRecoveryMs', value: 2500 }] },
  { id: 'planetaryCore', branch: 'tank', tier: 6, i18nKey: 'planetaryCore', cost: shard(900), bonuses: [{ type: 'maxHpPct', value: 0.55 }, { type: 'armor', value: 16 }] },

  { id: 'orbitEdge', branch: 'orbit', tier: 1, i18nKey: 'orbitEdge', cost: shard(4), bonuses: [{ type: 'orbitDamagePct', value: 0.34 }] },
  { id: 'wideSlash', branch: 'orbit', tier: 2, i18nKey: 'wideSlash', cost: shard(12), bonuses: [{ type: 'orbitSlashRadiusPct', value: 0.32 }] },
  { id: 'clearanceWave', branch: 'orbit', tier: 3, i18nKey: 'clearanceWave', cost: shard(35), bonuses: [{ type: 'aoeDamagePct', value: 0.42 }] },
  { id: 'gravityDrag', branch: 'orbit', tier: 4, i18nKey: 'gravityDrag', cost: shard(110), bonuses: [{ type: 'orbitSlowPct', value: 0.25 }] },
  { id: 'calibratedRing', branch: 'orbit', tier: 5, i18nKey: 'calibratedRing', cost: shard(360), bonuses: [{ type: 'orbitDamagePct', value: 0.55 }] },
  { id: 'debrisStorm', branch: 'orbit', tier: 6, i18nKey: 'debrisStorm', cost: shard(900), bonuses: [{ type: 'orbitSlashRadiusPct', value: 0.48 }, { type: 'aoeDamagePct', value: 0.5 }] },

  { id: 'voidReceiver', branch: 'void', tier: 1, i18nKey: 'voidReceiver', cost: shard(4), bonuses: [{ type: 'anomalyFrequencyPct', value: 0.26 }] },
  { id: 'fractureLuck', branch: 'void', tier: 2, i18nKey: 'fractureLuck', cost: shard(12), bonuses: [{ type: 'shardGainPct', value: 0.28 }] },
  { id: 'unstableHarvest', branch: 'void', tier: 3, i18nKey: 'unstableHarvest', cost: shard(35), bonuses: [{ type: 'unstableRewardPct', value: 0.34 }, { type: 'enemyAggressionPct', value: 0.06 }] },
  { id: 'corruptedLens', branch: 'void', tier: 4, i18nKey: 'corruptedLens', cost: shard(110), bonuses: [{ type: 'anomalyFrequencyPct', value: 0.36 }, { type: 'enemyAggressionPct', value: 0.06 }] },
  { id: 'shardMagnetism', branch: 'void', tier: 5, i18nKey: 'shardMagnetism', cost: shard(360), bonuses: [{ type: 'shardGainPct', value: 0.48 }] },
  { id: 'riskEngine', branch: 'void', tier: 6, i18nKey: 'riskEngine', cost: shard(900), bonuses: [{ type: 'unstableRewardPct', value: 0.58 }, { type: 'enemyAggressionPct', value: 0.1 }] },

  { id: 'quietPump', branch: 'flow', tier: 1, i18nKey: 'quietPump', cost: shard(4), bonuses: [{ type: 'passiveProductionPct', value: 0.3 }] },
  { id: 'nightShift', branch: 'flow', tier: 2, i18nKey: 'nightShift', cost: shard(12), bonuses: [{ type: 'offlineEfficiencyPct', value: 0.32 }] },
  { id: 'cleanChannel', branch: 'flow', tier: 3, i18nKey: 'cleanChannel', cost: shard(35), bonuses: [{ type: 'manaRegenPct', value: 0.32 }] },
  { id: 'coolantLoop', branch: 'flow', tier: 4, i18nKey: 'coolantLoop', cost: shard(110), bonuses: [{ type: 'cooldownReductionPct', value: 0.18 }] },
  { id: 'pressurePipeline', branch: 'flow', tier: 5, i18nKey: 'pressurePipeline', cost: shard(360), bonuses: [{ type: 'passiveProductionPct', value: 0.52 }] },
  { id: 'deepReservoir', branch: 'flow', tier: 6, i18nKey: 'deepReservoir', cost: shard(900), bonuses: [{ type: 'offlineEfficiencyPct', value: 0.5 }, { type: 'manaRegenPct', value: 0.34 }] },
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

export function buildTreeSurchargeMultiplier(ownedCount: number): number {
  if (ownedCount >= 18) return 4;
  if (ownedCount >= 12) return 2.5;
  if (ownedCount >= 8) return 1.75;
  if (ownedCount >= 4) return 1.25;
  return 1;
}

export function buildNodeCost(node: BuildNode, ownedCount: number): BuildCost {
  return {
    currency: node.cost.currency,
    amount: Math.ceil(node.cost.amount * buildTreeSurchargeMultiplier(ownedCount)),
  };
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
