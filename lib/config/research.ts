import type { ChapterId } from './chapters';

export type ResearchCategory = 'combat' | 'flow' | 'offline' | 'void';
export type ResearchCurrency = 'damacana' | 'shards';
export type ResearchBonusType =
  | 'maxHpPct'
  | 'manaRegenPct'
  | 'comboDecayPct'
  | 'passiveProductionPct'
  | 'rewardMultiplierPct'
  | 'orbitDamagePct'
  | 'offlineCapMs'
  | 'offlineEfficiencyPct'
  | 'prestigeGainPct'
  | 'shardChancePct'
  | 'postPrestigeProductionPct'
  | 'abilityCooldownPct';

export interface ResearchBonus {
  type: ResearchBonusType;
  value: number;
}

export interface ResearchCost {
  currency: ResearchCurrency;
  amount: number;
}

export type ResearchRequirement =
  | { type: 'none' }
  | { type: 'passiveProduction'; min: number; fallbackChapter?: ChapterId }
  | { type: 'prestigeOrShard' };

export interface ResearchDefinition {
  id: string;
  category: ResearchCategory;
  i18nKey: string;
  durationMs: number;
  cost: ResearchCost;
  bonuses: ResearchBonus[];
  requirement: ResearchRequirement;
}

export interface ResearchBonusSummary {
  maxHpPct: number;
  manaRegenPct: number;
  comboDecayPct: number;
  passiveProductionPct: number;
  rewardMultiplierPct: number;
  orbitDamagePct: number;
  offlineCapMs: number;
  offlineEfficiencyPct: number;
  prestigeGainPct: number;
  shardChancePct: number;
  postPrestigeProductionPct: number;
  abilityCooldownPct: number;
}

export const EMPTY_RESEARCH_BONUSES: ResearchBonusSummary = {
  maxHpPct: 0,
  manaRegenPct: 0,
  comboDecayPct: 0,
  passiveProductionPct: 0,
  rewardMultiplierPct: 0,
  orbitDamagePct: 0,
  offlineCapMs: 0,
  offlineEfficiencyPct: 0,
  prestigeGainPct: 0,
  shardChancePct: 0,
  postPrestigeProductionPct: 0,
  abilityCooldownPct: 0,
};

const m = 60 * 1000;

export const RESEARCH_LIST: ResearchDefinition[] = [
  {
    id: 'stableCore1',
    category: 'combat',
    i18nKey: 'stableCore1',
    durationMs: 1 * m,
    cost: { currency: 'damacana', amount: 250 },
    bonuses: [{ type: 'maxHpPct', value: 0.05 }],
    requirement: { type: 'none' },
  },
  {
    id: 'comboMemory1',
    category: 'combat',
    i18nKey: 'comboMemory1',
    durationMs: 3 * m,
    cost: { currency: 'damacana', amount: 1500 },
    bonuses: [{ type: 'comboDecayPct', value: 0.05 }],
    requirement: { type: 'none' },
  },
  {
    id: 'manaChannel1',
    category: 'combat',
    i18nKey: 'manaChannel1',
    durationMs: 5 * m,
    cost: { currency: 'damacana', amount: 4000 },
    bonuses: [{ type: 'manaRegenPct', value: 0.05 }],
    requirement: { type: 'none' },
  },
  {
    id: 'efficientFlow1',
    category: 'flow',
    i18nKey: 'efficientFlow1',
    durationMs: 1 * m,
    cost: { currency: 'damacana', amount: 250 },
    bonuses: [{ type: 'passiveProductionPct', value: 0.05 }],
    requirement: { type: 'none' },
  },
  {
    id: 'rewardCurrent1',
    category: 'flow',
    i18nKey: 'rewardCurrent1',
    durationMs: 5 * m,
    cost: { currency: 'damacana', amount: 5000 },
    bonuses: [{ type: 'rewardMultiplierPct', value: 0.05 }],
    requirement: { type: 'none' },
  },
  {
    id: 'orbitCalibration1',
    category: 'flow',
    i18nKey: 'orbitCalibration1',
    durationMs: 10 * m,
    cost: { currency: 'damacana', amount: 15000 },
    bonuses: [{ type: 'orbitDamagePct', value: 0.05 }],
    requirement: { type: 'none' },
  },
  {
    id: 'nightReservoir1',
    category: 'offline',
    i18nKey: 'nightReservoir1',
    durationMs: 5 * m,
    cost: { currency: 'damacana', amount: 2000 },
    bonuses: [{ type: 'offlineCapMs', value: 30 * m }],
    requirement: { type: 'passiveProduction', min: 1, fallbackChapter: 'earth' },
  },
  {
    id: 'silentEngine1',
    category: 'offline',
    i18nKey: 'silentEngine1',
    durationMs: 10 * m,
    cost: { currency: 'damacana', amount: 10000 },
    bonuses: [{ type: 'offlineEfficiencyPct', value: 0.1 }],
    requirement: { type: 'passiveProduction', min: 1, fallbackChapter: 'earth' },
  },
  {
    id: 'longShift1',
    category: 'offline',
    i18nKey: 'longShift1',
    durationMs: 30 * m,
    cost: { currency: 'damacana', amount: 50000 },
    bonuses: [{ type: 'offlineCapMs', value: 60 * m }],
    requirement: { type: 'passiveProduction', min: 1, fallbackChapter: 'earth' },
  },
  {
    id: 'voidAnalysis1',
    category: 'void',
    i18nKey: 'voidAnalysis1',
    durationMs: 20 * m,
    cost: { currency: 'shards', amount: 1 },
    bonuses: [{ type: 'prestigeGainPct', value: 0.05 }],
    requirement: { type: 'prestigeOrShard' },
  },
  {
    id: 'fractureDetector1',
    category: 'void',
    i18nKey: 'fractureDetector1',
    durationMs: 30 * m,
    cost: { currency: 'shards', amount: 2 },
    bonuses: [{ type: 'shardChancePct', value: 0.05 }],
    requirement: { type: 'prestigeOrShard' },
  },
  {
    id: 'permanentTrace1',
    category: 'void',
    i18nKey: 'permanentTrace1',
    durationMs: 60 * m,
    cost: { currency: 'shards', amount: 3 },
    bonuses: [{ type: 'postPrestigeProductionPct', value: 0.05 }],
    requirement: { type: 'prestigeOrShard' },
  },
];

export function researchById(id: string) {
  return RESEARCH_LIST.find((research) => research.id === id);
}

export function summarizeResearchBonuses(ids: string[]): ResearchBonusSummary {
  const out = { ...EMPTY_RESEARCH_BONUSES };
  for (const id of ids) {
    const research = researchById(id);
    if (!research) continue;
    for (const bonus of research.bonuses) {
      out[bonus.type] += bonus.value;
    }
  }
  return out;
}

