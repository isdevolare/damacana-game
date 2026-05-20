export interface Tier {
  star: number;
  key: 'tier3' | 'tier5' | 'tier10' | 'tier15' | 'tier25';
  unlocked: (prestiges: number) => boolean;
}

export const TIERS: Tier[] = [
  { star: 3,  key: 'tier3',  unlocked: (p) => p >= 3 },
  { star: 5,  key: 'tier5',  unlocked: (p) => p >= 5 },
  { star: 10, key: 'tier10', unlocked: (p) => p >= 10 },
  { star: 15, key: 'tier15', unlocked: (p) => p >= 15 },
  { star: 25, key: 'tier25', unlocked: (p) => p >= 25 },
];

export function nextTier(prestiges: number): Tier | undefined {
  return TIERS.find((t) => !t.unlocked(prestiges));
}

export const ELITE_NAME_KEYS = [
  'warden',
  'crystalScribe',
  'lastEcho',
  'fractalKing',
  'hollowAxiom',
  'weightlessJudge',
  'broadcastSpecter',
  'siphonOfStars',
  'thresholdGuardian',
  'nullEntity',
] as const;

export type EliteNameKey = (typeof ELITE_NAME_KEYS)[number];

// Returns true if the boss at this tier should be an elite (when ★5+ unlocked).
// Roughly 25% chance at higher tiers (>=3), excluding mega tiers.
export function shouldBeElite(tier: number, prestigesUnlocked: boolean, rng = Math.random): boolean {
  if (!prestigesUnlocked) return false;
  if (tier <= 2) return false;
  if (tier % 5 === 0) return false; // mega tiers stay mega
  return rng() < 0.25;
}

export interface ShopItem {
  id: 'tapBoost' | 'flowBoost' | 'shardBoost';
  cost: number;
  pct: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'tapBoost',   cost: 1, pct: 0.10 },
  { id: 'flowBoost',  cost: 1, pct: 0.10 },
  { id: 'shardBoost', cost: 1, pct: 0.10 },
];
