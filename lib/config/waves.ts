import type { Chapter, ChapterId } from './chapters';
import type { EnemyVariantId } from './enemyVariants';

export type WaveTypeId = 'normal' | 'rush' | 'tank' | 'splitter' | 'elite' | 'anomaly';

interface WaveTypeDef {
  id: WaveTypeId;
  i18nKey: WaveTypeId;
  special: boolean;
  hpMult: number;
  speedMult: number;
  damageMult: number;
  rewardMult: number;
  countMult: number;
  countAdd: number;
  accent: string;
  variantsByChapter?: Partial<Record<ChapterId, EnemyVariantId[]>>;
}

type WeightRange = [number, number];

const WAVE_WEIGHTS: Record<ChapterId, Record<WaveTypeId, WeightRange>> = {
  earth: {
    normal: [100, 82],
    rush: [0, 4],
    tank: [0, 8],
    splitter: [0, 0],
    elite: [0, 3],
    anomaly: [0, 0],
  },
  mars: {
    normal: [72, 54],
    rush: [20, 30],
    tank: [4, 8],
    splitter: [0, 2],
    elite: [2, 5],
    anomaly: [0, 1],
  },
  saturn: {
    normal: [58, 40],
    rush: [5, 7],
    tank: [13, 18],
    splitter: [16, 25],
    elite: [3, 7],
    anomaly: [0, 2],
  },
  uranus: {
    normal: [50, 34],
    rush: [6, 9],
    tank: [9, 12],
    splitter: [8, 11],
    elite: [12, 19],
    anomaly: [2, 5],
  },
  neptune: {
    normal: [42, 26],
    rush: [8, 11],
    tank: [8, 11],
    splitter: [9, 13],
    elite: [16, 22],
    anomaly: [6, 12],
  },
};

export const WAVE_TYPES: Record<WaveTypeId, WaveTypeDef> = {
  normal: {
    id: 'normal',
    i18nKey: 'normal',
    special: false,
    hpMult: 1,
    speedMult: 1,
    damageMult: 1,
    rewardMult: 1,
    countMult: 1,
    countAdd: 0,
    accent: '#5cf6ff',
  },
  rush: {
    id: 'rush',
    i18nKey: 'rush',
    special: true,
    hpMult: 0.86,
    speedMult: 1.24,
    damageMult: 0.92,
    rewardMult: 1.12,
    countMult: 1.08,
    countAdd: 1,
    accent: '#ff6b4a',
    variantsByChapter: {
      earth: ['basic', 'rush'],
      mars: ['rush', 'rush', 'basic'],
      saturn: ['rush', 'rush', 'splitter'],
      uranus: ['rush', 'rush', 'manaLeech'],
      neptune: ['rush', 'rush', 'anomaly'],
    },
  },
  tank: {
    id: 'tank',
    i18nKey: 'tank',
    special: true,
    hpMult: 1.3,
    speedMult: 0.82,
    damageMult: 1.04,
    rewardMult: 1.18,
    countMult: 0.72,
    countAdd: 0,
    accent: '#ffd166',
    variantsByChapter: {
      earth: ['tank', 'basic'],
      mars: ['tank', 'basic', 'rush'],
      saturn: ['tank', 'tank', 'orbitJammer'],
      uranus: ['tank', 'shield', 'orbitJammer'],
      neptune: ['tank', 'shield', 'anomaly'],
    },
  },
  splitter: {
    id: 'splitter',
    i18nKey: 'splitter',
    special: true,
    hpMult: 0.9,
    speedMult: 1.08,
    damageMult: 0.95,
    rewardMult: 1.16,
    countMult: 1.05,
    countAdd: 1,
    accent: '#ff5ce8',
    variantsByChapter: {
      mars: ['splitter', 'basic'],
      saturn: ['splitter', 'splitter', 'orbitJammer'],
      uranus: ['splitter', 'shield', 'manaLeech'],
      neptune: ['splitter', 'anomaly', 'manaLeech'],
    },
  },
  elite: {
    id: 'elite',
    i18nKey: 'elite',
    special: true,
    hpMult: 1.22,
    speedMult: 1.03,
    damageMult: 1.08,
    rewardMult: 1.34,
    countMult: 0.78,
    countAdd: 1,
    accent: '#ffffff',
    variantsByChapter: {
      earth: ['tank', 'basic'],
      mars: ['rush', 'tank'],
      saturn: ['orbitJammer', 'tank', 'splitter'],
      uranus: ['shield', 'manaLeech', 'orbitJammer'],
      neptune: ['anomaly', 'shield', 'manaLeech'],
    },
  },
  anomaly: {
    id: 'anomaly',
    i18nKey: 'anomaly',
    special: true,
    hpMult: 1.12,
    speedMult: 1.12,
    damageMult: 1.14,
    rewardMult: 1.55,
    countMult: 0.94,
    countAdd: 1,
    accent: '#b87aff',
    variantsByChapter: {
      mars: ['anomaly', 'rush'],
      saturn: ['anomaly', 'orbitJammer', 'splitter'],
      uranus: ['anomaly', 'manaLeech', 'shield'],
      neptune: ['anomaly', 'anomaly', 'manaLeech', 'shield'],
    },
  },
};

function mix([from, to]: WeightRange, progress: number) {
  return from + (to - from) * progress;
}

export function waveTypeById(id: WaveTypeId): WaveTypeDef {
  return WAVE_TYPES[id];
}

export function pickWaveType(chapter: Chapter, phaseProgress: number, rng = Math.random): WaveTypeDef {
  const weights = WAVE_WEIGHTS[chapter.id];
  const weighted = (Object.keys(WAVE_TYPES) as WaveTypeId[])
    .map((id) => ({ wave: WAVE_TYPES[id], weight: Math.max(0, mix(weights[id], phaseProgress)) }))
    .filter((item) => item.weight > 0);
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.wave;
  }
  return WAVE_TYPES.normal;
}

export function waveVariantsForChapter(id: WaveTypeId, chapterId: ChapterId): EnemyVariantId[] | undefined {
  return WAVE_TYPES[id].variantsByChapter?.[chapterId];
}
