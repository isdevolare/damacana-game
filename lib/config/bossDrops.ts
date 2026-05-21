export type BossDropId =
  | 'coreSurge'
  | 'manaFlood'
  | 'shieldFragment'
  | 'comboStabilizer'
  | 'orbitCharge'
  | 'shardSpark';

export type BossDropBuffType = 'tap' | 'manaRegen' | 'shield' | 'comboDecay' | 'orbitDamage';

export interface BossDropDef {
  id: BossDropId;
  i18nKey: BossDropId;
  weight: number;
  durationMs?: number;
  buffType?: BossDropBuffType;
  mult?: number;
  shardGain?: number;
}

export const BOSS_DROPS: BossDropDef[] = [
  { id: 'coreSurge', i18nKey: 'coreSurge', weight: 22, durationMs: 20_000, buffType: 'tap', mult: 1.3 },
  { id: 'manaFlood', i18nKey: 'manaFlood', weight: 18, durationMs: 20_000, buffType: 'manaRegen', mult: 1.5 },
  { id: 'shieldFragment', i18nKey: 'shieldFragment', weight: 18, durationMs: 12_000, buffType: 'shield', mult: 0.45 },
  { id: 'comboStabilizer', i18nKey: 'comboStabilizer', weight: 17, durationMs: 25_000, buffType: 'comboDecay', mult: 1.55 },
  { id: 'orbitCharge', i18nKey: 'orbitCharge', weight: 17, durationMs: 20_000, buffType: 'orbitDamage', mult: 1.4 },
  { id: 'shardSpark', i18nKey: 'shardSpark', weight: 8, shardGain: 1 },
];

export function bossDropById(id: BossDropId) {
  return BOSS_DROPS.find((drop) => drop.id === id);
}

export function rollBossDrop(finalPhase: boolean): BossDropDef | null {
  const chance = finalPhase ? 0.9 : 0.62;
  if (Math.random() > chance) return null;
  const total = BOSS_DROPS.reduce((sum, drop) => sum + drop.weight, 0);
  let roll = Math.random() * total;
  for (const drop of BOSS_DROPS) {
    roll -= drop.weight;
    if (roll <= 0) return drop;
  }
  return BOSS_DROPS[0];
}
