export type ArtifactRarity = 'common' | 'rare' | 'epic' | 'corrupted' | 'cosmic';
export type ArtifactScope = 'run' | 'permanent';
export type ArtifactSource =
  | 'bossPhase'
  | 'chapterClear'
  | 'eliteWave'
  | 'anomalyWave'
  | 'corruptedEvent'
  | 'singularityEvent';

export type ArtifactBonusType =
  | 'comboGainPct'
  | 'weakPointDamagePct'
  | 'orbitDamagePct'
  | 'orbitRadiusPct'
  | 'projectileFireRatePct'
  | 'extraProjectileChancePct'
  | 'maxHpPct'
  | 'damageReductionPct'
  | 'manaRegenPct'
  | 'cooldownReductionPct'
  | 'anomalyRewardPct'
  | 'shardChancePct'
  | 'passiveProductionPct'
  | 'offlineEfficiencyPct'
  | 'enemyDamagePct'
  | 'bossPulseDamagePct';

export interface ArtifactBonus {
  type: ArtifactBonusType;
  value: number;
}

export interface ArtifactDef {
  id: string;
  i18nKey: string;
  rarity: ArtifactRarity;
  scope: ArtifactScope;
  category: 'combo' | 'orbit' | 'projectile' | 'tank' | 'mana' | 'void' | 'flow';
  maxLevel: number;
  bonuses: ArtifactBonus[];
  sourceWeight: Partial<Record<ArtifactSource, number>>;
}

export interface OwnedArtifact {
  id: string;
  level: number;
  source: ArtifactSource;
  acquiredAt: number;
}

export type ArtifactBonusSummary = Record<ArtifactBonusType, number>;

export const EMPTY_ARTIFACT_BONUSES: ArtifactBonusSummary = {
  comboGainPct: 0,
  weakPointDamagePct: 0,
  orbitDamagePct: 0,
  orbitRadiusPct: 0,
  projectileFireRatePct: 0,
  extraProjectileChancePct: 0,
  maxHpPct: 0,
  damageReductionPct: 0,
  manaRegenPct: 0,
  cooldownReductionPct: 0,
  anomalyRewardPct: 0,
  shardChancePct: 0,
  passiveProductionPct: 0,
  offlineEfficiencyPct: 0,
  enemyDamagePct: 0,
  bossPulseDamagePct: 0,
};

export const ARTIFACTS: ArtifactDef[] = [
  {
    id: 'fracturedCore',
    i18nKey: 'fracturedCore',
    rarity: 'common',
    scope: 'run',
    category: 'combo',
    maxLevel: 5,
    bonuses: [{ type: 'comboGainPct', value: 0.18 }],
    sourceWeight: { bossPhase: 12, eliteWave: 10, anomalyWave: 7 },
  },
  {
    id: 'ruptureLens',
    i18nKey: 'ruptureLens',
    rarity: 'rare',
    scope: 'run',
    category: 'combo',
    maxLevel: 5,
    bonuses: [{ type: 'weakPointDamagePct', value: 0.24 }],
    sourceWeight: { bossPhase: 7, chapterClear: 8, eliteWave: 7, anomalyWave: 8 },
  },
  {
    id: 'saturnRingFragment',
    i18nKey: 'saturnRingFragment',
    rarity: 'epic',
    scope: 'run',
    category: 'orbit',
    maxLevel: 5,
    bonuses: [{ type: 'orbitDamagePct', value: 0.32 }],
    sourceWeight: { chapterClear: 5, eliteWave: 4, anomalyWave: 6 },
  },
  {
    id: 'gravityLoop',
    i18nKey: 'gravityLoop',
    rarity: 'rare',
    scope: 'permanent',
    category: 'orbit',
    maxLevel: 5,
    bonuses: [{ type: 'orbitRadiusPct', value: 0.16 }],
    sourceWeight: { chapterClear: 5, anomalyWave: 3, singularityEvent: 4 },
  },
  {
    id: 'marsSpark',
    i18nKey: 'marsSpark',
    rarity: 'common',
    scope: 'run',
    category: 'projectile',
    maxLevel: 5,
    bonuses: [{ type: 'projectileFireRatePct', value: 0.13 }],
    sourceWeight: { bossPhase: 12, eliteWave: 9, anomalyWave: 6 },
  },
  {
    id: 'splitCurrent',
    i18nKey: 'splitCurrent',
    rarity: 'cosmic',
    scope: 'run',
    category: 'projectile',
    maxLevel: 5,
    bonuses: [{ type: 'extraProjectileChancePct', value: 0.11 }],
    sourceWeight: { chapterClear: 4, eliteWave: 4, anomalyWave: 6, corruptedEvent: 3 },
  },
  {
    id: 'denseCoreArtifact',
    i18nKey: 'denseCore',
    rarity: 'common',
    scope: 'permanent',
    category: 'tank',
    maxLevel: 5,
    bonuses: [{ type: 'maxHpPct', value: 0.16 }],
    sourceWeight: { bossPhase: 5, chapterClear: 8, eliteWave: 5 },
  },
  {
    id: 'shieldSeed',
    i18nKey: 'shieldSeed',
    rarity: 'rare',
    scope: 'permanent',
    category: 'tank',
    maxLevel: 5,
    bonuses: [{ type: 'damageReductionPct', value: 0.06 }],
    sourceWeight: { chapterClear: 5, eliteWave: 5, anomalyWave: 4 },
  },
  {
    id: 'manaPrism',
    i18nKey: 'manaPrism',
    rarity: 'rare',
    scope: 'run',
    category: 'mana',
    maxLevel: 5,
    bonuses: [{ type: 'manaRegenPct', value: 0.2 }],
    sourceWeight: { bossPhase: 7, eliteWave: 7, anomalyWave: 7 },
  },
  {
    id: 'cooldownShard',
    i18nKey: 'cooldownShard',
    rarity: 'epic',
    scope: 'permanent',
    category: 'mana',
    maxLevel: 5,
    bonuses: [{ type: 'cooldownReductionPct', value: 0.1 }],
    sourceWeight: { chapterClear: 4, anomalyWave: 5, singularityEvent: 4 },
  },
  {
    id: 'voidThread',
    i18nKey: 'voidThread',
    rarity: 'corrupted',
    scope: 'run',
    category: 'void',
    maxLevel: 5,
    bonuses: [
      { type: 'anomalyRewardPct', value: 0.25 },
      { type: 'enemyDamagePct', value: 0.07 },
    ],
    sourceWeight: { anomalyWave: 8, corruptedEvent: 8, singularityEvent: 5 },
  },
  {
    id: 'blackSignal',
    i18nKey: 'blackSignal',
    rarity: 'corrupted',
    scope: 'permanent',
    category: 'void',
    maxLevel: 5,
    bonuses: [
      { type: 'shardChancePct', value: 0.14 },
      { type: 'bossPulseDamagePct', value: 0.08 },
    ],
    sourceWeight: { anomalyWave: 4, corruptedEvent: 7, singularityEvent: 7 },
  },
  {
    id: 'silentPump',
    i18nKey: 'silentPump',
    rarity: 'common',
    scope: 'permanent',
    category: 'flow',
    maxLevel: 5,
    bonuses: [{ type: 'passiveProductionPct', value: 0.18 }],
    sourceWeight: { bossPhase: 6, chapterClear: 8, eliteWave: 5 },
  },
  {
    id: 'nightReservoirArtifact',
    i18nKey: 'nightReservoir',
    rarity: 'rare',
    scope: 'permanent',
    category: 'flow',
    maxLevel: 5,
    bonuses: [{ type: 'offlineEfficiencyPct', value: 0.16 }],
    sourceWeight: { chapterClear: 5, anomalyWave: 4, singularityEvent: 4 },
  },
];

