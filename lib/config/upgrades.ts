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

export interface UpgradeIdentityBonuses {
  activeDamagePct: number;
  burstDamagePct: number;
  bossChipPct: number;
  passiveProductionPct: number;
  passiveProjectileDamagePct: number;
  projectileDamagePct: number;
  projectileFireRatePct: number;
  projectileSpeedPct: number;
  projectileImpactPct: number;
  comboGainPct: number;
  comboDecayPct: number;
  critChancePct: number;
  critDamagePct: number;
  weakPointDamagePct: number;
  orbitDamagePct: number;
  orbitRadiusPct: number;
  aoeDamagePct: number;
}

export const EMPTY_UPGRADE_IDENTITY_BONUSES: UpgradeIdentityBonuses = {
  activeDamagePct: 0,
  burstDamagePct: 0,
  bossChipPct: 0,
  passiveProductionPct: 0,
  passiveProjectileDamagePct: 0,
  projectileDamagePct: 0,
  projectileFireRatePct: 0,
  projectileSpeedPct: 0,
  projectileImpactPct: 0,
  comboGainPct: 0,
  comboDecayPct: 0,
  critChancePct: 0,
  critDamagePct: 0,
  weakPointDamagePct: 0,
  orbitDamagePct: 0,
  orbitRadiusPct: 0,
  aoeDamagePct: 0,
};

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
  const level = Number.isFinite(currentLevel) ? Math.max(0, currentLevel) : 0;
  const first = Math.min(level, 25);
  const second = Math.min(Math.max(0, level - 25), 50);
  const third = Math.min(Math.max(0, level - 75), 75);
  const late = Math.max(0, level - 150);
  const scaled =
    Math.pow(def.growth, first) *
    Math.pow(def.growth + 0.005, second) *
    Math.pow(def.growth + 0.018, third) *
    Math.pow(def.growth + 0.04, late);
  const cost = def.baseCost * scaled;
  return Math.max(def.baseCost, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number.isFinite(cost) ? cost : def.baseCost)));
}

export function upgradeLevelWeight(level: number): number {
  if (level < 50) return 1;
  if (level < 150) return 0.8;
  if (level < 300) return 0.55;
  return 0.32;
}

export function upgradeTotalAmount(def: UpgradeDef, level: number): number {
  let total = 0;
  const safeLevel = Number.isFinite(level) ? Math.max(0, Math.min(10000, Math.floor(level))) : 0;
  for (let i = 0; i < safeLevel; i++) total += def.amount * upgradeLevelWeight(i);
  return Number.isFinite(total) ? total : 0;
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

function addCapped(current: number, add: number, cap: number) {
  return Math.min(cap, current + add);
}

function identityPower(def: UpgradeDef, level: number) {
  const total = upgradeTotalAmount(def, level);
  return Math.log1p(Math.max(0, total));
}

export function summarizeUpgradeIdentityBonuses(upgrades: Record<string, number> = {}): UpgradeIdentityBonuses {
  const out: UpgradeIdentityBonuses = { ...EMPTY_UPGRADE_IDENTITY_BONUSES };
  for (const def of UPGRADES) {
    const level = upgrades[def.id] ?? 0;
    if (level <= 0) continue;
    const power = identityPower(def, level);
    switch (def.identity) {
      case 'activeAttack':
        out.activeDamagePct = addCapped(out.activeDamagePct, power * 0.024, 0.68);
        out.burstDamagePct = addCapped(out.burstDamagePct, power * 0.014, 0.38);
        out.bossChipPct = addCapped(out.bossChipPct, power * 0.012, 0.32);
        break;
      case 'tapBurst':
        out.activeDamagePct = addCapped(out.activeDamagePct, power * 0.014, 0.68);
        out.burstDamagePct = addCapped(out.burstDamagePct, power * 0.033, 0.78);
        out.projectileDamagePct = addCapped(out.projectileDamagePct, power * 0.011, 0.7);
        break;
      case 'criticalPressure':
        out.comboGainPct = addCapped(out.comboGainPct, power * 0.022, 0.55);
        out.comboDecayPct = addCapped(out.comboDecayPct, power * 0.014, 0.42);
        out.critChancePct = addCapped(out.critChancePct, power * 0.006, 0.16);
        out.critDamagePct = addCapped(out.critDamagePct, power * 0.043, 0.95);
        break;
      case 'weakPointDamage':
        out.weakPointDamagePct = addCapped(out.weakPointDamagePct, power * 0.048, 1.15);
        out.critDamagePct = addCapped(out.critDamagePct, power * 0.024, 0.95);
        out.bossChipPct = addCapped(out.bossChipPct, power * 0.02, 0.32);
        break;
      case 'comboPressure':
        out.comboGainPct = addCapped(out.comboGainPct, power * 0.032, 0.55);
        out.comboDecayPct = addCapped(out.comboDecayPct, power * 0.026, 0.42);
        break;
      case 'passiveFlow':
        out.passiveProductionPct = addCapped(out.passiveProductionPct, power * 0.02, 0.72);
        out.passiveProjectileDamagePct = addCapped(out.passiveProjectileDamagePct, power * 0.016, 0.58);
        out.bossChipPct = addCapped(out.bossChipPct, power * 0.008, 0.32);
        break;
      case 'autoFire':
        out.projectileFireRatePct = addCapped(out.projectileFireRatePct, power * 0.018, 0.36);
        out.projectileSpeedPct = addCapped(out.projectileSpeedPct, power * 0.01, 0.28);
        out.passiveProjectileDamagePct = addCapped(out.passiveProjectileDamagePct, power * 0.014, 0.58);
        break;
      case 'orbitDamage':
        out.orbitDamagePct = addCapped(out.orbitDamagePct, power * 0.036, 0.9);
        out.orbitRadiusPct = addCapped(out.orbitRadiusPct, power * 0.01, 0.22);
        out.aoeDamagePct = addCapped(out.aoeDamagePct, power * 0.018, 0.5);
        break;
      case 'projectilePressure':
        out.projectileDamagePct = addCapped(out.projectileDamagePct, power * 0.025, 0.7);
        out.projectileFireRatePct = addCapped(out.projectileFireRatePct, power * 0.022, 0.36);
        out.projectileSpeedPct = addCapped(out.projectileSpeedPct, power * 0.014, 0.28);
        out.projectileImpactPct = addCapped(out.projectileImpactPct, power * 0.05, 1);
        break;
      case 'beamCadence':
        out.projectileDamagePct = addCapped(out.projectileDamagePct, power * 0.024, 0.7);
        out.projectileFireRatePct = addCapped(out.projectileFireRatePct, power * 0.028, 0.36);
        out.projectileSpeedPct = addCapped(out.projectileSpeedPct, power * 0.016, 0.28);
        out.bossChipPct = addCapped(out.bossChipPct, power * 0.02, 0.32);
        break;
    }
  }
  return out;
}
