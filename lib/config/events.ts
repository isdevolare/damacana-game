export type EventRarity = 'common' | 'rare' | 'anomaly' | 'corrupted' | 'singularity';

export type AnomalyEffectType =
  | 'reward'
  | 'comboGain'
  | 'enemySpeed'
  | 'enemyDamage'
  | 'shield'
  | 'bossSlow'
  | 'bossRage'
  | 'weakPoint'
  | 'orbitDamage'
  | 'shardChance'
  | 'waveSurge';

export type EventReward =
  | { type: 'dmc'; amount: number }
  | { type: 'shards'; amount: number }
  | { type: 'buffTap'; mult: number; durationMs: number }
  | { type: 'buffFlow'; mult: number; durationMs: number }
  | { type: 'buffAnomaly'; effect: AnomalyEffectType; mult: number; durationMs: number; labelKey?: string }
  | { type: 'mana'; amount: number }
  | { type: 'hp'; amount: number }
  | { type: 'pctLoss'; pct: number }
  | { type: 'perTapPct'; pct: number }
  | { type: 'restoreBossHp' }
  | { type: 'bossHpPct'; pct: number }
  | { type: 'flowLossSeconds'; seconds: number }
  | { type: 'cooldownReduce'; pct: number }
  | { type: 'nothing' };

export interface EventChoice {
  key: string;
  rewards: EventReward[];
}

export interface AbsurdEvent {
  id: string;
  i18nKey: string;
  kind: 'choice';
  rarity: EventRarity;
  choices: EventChoice[];
  weight: number;
}

const s = 1000;