export const ARTIFACT_DROP_CHANCE: Record<ArtifactSource, number> = {
  bossPhase: 0.09,
  chapterClear: 0.24,
  eliteWave: 0.1,
  anomalyWave: 0.2,
  corruptedEvent: 0.2,
  singularityEvent: 0.24,
};

const RARITY_SHARD_VALUE: Record<ArtifactRarity, number> = {
  common: 1,
  rare: 2,
  epic: 4,
  corrupted: 5,
  cosmic: 8,
};

export function artifactById(id: string): ArtifactDef | undefined {
  return ARTIFACTS.find((artifact) => artifact.id === id);
}

export function artifactLevelScale(level: number) {
  return 1 + Math.max(0, level - 1) * 0.35;
}

export function summarizeArtifactBonuses(runArtifacts: OwnedArtifact[] = [], permanentArtifacts: OwnedArtifact[] = []): ArtifactBonusSummary {
  const summary = { ...EMPTY_ARTIFACT_BONUSES };
  for (const owned of [...runArtifacts, ...permanentArtifacts]) {
    const def = artifactById(owned.id);
    if (!def) continue;
    const scale = artifactLevelScale(owned.level);
    for (const bonus of def.bonuses) {
      summary[bonus.type] += bonus.value * scale;
    }
  }
  summary.damageReductionPct = Math.min(0.35, summary.damageReductionPct);
  summary.extraProjectileChancePct = Math.min(0.42, summary.extraProjectileChancePct);
  summary.cooldownReductionPct = Math.min(0.32, summary.cooldownReductionPct);
  summary.projectileFireRatePct = Math.min(0.45, summary.projectileFireRatePct);
  summary.comboGainPct = Math.min(1.2, summary.comboGainPct);
  summary.weakPointDamagePct = Math.min(1.4, summary.weakPointDamagePct);
  summary.orbitDamagePct = Math.min(1.35, summary.orbitDamagePct);
  summary.orbitRadiusPct = Math.min(0.55, summary.orbitRadiusPct);
  summary.maxHpPct = Math.min(1.2, summary.maxHpPct);
  summary.manaRegenPct = Math.min(1.1, summary.manaRegenPct);
  summary.anomalyRewardPct = Math.min(1.2, summary.anomalyRewardPct);
  summary.shardChancePct = Math.min(0.55, summary.shardChancePct);
  summary.passiveProductionPct = Math.min(1.25, summary.passiveProductionPct);
  summary.offlineEfficiencyPct = Math.min(0.9, summary.offlineEfficiencyPct);
  summary.enemyDamagePct = Math.min(0.35, summary.enemyDamagePct);
  summary.bossPulseDamagePct = Math.min(0.35, summary.bossPulseDamagePct);
  return summary;
}

export function duplicateShardValue(rarity: ArtifactRarity) {
  return RARITY_SHARD_VALUE[rarity];
}

export function rollArtifactDrop(source: ArtifactSource, rng: () => number = Math.random): ArtifactDef | null {
  if (rng() > ARTIFACT_DROP_CHANCE[source]) return null;
  const candidates = ARTIFACTS
    .map((artifact) => ({ artifact, weight: artifact.sourceWeight[source] ?? 0 }))
    .filter((item) => item.weight > 0);
  const total = candidates.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;
  let roll = rng() * total;
  for (const item of candidates) {
    roll -= item.weight;
    if (roll <= 0) return item.artifact;
  }
  return candidates[candidates.length - 1]?.artifact ?? null;
}
