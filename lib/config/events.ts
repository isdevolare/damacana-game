export type EventReward =
  | { type: 'dmc'; amount: number }
  | { type: 'shards'; amount: number }
  | { type: 'buffTap'; mult: number; durationMs: number }
  | { type: 'buffFlow'; mult: number; durationMs: number }
  | { type: 'pctLoss'; pct: number }
  | { type: 'perTapPct'; pct: number }
  | { type: 'restoreBossHp' }
  | { type: 'flowLossSeconds'; seconds: number }
  | { type: 'nothing' };

export interface EventChoice {
  key: string;
  rewards: EventReward[];
}

export interface AbsurdEvent {
  id: string;
  i18nKey: string;
  kind: 'auto' | 'choice' | 'crisis';
  autoRewards?: EventReward[];
  choices?: EventChoice[];
  weight: number;
}

export const EVENTS: AbsurdEvent[] = [
  // AUTO
  { id: 'missingGalaxy', i18nKey: 'missingGalaxy', kind: 'auto', weight: 10, autoRewards: [{ type: 'dmc', amount: 500 }] },
  { id: 'voidChecking', i18nKey: 'voidChecking', kind: 'auto', weight: 6, autoRewards: [{ type: 'shards', amount: 1 }] },
  { id: 'realityUpdate', i18nKey: 'realityUpdate', kind: 'auto', weight: 8, autoRewards: [{ type: 'buffFlow', mult: 2, durationMs: 15_000 }] },
  { id: 'asteroidRating', i18nKey: 'asteroidRating', kind: 'auto', weight: 10, autoRewards: [{ type: 'dmc', amount: 200 }] },
  { id: 'oceanSilent', i18nKey: 'oceanSilent', kind: 'auto', weight: 10, autoRewards: [{ type: 'dmc', amount: 300 }] },
  { id: 'cosmicGroupChat', i18nKey: 'cosmicGroupChat', kind: 'auto', weight: 8, autoRewards: [{ type: 'buffTap', mult: 3, durationMs: 10_000 }] },
  { id: 'starFollow', i18nKey: 'starFollow', kind: 'auto', weight: 10, autoRewards: [{ type: 'dmc', amount: 100 }] },
  { id: 'moonBuffering', i18nKey: 'moonBuffering', kind: 'auto', weight: 8, autoRewards: [{ type: 'buffFlow', mult: 2, durationMs: 10_000 }] },
  { id: 'physicsBreak', i18nKey: 'physicsBreak', kind: 'auto', weight: 6, autoRewards: [{ type: 'buffTap', mult: 5, durationMs: 5_000 }] },
  { id: 'reflectionThumbs', i18nKey: 'reflectionThumbs', kind: 'auto', weight: 10, autoRewards: [{ type: 'dmc', amount: 150 }] },

  // CHOICE
  {
    id: 'universeCalling',
    i18nKey: 'universeCalling',
    kind: 'choice',
    weight: 8,
    choices: [
      { key: 'answer', rewards: [{ type: 'dmc', amount: 500 }] },
      { key: 'decline', rewards: [{ type: 'buffFlow', mult: 2, durationMs: 20_000 }] },
    ],
  },
  {
    id: 'blackHoleDeal',
    i18nKey: 'blackHoleDeal',
    kind: 'choice',
    weight: 6,
    choices: [
      { key: 'take', rewards: [{ type: 'dmc', amount: 1000 }, { type: 'pctLoss', pct: 0.2 }] },
      { key: 'refuse', rewards: [{ type: 'nothing' }] },
    ],
  },
  {
    id: 'unidentifiedSwap',
    i18nKey: 'unidentifiedSwap',
    kind: 'choice',
    weight: 5,
    choices: [
      { key: 'swap', rewards: [{ type: 'dmc', amount: 5000 }, { type: 'restoreBossHp' }] },
      { key: 'stay', rewards: [{ type: 'nothing' }] },
    ],
  },
  {
    id: 'gravitySubscription',
    i18nKey: 'gravitySubscription',
    kind: 'choice',
    weight: 6,
    choices: [
      { key: 'renew', rewards: [{ type: 'dmc', amount: -200 }] },
      { key: 'lapse', rewards: [{ type: 'buffFlow', mult: 5, durationMs: 8_000 }] },
    ],
  },
  {
    id: 'starComedy',
    i18nKey: 'starComedy',
    kind: 'choice',
    weight: 7,
    choices: [
      { key: 'laugh', rewards: [{ type: 'buffTap', mult: 2, durationMs: 15_000 }] },
      { key: 'silent', rewards: [{ type: 'dmc', amount: 300 }] },
    ],
  },
  {
    id: 'voidAudit',
    i18nKey: 'voidAudit',
    kind: 'choice',
    weight: 5,
    choices: [
      { key: 'cooperate', rewards: [{ type: 'pctLoss', pct: 0.1 }, { type: 'shards', amount: 2 }] },
      { key: 'flee', rewards: [{ type: 'flowLossSeconds', seconds: 5 }] },
    ],
  },
  {
    id: 'alternateMerge',
    i18nKey: 'alternateMerge',
    kind: 'choice',
    weight: 4,
    choices: [
      { key: 'merge', rewards: [{ type: 'perTapPct', pct: 0.5 }] },
      { key: 'reject', rewards: [{ type: 'nothing' }] },
    ],
  },
  {
    id: 'simulationFeedback',
    i18nKey: 'simulationFeedback',
    kind: 'choice',
    weight: 6,
    choices: [
      { key: 'fiveStars', rewards: [{ type: 'shards', amount: 1 }] },
      { key: 'oneStar', rewards: [{ type: 'buffFlow', mult: 3, durationMs: 30_000 }] },
    ],
  },

  // CRISIS
  {
    id: 'planetDisappear',
    i18nKey: 'planetDisappear',
    kind: 'crisis',
    weight: 3,
    choices: [
      { key: 'act', rewards: [{ type: 'dmc', amount: 2000 }, { type: 'shards', amount: 1 }] },
      { key: 'ignore', rewards: [{ type: 'pctLoss', pct: 0.15 }] },
    ],
  },
  {
    id: 'oneWorldLost',
    i18nKey: 'oneWorldLost',
    kind: 'crisis',
    weight: 3,
    choices: [
      { key: 'answer', rewards: [{ type: 'dmc', amount: 1500 }] },
      { key: 'ignore', rewards: [{ type: 'flowLossSeconds', seconds: 10 }] },
    ],
  },
  {
    id: 'systemBreach',
    i18nKey: 'systemBreach',
    kind: 'crisis',
    weight: 3,
    choices: [
      { key: 'quarantine', rewards: [{ type: 'dmc', amount: 800 }] },
      { key: 'ignore', rewards: [{ type: 'buffTap', mult: 4, durationMs: 12_000 }, { type: 'pctLoss', pct: 0.1 }] },
    ],
  },
  {
    id: 'onlyRunningProcess',
    i18nKey: 'onlyRunningProcess',
    kind: 'crisis',
    weight: 2,
    choices: [
      { key: 'continue', rewards: [{ type: 'dmc', amount: 3000 }, { type: 'shards', amount: 1 }] },
      { key: 'halt', rewards: [{ type: 'pctLoss', pct: 0.25 }] },
    ],
  },
];

export function pickRandomEvent(rng = Math.random): AbsurdEvent {
  const total = EVENTS.reduce((s, e) => s + e.weight, 0);
  let r = rng() * total;
  for (const e of EVENTS) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return EVENTS[0];
}
