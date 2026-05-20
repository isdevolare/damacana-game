export type FormKey =
  | 'DROP'
  | 'BIG_DROP'
  | 'ORB'
  | 'PLANET'
  | 'GALAXY'
  | 'MILKYWAY'
  | 'VOID';

export interface Level {
  idx: number;
  key: string;
  form: FormKey;
  bgGradient: string;
  musicLayer: number;
  threshold: number;
}

export const LEVELS: Level[] = [
  {
    idx: 0,
    key: 'drop',
    form: 'DROP',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #0d0220 0%, #05010d 60%, #000 100%)',
    musicLayer: 0,
    threshold: 0,
  },
  {
    idx: 1,
    key: 'bigDrop',
    form: 'BIG_DROP',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #1a0b3d 0%, #07021a 60%, #000 100%)',
    musicLayer: 1,
    threshold: 150,
  },
  {
    idx: 2,
    key: 'fiveBottleHuman',
    form: 'ORB',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #1d0b4f 0%, #06031d 60%, #000 100%)',
    musicLayer: 2,
    threshold: 700,
  },
  {
    idx: 3,
    key: 'galactic',
    form: 'PLANET',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #261063 0%, #07022a 60%, #000 100%)',
    musicLayer: 3,
    threshold: 4000,
  },
  {
    idx: 4,
    key: 'transcendent',
    form: 'GALAXY',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #3a0e7a 0%, #1a0640 60%, #000 100%)',
    musicLayer: 4,
    threshold: 25_000,
  },
  {
    idx: 5,
    key: 'voidConsumer',
    form: 'MILKYWAY',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #4d0a8f 0%, #240a4a 60%, #000 100%)',
    musicLayer: 5,
    threshold: 150_000,
  },
  {
    idx: 6,
    key: 'classificationFailed',
    form: 'VOID',
    bgGradient:
      'radial-gradient(circle at 50% 40%, #7a0fa0 0%, #3a0660 50%, #000 100%)',
    musicLayer: 6,
    threshold: 1_000_000,
  },
];

// Tier-3 prestige unlock: an 8th evolution level.
export const POST_FAILED_LEVEL: Level = {
  idx: 7,
  key: 'postFailed',
  form: 'VOID',
  bgGradient:
    'radial-gradient(circle at 50% 40%, #ff5ce8 0%, #5cf6ff 35%, #0a001a 100%)',
  musicLayer: 6,
  threshold: 5_000_000,
};

export function activeLevels(totalPrestiges: number): Level[] {
  return totalPrestiges >= 3 ? [...LEVELS, POST_FAILED_LEVEL] : LEVELS;
}

export function levelForTotal(total: number, totalPrestiges = 0): number {
  const arr = activeLevels(totalPrestiges);
  let lv = 0;
  for (let i = 0; i < arr.length; i++) {
    if (total >= arr[i].threshold) lv = i;
  }
  return lv;
}
