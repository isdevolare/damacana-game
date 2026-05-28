import type { ChapterId } from './chapters';
import type { EnemyVariantId } from './enemyVariants';

export type BossPulseKind = 'pulse' | 'sweep' | 'corrupted';

export interface BossProfile {
  id: ChapterId;
  i18nKey: ChapterId;
  rage?: {
    hpThreshold: number;
    durationMs: number;
    pulseIntervalMult: number;
    summonIntervalMult: number;
  };
  rotatingWeakPoint?: {
    speed: number;
    radiusPx: number;
  };
  shieldWindow?: {
    intervalMs: number;
    durationMs: number;
    damageTakenMult: number;
  };
  orbitSweep?: {
    intervalMs: number;
    warningMs: number;
    speed: number;
    damageMult: number;
  };
  corruptedPulse?: {
    chance: number;
    damageMult: number;
    speedMult: number;
  };
  weakPointTiming: {
    minMs: number;
    maxMs: number;
    durationMult: number;
  };
  pulseIntervalMult: number;
  summonIntervalMult: number;
  summonBias: EnemyVariantId[];
}

const BOSS_PROFILES: Record<ChapterId, BossProfile> = {
  earth: {
    id: 'earth',
    i18nKey: 'earth',
    weakPointTiming: { minMs: 5000, maxMs: 7800, durationMult: 1.18 },
    pulseIntervalMult: 1.16,
    summonIntervalMult: 1.12,
    summonBias: ['basic', 'basic', 'tank'],
  },
  mars: {
    id: 'mars',
    i18nKey: 'mars',
    rage: { hpThreshold: 0.5, durationMs: 9500, pulseIntervalMult: 0.72, summonIntervalMult: 0.74 },
    weakPointTiming: { minMs: 4700, maxMs: 7600, durationMult: 1 },
    pulseIntervalMult: 0.88,
    summonIntervalMult: 0.9,
    summonBias: ['rush', 'rush', 'basic'],
  },
  saturn: {
    id: 'saturn',
    i18nKey: 'saturn',
    rotatingWeakPoint: { speed: 1.8, radiusPx: 31 },
    orbitSweep: { intervalMs: 9200, warningMs: 950, speed: 0.035, damageMult: 0.95 },
    weakPointTiming: { minMs: 5200, maxMs: 8600, durationMult: 0.95 },
    pulseIntervalMult: 1,
    summonIntervalMult: 0.88,
    summonBias: ['splitter', 'orbitJammer', 'tank'],
  },
  uranus: {
    id: 'uranus',
    i18nKey: 'uranus',
    shieldWindow: { intervalMs: 10500, durationMs: 2600, damageTakenMult: 0.36 },
    weakPointTiming: { minMs: 4300, maxMs: 10400, durationMult: 0.82 },
    pulseIntervalMult: 0.92,
    summonIntervalMult: 0.92,
    summonBias: ['shield', 'manaLeech', 'basic'],
  },
  neptune: {
    id: 'neptune',
    i18nKey: 'neptune',
    rage: { hpThreshold: 0.45, durationMs: 11000, pulseIntervalMult: 0.78, summonIntervalMult: 0.78 },
    shieldWindow: { intervalMs: 12800, durationMs: 2100, damageTakenMult: 0.5 },
    corruptedPulse: { chance: 0.28, damageMult: 1.42, speedMult: 1.1 },
    weakPointTiming: { minMs: 5600, maxMs: 9800, durationMult: 0.78 },
    pulseIntervalMult: 0.82,
    summonIntervalMult: 0.82,
    summonBias: ['anomaly', 'manaLeech', 'shield', 'rush'],
  },
  redDwarf: {
    id: 'redDwarf',
    i18nKey: 'redDwarf',
    rage: { hpThreshold: 0.46, durationMs: 10500, pulseIntervalMult: 0.76, summonIntervalMult: 0.78 },
    weakPointTiming: { minMs: 5000, maxMs: 8600, durationMult: 0.86 },
    pulseIntervalMult: 0.82,
    summonIntervalMult: 0.78,
    summonBias: ['rush', 'anomaly', 'basic'],
  },
  whiteDwarf: {
    id: 'whiteDwarf',
    i18nKey: 'whiteDwarf',
    shieldWindow: { intervalMs: 9800, durationMs: 2400, damageTakenMult: 0.34 },
    weakPointTiming: { minMs: 4600, maxMs: 9200, durationMult: 0.78 },
    pulseIntervalMult: 0.78,
    summonIntervalMult: 0.84,
    summonBias: ['shield', 'manaLeech', 'orbitJammer'],
  },
  giantStar: {
    id: 'giantStar',
    i18nKey: 'giantStar',
    rage: { hpThreshold: 0.42, durationMs: 12000, pulseIntervalMult: 0.82, summonIntervalMult: 0.82 },
    orbitSweep: { intervalMs: 8200, warningMs: 900, speed: 0.038, damageMult: 1.08 },
    weakPointTiming: { minMs: 5400, maxMs: 9000, durationMult: 0.82 },
    pulseIntervalMult: 0.84,
    summonIntervalMult: 0.82,
    summonBias: ['tank', 'shield', 'orbitJammer'],
  },
  supernova: {
    id: 'supernova',
    i18nKey: 'supernova',
    rage: { hpThreshold: 0.5, durationMs: 12500, pulseIntervalMult: 0.72, summonIntervalMult: 0.72 },
    rotatingWeakPoint: { speed: 2.2, radiusPx: 34 },
    shieldWindow: { intervalMs: 11800, durationMs: 1900, damageTakenMult: 0.48 },
    corruptedPulse: { chance: 0.38, damageMult: 1.55, speedMult: 1.16 },
    weakPointTiming: { minMs: 5600, maxMs: 10200, durationMult: 0.72 },
    pulseIntervalMult: 0.74,
    summonIntervalMult: 0.74,
    summonBias: ['anomaly', 'anomaly', 'shield', 'manaLeech'],
  },
};

export function bossProfileForChapter(id: ChapterId): BossProfile {
  return BOSS_PROFILES[id];
}
