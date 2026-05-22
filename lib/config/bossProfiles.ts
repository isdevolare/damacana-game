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
};

export function bossProfileForChapter(id: ChapterId): BossProfile {
  return BOSS_PROFILES[id];
}
