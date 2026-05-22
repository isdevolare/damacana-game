export type UpgradeKind = 'tap' | 'auto';
export type UpgradeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type UpgradeBuyMode = 'x1' | 'x10' | 'max';

export interface UpgradeDef {
  id: string;
  key: string;
  kind: UpgradeKind;
  icon: string;
  rarity: UpgradeRarity;
  baseCost: number;
  growth: number;
  amount: number;
  unlockLevel: number;
}

export const UPGRADES: UpgradeDef[] = [
  { id: 'bigSip', key: 'bigSip', kind: 'tap', icon: '+', rarity: 'common', baseCost: 15, growth: 1.18, amount: 1, unlockLevel: 0 },
  { id: 'cosmicSip', key: 'cosmicSip', kind: 'tap', icon: '*', rarity: 'rare', baseCost: 120, growth: 1.22, amount: 5, unlockLevel: 1 },
  { id: 'voidLip', key: 'voidLip', kind: 'tap', icon: '◆', rarity: 'epic', baseCost: 1500, growth: 1.26, amount: 30, unlockLevel: 3 },
  { id: 'axiomKiss', key: 'axiomKiss', kind: 'tap', icon: '◇', rarity: 'legendary', baseCost: 20_000, growth: 1.30, amount: 200, unlockLevel: 4 },
  { id: 'faucet', key: 'faucet', kind: 'auto', icon: 'I', rarity: 'common', baseCost: 50, growth: 1.20, amount: 1, unlockLevel: 0 },
  { id: 'damacanaPump', key: 'damacanaPump', kind: 'auto', icon: 'II', rarity: 'rare', baseCost: 400, growth: 1.22, amount: 5, unlockLevel: 1 },
  { id: 'cosmicPipe', key: 'cosmicPipe', kind: 'auto', icon: 'III', rarity: 'rare', baseCost: 4000, growth: 1.24, amount: 30, unlockLevel: 2 },
  { id: 'voidFlow', key: 'voidFlow', kind: 'auto', icon: 'V', rarity: 'epic', baseCost: 30_000, growth: 1.28, amount: 150, unlockLevel: 3 },
  { id: 'flowEngine', key: 'flowEngine', kind: 'auto', icon: 'X', rarity: 'legendary', baseCost: 250_000, growth: 1.32, amount: 800, unlockLevel: 5 },
];

export function upgradeCost(def: UpgradeDef, currentLevel: number): number {
  const level = Math.max(0, currentLevel);
  const first = Math.min(level, 25);
  const second = Math.min(Math.max(0, level - 25), 50);
  const third = Math.min(Math.max(0, level - 75), 75);
  const late = Math.max(0, level - 150);
  const scaled =
    Math.pow(def.growth, first) *
    Math.pow(def.growth + 0.015, second) *
    Math.pow(def.growth + 0.035, third) *
    Math.pow(def.growth + 0.06, late);
  return Math.max(def.baseCost, Math.floor(def.baseCost * scaled));
}

export function upgradeLevelWeight(level: number): number {
  if (level < 50) return 1;
  if (level < 150) return 0.65;
  if (level < 300) return 0.35;
  return 0.18;
}

export function upgradeTotalAmount(def: UpgradeDef, level: number): number {
  let total = 0;
  for (let i = 0; i < level; i++) total += def.amount * upgradeLevelWeight(i);
  return total;
}

export function upgradeBulkCost(def: UpgradeDef, currentLevel: number, count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += upgradeCost(def, currentLevel + i);
  return Math.floor(total);
}

export function affordableUpgradeCount(def: UpgradeDef, currentLevel: number, currency: number, requested: number): number {
  const limit = Math.max(0, Math.min(requested, 100));
  let total = 0;
  let count = 0;
  for (let i = 0; i < limit; i++) {
    const next = upgradeCost(def, currentLevel + i);
    if (total + next > currency) break;
    total += next;
    count += 1;
  }
  return count;
}

export function upgradeById(id: string) {
  return UPGRADES.find((u) => u.id === id);
}
