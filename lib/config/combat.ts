import type { Chapter } from './chapters';

export type CombatAbilityId = 'waveBurst' | 'orbitSlash' | 'coreHeal';

export interface CombatStats {
  maxHp: number;
  maxMana: number;
  hpRegen: number;
  manaRegen: number;
  armor: number;
  damageReduction: number;
}

export interface CombatStatBonuses {
  maxHp: number;
  maxMana: number;
  hpRegen: number;
  manaRegen: number;
  armor: number;
  damageReduction: number;
}

export interface CombatAbilityDef {
  id: CombatAbilityId;
  key: string;
  manaCost: number;
  cooldownMs: number;
  radius: number;
  damageMult?: number;
  durationMs?: number;
  healPct?: number;
}

export interface CombatChapterStyle {
  enemy: string;
  enemyGlow: string;
  weak: string;
  arenaGlow: string;
  speedMult: number;
  aggression: number;
}

export function combatStyleForChapter(chapter: Chapter): CombatChapterStyle {
  switch (chapter.id) {
    case 'mars':
      return {
        enemy: '#ff6b4a',
        enemyGlow: 'rgba(255,107,74,0.7)',
        weak: '#ffd166',
        arenaGlow: 'rgba(255,64,48,0.18)',
        speedMult: 1.22,
        aggression: 1.25,
      };
    case 'saturn':
      return {
        enemy: '#ffd166',
        enemyGlow: 'rgba(255,209,102,0.64)',
        weak: '#5cf6ff',
        arenaGlow: 'rgba(255,209,102,0.15)',
        speedMult: 1.06,
        aggression: 1.08,
      };
    case 'uranus':
      return {
        enemy: '#80fff4',
        enemyGlow: 'rgba(128,255,244,0.62)',
        weak: '#ff5ce8',
        arenaGlow: 'rgba(128,255,244,0.14)',
        speedMult: 1.12,
        aggression: 1.12,
      };
    case 'neptune':
      return {
        enemy: '#4a7dff',
        enemyGlow: 'rgba(74,125,255,0.72)',
        weak: '#ffd166',
        arenaGlow: 'rgba(74,125,255,0.18)',
        speedMult: 1.18,
        aggression: 1.18,
      };
    case 'redDwarf':
      return {
        enemy: '#ff4d3d',
        enemyGlow: 'rgba(255,77,61,0.68)',
        weak: '#ffd166',
        arenaGlow: 'rgba(255,77,61,0.16)',
        speedMult: 1.22,
        aggression: 1.2,
      };
    case 'whiteDwarf':
      return {
        enemy: '#dffcff',
        enemyGlow: 'rgba(223,252,255,0.7)',
        weak: '#ff5ce8',
        arenaGlow: 'rgba(223,252,255,0.14)',
        speedMult: 1.16,
        aggression: 1.24,
      };
    case 'giantStar':
      return {
        enemy: '#ffb23f',
        enemyGlow: 'rgba(255,178,63,0.7)',
        weak: '#5cf6ff',
        arenaGlow: 'rgba(255,178,63,0.17)',
        speedMult: 1.08,
        aggression: 1.18,
      };
    case 'supernova':
      return {
        enemy: '#ff5ce8',
        enemyGlow: 'rgba(255,92,232,0.72)',
        weak: '#ffd166',
        arenaGlow: 'rgba(255,92,232,0.2)',
        speedMult: 1.24,
        aggression: 1.28,
      };
    case 'earth':
    default:
      return {
        enemy: '#5cf6ff',
        enemyGlow: 'rgba(92,246,255,0.64)',
        weak: '#ff5ce8',
        arenaGlow: 'rgba(92,246,255,0.14)',
        speedMult: 0.92,
        aggression: 0.9,
      };
  }
}

export const COMBAT = {
  playerMaxHp: 500,
  baseMaxMana: 100,
  hpRegenPerSec: 1.2,
  manaRegenPerSec: 4.5,
  baseArmor: 0,
  baseDamageReduction: 0.1,
  comboManaOnHit: 1.2,
  weakManaOnHit: 5,
  playerHpPerLevel: 18,
  playerManaPerLevel: 3,
  contactDamage: 14,
  bossPulseDamage: 28,
  contactCooldownMs: 1100,
  globalContactCooldownMs: 650,
  playerContactRadius: 13,
  bossPulseWarningMs: 1150,
  bossPulseSpeed: 0.03,
  bossPulseDamageBand: 4.8,
  collapseRecoveryMs: 5000,
  collapseOverlayMs: 1500,
  collapseRestoreDelayMs: 1300,
  bossCollapseHealMinPct: 0.05,
  bossCollapseHealMaxPct: 0.1,
  weakPointDurationMs: 1350,
  enemySpawnDelayMs: 3400,
  passiveOrbitMs: 850,
  bossWeakMinMs: 5200,
  bossWeakMaxMs: 8400,
};

export const BASE_COMBAT_STATS: CombatStats = {
  maxHp: COMBAT.playerMaxHp,
  maxMana: COMBAT.baseMaxMana,
  hpRegen: COMBAT.hpRegenPerSec,
  manaRegen: COMBAT.manaRegenPerSec,
  armor: COMBAT.baseArmor,
  damageReduction: COMBAT.baseDamageReduction,
};

export const EMPTY_COMBAT_STAT_BONUSES: CombatStatBonuses = {
  maxHp: 0,
  maxMana: 0,
  hpRegen: 0,
  manaRegen: 0,
  armor: 0,
  damageReduction: 0,
};

export const COMBAT_ABILITIES: CombatAbilityDef[] = [
  {
    id: 'waveBurst',
    key: 'waveBurst',
    manaCost: 30,
    cooldownMs: 8_000,
    radius: 30,
    damageMult: 5.2,
  },
  {
    id: 'orbitSlash',
    key: 'orbitSlash',
    manaCost: 45,
    cooldownMs: 14_000,
    radius: 28,
    damageMult: 1.7,
    durationMs: 4_000,
  },
  {
    id: 'coreHeal',
    key: 'coreHeal',
    manaCost: 60,
    cooldownMs: 25_000,
    radius: 0,
    healPct: 0.35,
  },
];

export function combatAbilityById(id: CombatAbilityId) {
  return COMBAT_ABILITIES.find((ability) => ability.id === id);
}
