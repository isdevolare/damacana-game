import type { Chapter, ChapterId } from './chapters';

export type EnemyVariantId =
  | 'basic'
  | 'rush'
  | 'tank'
  | 'splitter'
  | 'shield'
  | 'manaLeech'
  | 'orbitJammer'
  | 'anomaly';

export type EnemySpecial = 'splitter' | 'shield' | 'manaLeech' | 'orbitJammer' | 'anomaly';

export interface EnemyVariantDef {
  id: EnemyVariantId;
  i18nKey: EnemyVariantId;
  hpMult: number;
  speedMult: number;
  damageMult: number;
  rewardMult: number;
  accent: string;
  glow: string;
  symbol: string;
  shieldHits?: number;
  special?: EnemySpecial;
}

type WeightRange = [number, number];

const WEIGHTS: Record<ChapterId, Record<EnemyVariantId, WeightRange>> = {
  earth: {
    basic: [95, 48],
    rush: [0, 6],
    tank: [5, 28],
    splitter: [0, 4],
    shield: [0, 0],
    manaLeech: [0, 2],
    orbitJammer: [0, 0],
    anomaly: [0, 1],
  },
  mars: {
    basic: [62, 42],
    rush: [24, 34],
    tank: [8, 12],
    splitter: [0, 4],
    shield: [0, 2],
    manaLeech: [2, 4],
    orbitJammer: [0, 0],
    anomaly: [1, 2],
  },
  saturn: {
    basic: [46, 32],
    rush: [8, 10],
    tank: [18, 20],
    splitter: [16, 22],
    shield: [2, 5],
    manaLeech: [3, 5],
    orbitJammer: [8, 12],
    anomaly: [1, 3],
  },
  uranus: {
    basic: [38, 28],
    rush: [10, 12],
    tank: [10, 14],
    splitter: [8, 12],
    shield: [18, 22],
    manaLeech: [7, 10],
    orbitJammer: [8, 12],
    anomaly: [2, 4],
  },
  neptune: {
    basic: [32, 24],
    rush: [12, 15],
    tank: [12, 14],
    splitter: [10, 14],
    shield: [15, 19],
    manaLeech: [8, 12],
    orbitJammer: [8, 12],
    anomaly: [3, 6],
  },
};

export const ENEMY_VARIANTS: EnemyVariantDef[] = [
  {
    id: 'basic',
    i18nKey: 'basic',
    hpMult: 1,
    speedMult: 1,
    damageMult: 1,
    rewardMult: 1,
    accent: '#5cf6ff',
    glow: 'rgba(92,246,255,0.62)',
    symbol: '○',
  },
  {
    id: 'rush',
    i18nKey: 'rush',
    hpMult: 0.64,
    speedMult: 1.55,
    damageMult: 0.92,
    rewardMult: 1.05,
    accent: '#ff6b4a',
    glow: 'rgba(255,107,74,0.68)',
    symbol: '›',
  },
  {
    id: 'tank',
    i18nKey: 'tank',
    hpMult: 1.85,
    speedMult: 0.62,
    damageMult: 1.15,
    rewardMult: 1.16,
    accent: '#ffd166',
    glow: 'rgba(255,209,102,0.64)',
    symbol: '■',
  },
  {
    id: 'splitter',
    i18nKey: 'splitter',
    hpMult: 0.82,
    speedMult: 1.08,
    damageMult: 0.82,
    rewardMult: 1.14,
    accent: '#ff5ce8',
    glow: 'rgba(255,92,232,0.62)',
    symbol: '÷',
    special: 'splitter',
  },
  {
    id: 'shield',
    i18nKey: 'shield',
    hpMult: 1.18,
    speedMult: 0.86,
    damageMult: 1.05,
    rewardMult: 1.18,
    accent: '#80fff4',
    glow: 'rgba(128,255,244,0.66)',
    symbol: '⬡',
    shieldHits: 3,
    special: 'shield',
  },
  {
    id: 'manaLeech',
    i18nKey: 'manaLeech',
    hpMult: 0.95,
    speedMult: 1.14,
    damageMult: 0.75,
    rewardMult: 1.2,
    accent: '#b87aff',
    glow: 'rgba(184,122,255,0.66)',
    symbol: '∿',
    special: 'manaLeech',
  },
  {
    id: 'orbitJammer',
    i18nKey: 'orbitJammer',
    hpMult: 1.22,
    speedMult: 0.78,
    damageMult: 1,
    rewardMult: 1.22,
    accent: '#ff3d6e',
    glow: 'rgba(255,61,110,0.66)',
    symbol: '⊘',
    special: 'orbitJammer',
  },
  {
    id: 'anomaly',
    i18nKey: 'anomaly',
    hpMult: 1.1,
    speedMult: 1.16,
    damageMult: 1.2,
    rewardMult: 1.85,
    accent: '#ffffff',
    glow: 'rgba(255,255,255,0.72)',
    symbol: '◇',
    special: 'anomaly',
  },
];

export function enemyVariantById(id: EnemyVariantId): EnemyVariantDef {
  return ENEMY_VARIANTS.find((variant) => variant.id === id) ?? ENEMY_VARIANTS[0];
}

function mix([from, to]: WeightRange, progress: number) {
  return from + (to - from) * progress;
}

export function pickEnemyVariant(chapter: Chapter, phaseProgress: number, rng = Math.random): EnemyVariantDef {
  const weights = WEIGHTS[chapter.id];
  const weighted = ENEMY_VARIANTS
    .map((variant) => ({ variant, weight: Math.max(0, mix(weights[variant.id], phaseProgress)) }))
    .filter((item) => item.weight > 0);
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.variant;
  }
  return ENEMY_VARIANTS[0];
}
