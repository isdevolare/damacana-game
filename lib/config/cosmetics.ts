import { bossPhaseInfo } from './bossMissions';
import type { ArtifactRarity } from './artifacts';

export type CosmeticCrateId = 'basic' | 'rare' | 'cosmic';

export interface CosmeticCrateDef {
  id: CosmeticCrateId;
  i18nKey: string;
  hp: number;
  size: number;
  creditMin: number;
  creditMax: number;
  color: string;
  glow: string;
  weight: number;
  shardChance: number;
}

export const SKIN_CREDIT_LIMIT = 999_999;

export const COSMETIC_CRATE_SPAWN = {
  desktopMinMs: 55_000,
  desktopMaxMs: 105_000,
  mobileMinMs: 80_000,
  mobileMaxMs: 145_000,
  desktopCap: 2,
  mobileCap: 1,
} as const;

export const COSMETIC_CRATES: CosmeticCrateDef[] = [
  {
    id: 'basic',
    i18nKey: 'basic',
    hp: 2,
    size: 18,
    creditMin: 4,
    creditMax: 8,
    color: '#5cf6ff',
    glow: 'rgba(92,246,255,0.58)',
    weight: 76,
    shardChance: 0,
  },
  {
    id: 'rare',
    i18nKey: 'rare',
    hp: 3,
    size: 22,
    creditMin: 12,
    creditMax: 22,
    color: '#ffd166',
    glow: 'rgba(255,209,102,0.62)',
    weight: 21,
    shardChance: 0.08,
  },
  {
    id: 'cosmic',
    i18nKey: 'cosmic',
    hp: 4,
    size: 26,
    creditMin: 38,
    creditMax: 70,
    color: '#ff5ce8',
    glow: 'rgba(255,92,232,0.68)',
    weight: 3,
    shardChance: 0.2,
  },
];

export function randomSkinCredits(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function rollCosmeticCrateType(): CosmeticCrateDef {
  const total = COSMETIC_CRATES.reduce((sum, crate) => sum + crate.weight, 0);
  let roll = Math.random() * total;
  for (const crate of COSMETIC_CRATES) {
    roll -= crate.weight;
    if (roll <= 0) return crate;
  }
  return COSMETIC_CRATES[0];
}

export function nextCosmeticCrateDelayMs(mobile: boolean) {
  const min = mobile ? COSMETIC_CRATE_SPAWN.mobileMinMs : COSMETIC_CRATE_SPAWN.desktopMinMs;
  const max = mobile ? COSMETIC_CRATE_SPAWN.mobileMaxMs : COSMETIC_CRATE_SPAWN.desktopMaxMs;
  return randomSkinCredits(min, max);
}

export function skinCreditRewardForBoss(defeatedTier: number) {
  const info = bossPhaseInfo(defeatedTier);
  const phaseBonus = Math.max(0, info.phase - 1);
  const arcBonus = info.chapter.arcId === 'star' ? 6 : 0;
  return info.finalPhase ? 34 + arcBonus + phaseBonus * 2 : 4 + arcBonus + Math.floor(phaseBonus * 0.35);
}

export function duplicateArtifactSkinCredits(rarity: ArtifactRarity) {
  switch (rarity) {
    case 'cosmic':
      return 90;
    case 'corrupted':
      return 60;
    case 'epic':
      return 38;
    case 'rare':
      return 18;
    default:
      return 8;
  }
}