export const EVENTS: AbsurdEvent[] = [
  {
    id: 'blackHoleThreat',
    i18nKey: 'blackHoleThreat',
    kind: 'choice',
    rarity: 'common',
    weight: 10,
    choices: [
      { key: 'ignore', rewards: [{ type: 'buffAnomaly', effect: 'waveSurge', mult: 2, durationMs: 5 * s }, { type: 'buffAnomaly', effect: 'reward', mult: 1.3, durationMs: 20 * s }] },
      { key: 'respond', rewards: [{ type: 'mana', amount: -20 }, { type: 'dmc', amount: 500 }] },
    ],
  },
  {
    id: 'orbitFailure',
    i18nKey: 'orbitFailure',
    kind: 'choice',
    rarity: 'common',
    weight: 10,
    choices: [
      { key: 'stabilize', rewards: [{ type: 'buffAnomaly', effect: 'bossSlow', mult: 1.55, durationMs: 10 * s }] },
      { key: 'release', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 1.4, durationMs: 15 * s }, { type: 'buffAnomaly', effect: 'enemyDamage', mult: 1.2, durationMs: 15 * s }] },
    ],
  },
  {
    id: 'voidSignal',
    i18nKey: 'voidSignal',
    kind: 'choice',
    rarity: 'common',
    weight: 10,
    choices: [
      { key: 'accept', rewards: [{ type: 'buffAnomaly', effect: 'waveSurge', mult: 1, durationMs: 5 * s }, { type: 'buffAnomaly', effect: 'shardChance', mult: 1.1, durationMs: 20 * s }] },
      { key: 'block', rewards: [{ type: 'buffAnomaly', effect: 'shield', mult: 1, durationMs: 8 * s }, { type: 'buffAnomaly', effect: 'comboGain', mult: 0.8, durationMs: 15 * s }] },
    ],
  },
  {
    id: 'solarRain',
    i18nKey: 'solarRain',
    kind: 'choice',
    rarity: 'common',
    weight: 9,
    choices: [
      { key: 'drink', rewards: [{ type: 'hp', amount: 80 }, { type: 'mana', amount: 25 }] },
      { key: 'overload', rewards: [{ type: 'hp', amount: -40 }, { type: 'buffAnomaly', effect: 'orbitDamage', mult: 1.6, durationMs: 16 * s }] },
    ],
  },
  {
    id: 'meteorLattice',
    i18nKey: 'meteorLattice',
    kind: 'choice',
    rarity: 'common',
    weight: 9,
    choices: [
      { key: 'harvest', rewards: [{ type: 'buffAnomaly', effect: 'reward', mult: 1.22, durationMs: 18 * s }] },
      { key: 'shatter', rewards: [{ type: 'buffAnomaly', effect: 'waveSurge', mult: 1, durationMs: 5 * s }, { type: 'cooldownReduce', pct: 0.25 }] },
    ],
  },
  {
    id: 'pressureBloom',
    i18nKey: 'pressureBloom',
    kind: 'choice',
    rarity: 'common',
    weight: 9,
    choices: [
      { key: 'absorb', rewards: [{ type: 'buffTap', mult: 1.45, durationMs: 18 * s }] },
      { key: 'vent', rewards: [{ type: 'buffAnomaly', effect: 'shield', mult: 0.55, durationMs: 12 * s }, { type: 'mana', amount: -15 }] },
    ],
  },
  {
    id: 'frozenTelemetry',
    i18nKey: 'frozenTelemetry',
    kind: 'choice',
    rarity: 'common',
    weight: 8,
    choices: [
      { key: 'decode', rewards: [{ type: 'buffAnomaly', effect: 'weakPoint', mult: 1.45, durationMs: 20 * s }] },
      { key: 'burn', rewards: [{ type: 'mana', amount: 35 }, { type: 'buffAnomaly', effect: 'enemySpeed', mult: 1.12, durationMs: 12 * s }] },
    ],
  },
  {
    id: 'gravityShear',
    i18nKey: 'gravityShear',
    kind: 'choice',
    rarity: 'common',
    weight: 8,
    choices: [
      { key: 'brace', rewards: [{ type: 'buffAnomaly', effect: 'shield', mult: 0.65, durationMs: 12 * s }] },
      { key: 'surf', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 1.35, durationMs: 14 * s }, { type: 'hp', amount: -35 }] },
    ],
  },
  {
    id: 'ionStorm',
    i18nKey: 'ionStorm',
    kind: 'choice',
    rarity: 'common',
    weight: 8,
    choices: [
      { key: 'ground', rewards: [{ type: 'buffAnomaly', effect: 'bossSlow', mult: 1.35, durationMs: 12 * s }] },
      { key: 'conduct', rewards: [{ type: 'buffAnomaly', effect: 'orbitDamage', mult: 1.45, durationMs: 14 * s }, { type: 'buffAnomaly', effect: 'enemyDamage', mult: 1.12, durationMs: 14 * s }] },
    ],
  },
  {
    id: 'lunarRift',
    i18nKey: 'lunarRift',
    kind: 'choice',
    rarity: 'common',
    weight: 8,
    choices: [
      { key: 'seal', rewards: [{ type: 'hp', amount: 120 }] },
      { key: 'widen', rewards: [{ type: 'buffAnomaly', effect: 'reward', mult: 1.25, durationMs: 18 * s }, { type: 'buffAnomaly', effect: 'enemySpeed', mult: 1.15, durationMs: 18 * s }] },
    ],
  },
  {
    id: 'redDustSurge',
    i18nKey: 'redDustSurge',
    kind: 'choice',
    rarity: 'rare',
    weight: 6,
    choices: [
      { key: 'filter', rewards: [{ type: 'buffAnomaly', effect: 'enemySpeed', mult: 0.82, durationMs: 16 * s }] },
      { key: 'inhale', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 1.65, durationMs: 12 * s }, { type: 'hp', amount: -60 }] },
    ],
  },
  {
    id: 'shardComet',
    i18nKey: 'shardComet',
    kind: 'choice',
    rarity: 'rare',
    weight: 6,
    choices: [
      { key: 'track', rewards: [{ type: 'buffAnomaly', effect: 'shardChance', mult: 1.18, durationMs: 22 * s }] },
      { key: 'break', rewards: [{ type: 'shards', amount: 1 }, { type: 'buffAnomaly', effect: 'waveSurge', mult: 2, durationMs: 5 * s }] },
    ],
  },
  {
    id: 'deepCurrent',
    i18nKey: 'deepCurrent',
    kind: 'choice',
    rarity: 'rare',
    weight: 6,
    choices: [
      { key: 'ride', rewards: [{ type: 'buffFlow', mult: 1.8, durationMs: 24 * s }] },
      { key: 'dive', rewards: [{ type: 'mana', amount: 45 }, { type: 'buffAnomaly', effect: 'bossRage', mult: 1.18, durationMs: 16 * s }] },
    ],
  },
  {
    id: 'mirrorPlanet',
    i18nKey: 'mirrorPlanet',
    kind: 'choice',
    rarity: 'rare',
    weight: 5,
    choices: [
      { key: 'sync', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 1.5, durationMs: 16 * s }] },
      { key: 'crack', rewards: [{ type: 'buffTap', mult: 1.75, durationMs: 12 * s }, { type: 'buffAnomaly', effect: 'enemyDamage', mult: 1.18, durationMs: 12 * s }] },
    ],
  },
  {
    id: 'brokenMagnetosphere',
    i18nKey: 'brokenMagnetosphere',
    kind: 'choice',
    rarity: 'rare',
    weight: 5,
    choices: [
      { key: 'repair', rewards: [{ type: 'buffAnomaly', effect: 'shield', mult: 0.7, durationMs: 18 * s }] },
      { key: 'exploit', rewards: [{ type: 'cooldownReduce', pct: 0.35 }, { type: 'mana', amount: -25 }] },
    ],
  },
  {
    id: 'eclipseGate',
    i18nKey: 'eclipseGate',
    kind: 'choice',
    rarity: 'rare',
    weight: 5,
    choices: [
      { key: 'hold', rewards: [{ type: 'buffAnomaly', effect: 'bossSlow', mult: 1.8, durationMs: 8 * s }] },
      { key: 'enter', rewards: [{ type: 'buffAnomaly', effect: 'reward', mult: 1.45, durationMs: 12 * s }, { type: 'buffAnomaly', effect: 'bossRage', mult: 1.25, durationMs: 12 * s }] },
    ],
  },
  {
    id: 'voidTrial',
    i18nKey: 'voidTrial',
    kind: 'choice',
    rarity: 'anomaly',
    weight: 4,
    choices: [
      { key: 'submit', rewards: [{ type: 'buffAnomaly', effect: 'weakPoint', mult: 1.8, durationMs: 18 * s }, { type: 'hp', amount: -80 }] },
      { key: 'refuse', rewards: [{ type: 'buffAnomaly', effect: 'shield', mult: 1, durationMs: 6 * s }] },
    ],
  },
  {
    id: 'ringCollapse',
    i18nKey: 'ringCollapse',
    kind: 'choice',
    rarity: 'anomaly',
    weight: 4,
    choices: [
      { key: 'catch', rewards: [{ type: 'buffAnomaly', effect: 'orbitDamage', mult: 2.1, durationMs: 10 * s }] },
      { key: 'evade', rewards: [{ type: 'buffAnomaly', effect: 'enemySpeed', mult: 0.72, durationMs: 10 * s }] },
    ],
  },
  {
    id: 'quantumTide',
    i18nKey: 'quantumTide',
    kind: 'choice',
    rarity: 'anomaly',
    weight: 4,
    choices: [
      { key: 'split', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 2, durationMs: 10 * s }, { type: 'buffAnomaly', effect: 'enemySpeed', mult: 1.25, durationMs: 10 * s }] },
      { key: 'anchor', rewards: [{ type: 'hp', amount: 160 }, { type: 'mana', amount: 25 }] },
    ],
  },
  {
    id: 'darkMatterLease',
    i18nKey: 'darkMatterLease',
    kind: 'choice',
    rarity: 'anomaly',
    weight: 3,
    choices: [
      { key: 'sign', rewards: [{ type: 'buffAnomaly', effect: 'reward', mult: 1.75, durationMs: 10 * s }, { type: 'pctLoss', pct: 0.08 }] },
      { key: 'void', rewards: [{ type: 'cooldownReduce', pct: 0.4 }] },
    ],
  },
  {
    id: 'bossEcho',
    i18nKey: 'bossEcho',
    kind: 'choice',
    rarity: 'anomaly',
    weight: 3,
    choices: [
      { key: 'expose', rewards: [{ type: 'buffAnomaly', effect: 'weakPoint', mult: 2.2, durationMs: 10 * s }] },
      { key: 'anger', rewards: [{ type: 'bossHpPct', pct: -0.08 }, { type: 'buffAnomaly', effect: 'bossRage', mult: 1.35, durationMs: 10 * s }] },
    ],
  },
  {
    id: 'corruptedOrbit',
    i18nKey: 'corruptedOrbit',
    kind: 'choice',
    rarity: 'corrupted',
    weight: 2,
    choices: [
      { key: 'purge', rewards: [{ type: 'mana', amount: -45 }, { type: 'buffAnomaly', effect: 'shield', mult: 1, durationMs: 10 * s }] },
      { key: 'use', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 2.4, durationMs: 8 * s }, { type: 'buffAnomaly', effect: 'enemyDamage', mult: 1.35, durationMs: 8 * s }] },
    ],
  },
  {
    id: 'falseVacuum',
    i18nKey: 'falseVacuum',
    kind: 'choice',
    rarity: 'corrupted',
    weight: 2,
    choices: [
      { key: 'collapse', rewards: [{ type: 'buffAnomaly', effect: 'waveSurge', mult: 3, durationMs: 5 * s }, { type: 'buffAnomaly', effect: 'reward', mult: 1.9, durationMs: 12 * s }] },
      { key: 'stitch', rewards: [{ type: 'buffAnomaly', effect: 'bossSlow', mult: 2.2, durationMs: 10 * s }, { type: 'buffAnomaly', effect: 'comboGain', mult: 0.75, durationMs: 10 * s }] },
    ],
  },
  {
    id: 'infectedStar',
    i18nKey: 'infectedStar',
    kind: 'choice',
    rarity: 'corrupted',
    weight: 2,
    choices: [
      { key: 'drain', rewards: [{ type: 'hp', amount: 240 }, { type: 'buffAnomaly', effect: 'bossRage', mult: 1.3, durationMs: 14 * s }] },
      { key: 'ignite', rewards: [{ type: 'buffTap', mult: 2.2, durationMs: 10 * s }, { type: 'hp', amount: -120 }] },
    ],
  },
  {
    id: 'singularityPinch',
    i18nKey: 'singularityPinch',
    kind: 'choice',
    rarity: 'singularity',
    weight: 1,
    choices: [
      { key: 'compress', rewards: [{ type: 'buffAnomaly', effect: 'comboGain', mult: 3, durationMs: 7 * s }, { type: 'buffAnomaly', effect: 'enemySpeed', mult: 1.4, durationMs: 7 * s }] },
      { key: 'expand', rewards: [{ type: 'buffAnomaly', effect: 'reward', mult: 2.2, durationMs: 8 * s }, { type: 'buffAnomaly', effect: 'waveSurge', mult: 4, durationMs: 5 * s }] },
    ],
  },
  {
    id: 'eventHorizonCall',
    i18nKey: 'eventHorizonCall',
    kind: 'choice',
    rarity: 'singularity',
    weight: 1,
    choices: [
      { key: 'answer', rewards: [{ type: 'shards', amount: 2 }, { type: 'hp', amount: -180 }] },
      { key: 'silence', rewards: [{ type: 'buffAnomaly', effect: 'shield', mult: 1, durationMs: 12 * s }, { type: 'cooldownReduce', pct: 0.5 }] },
    ],
  },
];

export function pickRandomEvent(rng = Math.random): AbsurdEvent {
  const total = EVENTS.reduce((sum, event) => sum + event.weight, 0);
  let roll = rng() * total;
  for (const event of EVENTS) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return EVENTS[0];
}
