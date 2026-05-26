export type UpgradeKind = 'tap' | 'auto';
export type UpgradeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic' | 'singularity';
export type UpgradeBuyMode = 'x1' | 'x10' | 'max';
export type UpgradeIdentity =
  | 'activeAttack'
  | 'tapBurst'
  | 'criticalPressure'
  | 'weakPointDamage'
  | 'comboPressure'
  | 'projectilePressure'
  | 'passiveFlow'
  | 'autoFire'
  | 'orbitDamage'
  | 'beamCadence';

export interface UpgradeDef {
  id: string;
  key: string;
  kind: UpgradeKind;
  identity: UpgradeIdentity;
  icon: string;
  rarity: UpgradeRarity;
  baseCost: number;
  growth: number;
  amount: number;
  unlockLevel: number;
}

export const UPGRADES: UpgradeDef[] = [
  { id: 'bigSip', key: 'bigSip', kind: 'tap', identity: 'activeAttack', icon: '⌁', rarity: 'common', baseCost: 15, growth: 1.18, amount: 1.18, unlockLevel: 0 },
  { id: 'cosmicSip', key: 'cosmicSip', kind: 'tap', identity: 'tapBurst', icon: '✦', rarity: 'rare', baseCost: 120, growth: 1.21, amount: 6.2, unlockLevel: 1 },
  { id: 'voidLip', key: 'voidLip', kind: 'tap', identity: 'criticalPressure', icon: '◆', rarity: 'epic', baseCost: 1500, growth: 1.245, amount: 39, unlockLevel: 3 },
  { id: 'axiomKiss', key: 'axiomKiss', kind: 'tap', identity: 'weakPointDamage', icon: '◇', rarity: 'legendary', baseCost: 20_000, growth: 1.255, amount: 295, unlockLevel: 4 },
  { id: 'faucet', key: 'faucet', kind: 'auto', identity: 'passiveFlow', icon: 'Ⅰ', rarity: 'common', baseCost: 50, growth: 1.19, amount: 1.16, unlockLevel: 0 },
  { id: 'damacanaPump', key: 'damacanaPump', kind: 'auto', identity: 'autoFire', icon: 'Ⅱ', rarity: 'rare', baseCost: 400, growth: 1.21, amount: 6.2, unlockLevel: 1 },
  { id: 'cosmicPipe', key: 'cosmicPipe', kind: 'auto', identity: 'orbitDamage', icon: 'Ⅲ', rarity: 'rare', baseCost: 4000, growth: 1.225, amount: 38, unlockLevel: 2 },
  { id: 'voidFlow', key: 'voidFlow', kind: 'auto', identity: 'projectilePressure', icon: 'Ⅴ', rarity: 'epic', baseCost: 30_000, growth: 1.24, amount: 220, unlockLevel: 3 },
  { id: 'flowEngine', key: 'flowEngine', kind: 'auto', identity: 'beamCadence', icon: '✺', rarity: 'cosmic', baseCost: 180_000, growth: 1.255, amount: 1280, unlockLevel: 5 },
];

export function upgradeCost(def: UpgradeDef, currentLevel: number): number {
  const level = Math.max(0, currentLevel);
  const first = Math.min(level, 25);
  const second = Math.min(Math.max(0, level - 25), 50);
  const third = Math.min(Math.max(0, level - 75), 75);
  const late = Math.max(0, level - 150);
  const scaled =
    Math.pow(def.growth, first) *
    Math.pow(def.growth + 0.005, second) *
    Math.pow(def.growth + 0.018, third) *
    Math.pow(def.growth + 0.04, late);
  return Math.max(def.baseCost, Math.floor(def.baseCost * scaled));
}

export function upgradeLevelWeight(level: number): number {
  if (level < 50) return 1;
  if (level < 150) return 0.8;
  if (level < 300) return 0.55;
  return 0.32;
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
