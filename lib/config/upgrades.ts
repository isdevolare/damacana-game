export type UpgradeKind = 'tap' | 'auto';

export interface UpgradeDef {
  id: string;
  key: string;
  kind: UpgradeKind;
  baseCost: number;
  growth: number;
  amount: number;
  unlockLevel: number;
}

export const UPGRADES: UpgradeDef[] = [
  { id: 'bigSip',     key: 'bigSip',     kind: 'tap',  baseCost: 15,     growth: 1.18, amount: 1,    unlockLevel: 0 },
  { id: 'cosmicSip',  key: 'cosmicSip',  kind: 'tap',  baseCost: 120,    growth: 1.22, amount: 5,    unlockLevel: 1 },
  { id: 'voidLip',    key: 'voidLip',    kind: 'tap',  baseCost: 1500,   growth: 1.26, amount: 30,   unlockLevel: 3 },
  { id: 'axiomKiss',  key: 'axiomKiss',  kind: 'tap',  baseCost: 20_000, growth: 1.30, amount: 200,  unlockLevel: 4 },
  { id: 'faucet',     key: 'faucet',     kind: 'auto', baseCost: 50,     growth: 1.20, amount: 1,    unlockLevel: 0 },
  { id: 'damacanaPump', key: 'damacanaPump', kind: 'auto', baseCost: 400, growth: 1.22, amount: 5,    unlockLevel: 1 },
  { id: 'cosmicPipe', key: 'cosmicPipe', kind: 'auto', baseCost: 4000,   growth: 1.24, amount: 30,   unlockLevel: 2 },
  { id: 'voidFlow',   key: 'voidFlow',   kind: 'auto', baseCost: 30_000, growth: 1.28, amount: 150,  unlockLevel: 3 },
  { id: 'flowEngine', key: 'flowEngine', kind: 'auto', baseCost: 250_000,growth: 1.32, amount: 800,  unlockLevel: 5 },
];

export function upgradeCost(def: UpgradeDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.growth, currentLevel));
}

export function upgradeById(id: string) {
  return UPGRADES.find((u) => u.id === id);
}
