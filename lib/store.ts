'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BALANCE } from './config/balance';
import { prestigePermanentBonuses, prestigeShardGain } from './config/prestige';
import { LEVELS, activeLevels, levelForTotal } from './config/levels';
import { UPGRADES, upgradeById, upgradeCost } from './config/upgrades';
import { bossHp, bossNameKey, bossReward, isMegaBoss, shardDropChance, eliteBossHp } from './config/bosses';
import { nodeById, previousNode } from './config/skillTree';
import { AbsurdEvent, AnomalyEffectType, EventReward, pickRandomEvent } from './config/events';
import { CATEGORIES, categoryComplete, factById, pickFactForLevel, pickRandomBonusFact } from './config/facts';
import { ELITE_NAME_KEYS, KNOWLEDGE_BULB_TIMING, OFFLINE_PROGRESS, SHOP_ITEMS, shouldBeElite } from './config/progression';
import { ChapterId, firstCompletableChapter, nextChapter } from './config/chapters';
import { bossPhaseInfo } from './config/bossMissions';
import { BossDropId, rollBossDrop } from './config/bossDrops';
import { EnemyVariantId } from './config/enemyVariants';
import {
  BASE_COMBAT_STATS,
  COMBAT,
  CombatAbilityId,
  CombatStatBonuses,
  CombatStats,
  EMPTY_COMBAT_STAT_BONUSES,
  combatAbilityById,
} from './config/combat';
import {
  EMPTY_RESEARCH_BONUSES,
  ResearchBonusSummary,
  researchById,
  summarizeResearchBonuses,
} from './config/research';
import {
  BuildBonusSummary,
  EMPTY_BUILD_BONUSES,
  buildNodeById,
  previousBuildNode,
  summarizeBuildBonuses,
} from './config/buildTree';

export interface Buff {
  id: string;
  expiresAt: number;
  mult: number;
  type: 'tap' | 'flow' | 'manaRegen' | 'comboDecay' | AnomalyEffectType;
  labelKey?: string;
}

export interface BossState {
  tier: number;
  nameKey: string;
  hpCur: number;
  hpMax: number;
  isElite: boolean;
}

export interface CombatHitOptions {
  damageMult?: number;
  rewardMult?: number;
  comboBoost?: number;
  comboFlatBonus?: number;
  forceCrit?: boolean;
  passive?: boolean;
  silent?: boolean;
}

export interface BossPhaseToast {
  id: number;
  chapterId: ChapterId;
  phase: number;
  totalPhases: number;
  finalPhase: boolean;
  dropId: BossDropId | null;
  shardGain: number;
  expiresAt: number;
}

interface Persisted {
  // run
  damacana: number;
  totalEarned: number;
  levelIdx: number;
  upgrades: Record<string, number>;
  boss: BossState;
  activeAbilityCooldowns: Record<string, number>;
  activeBuffs: Buff[];
  tapsThisRun: number;
  perRunPerTapPctBonus: number;
  bossKillsThisRun: number;
  runStartAt: number;
  // permanent
  shards: number;
  crystals: number;
  tree: Record<string, boolean>;
  totalPrestiges: number;
  prestigePromptDismissedRunAt: number;
  bestLevel: number;
  bestBossTier: number;
  collectedFacts: string[];
  achievements: string[];
  bossKillsLifetime: number;
  bestCombo: number;
  fastestLevel6Ms: number | null;
  totalPlayMs: number;
  lastActiveAt: number;
  offlineMaxMs: number;
  voidBurstUses: number;
  completedChapters: ChapterId[];
  discoveredEnemyTypeIds: EnemyVariantId[];
  knowledgeBulbsCollected: number;
  nextKnowledgeBulbAt: number;
  playerHp: number;
  playerMana: number;
  combatStatBonuses: CombatStatBonuses;
  combatAbilityCooldowns: Record<string, number>;
  completedResearchIds: string[];
  claimedResearchIds: string[];
  activeResearchId: string | null;
  activeResearchStartAt: number;
  activeResearchEndAt: number;
  researchBonuses: ResearchBonusSummary;
  ownedBuildNodeIds: string[];
  buildBonuses: BuildBonusSummary;
  shop: { tapBoost: number; flowBoost: number; shardBoost: number };
  // audio settings
  audio: { master: number; music: number; sfx: number; muted: boolean };
  // first-time gate
  hasStarted: boolean;
}

export interface GameState extends Persisted {
  // UI ephemera (not persisted)
  combo: number;
  lastTapAt: number;
  showEvolution: { name: string; desc: string } | null;
  showPrestige: boolean;
  showTree: boolean;
  showSettings: boolean;
  showCodex: boolean;
  showAchievements: boolean;
  showProgression: boolean;
  showShop: boolean;
  showProfile: boolean;
  showResearch: boolean;
  showBuildTree: boolean;
  currentEvent: AbsurdEvent | null;
  floatingNumbers: Array<{ id: number; value: number; x: number; y: number; crit?: boolean }>;
  shake: { intensity: 'small' | 'medium' | 'hard'; at: number } | null;
  recentEarnings: Array<{ t: number; amount: number }>;
  // bulb / fact system
  currentBulb: { factId: string; expiresAt: number; x: number; y: number } | null;
  lastBulbAt: number;
  pendingBulbLevel: number | null;
  currentFact: string | null;
  // achievement toast
  achievementToast: string | null;
  showChapterComplete: { chapterId: ChapterId; nextChapterId: ChapterId | null } | null;
  offlineReward: { awayMs: number; gained: number } | null;
  researchCompletedNotice: string | null;
  bossPhaseToast: BossPhaseToast | null;
  enemyDiscoveryToast: EnemyVariantId | null;

  // actions
  tapDamacana: (clientX?: number, clientY?: number, options?: CombatHitOptions) => void;
  tickAuto: (dtMs: number) => void;
  buyUpgrade: (id: string) => void;
  buyTreeNode: (id: string) => void;
  fireAbility: (id: 'voidBurst' | 'flood' | 'timeLoop') => void;
  applyCombatDamage: (amount: number) => { damage: number; hp: number; collapsed: boolean };
  healCombatHp: (amount: number) => void;
  restoreCombatMana: (amount: number) => void;
  regenCombatResources: (dtMs: number) => void;
  spendCombatAbility: (id: CombatAbilityId) => boolean;
  boostCombatCombo: (amount: number) => void;
  reduceCombatCombo: (pct: number) => void;
  setShowTree: (v: boolean) => void;
  setShowPrestige: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setShowCodex: (v: boolean) => void;
  setShowAchievements: (v: boolean) => void;
  setShowProgression: (v: boolean) => void;
  setShowShop: (v: boolean) => void;
  setShowProfile: (v: boolean) => void;
  setShowResearch: (v: boolean) => void;
  setShowBuildTree: (v: boolean) => void;
  dismissEvolution: () => void;
  dismissChapterComplete: () => void;
  dismissOfflineReward: () => void;
  startResearch: (id: string) => void;
  claimResearch: (id: string) => void;
  refreshResearchProgress: () => void;
  dismissResearchNotice: () => void;
  dismissBossPhaseToast: () => void;
  discoverEnemyType: (id: EnemyVariantId) => void;
  dismissEnemyDiscoveryToast: () => void;
  buyBuildNode: (id: string) => void;
  claimOfflineProgress: () => void;
  triggerEvent: () => void;
  resolveEventChoice: (key: string) => void;
  dismissEvent: () => void;
  prestige: () => void;
  setAudioSetting: (partial: Partial<Persisted['audio']>) => void;
  start: () => void;
  reset: () => void;
  pushFloating: (value: number, x: number, y: number, crit?: boolean) => void;
  consumeShake: () => void;
  // bulb / fact
  spawnBulbForLevel: (level: number) => void;
  spawnRandomBulb: () => void;
  scheduleNextKnowledgeBulb: () => void;
  tapBulb: () => void;
  expireBulb: () => void;
  closeFactCard: () => void;
  // achievements
  unlockAchievement: (id: string) => void;
  dismissAchievementToast: () => void;
  // shop
  buyShopItem: (id: 'tapBoost' | 'flowBoost' | 'shardBoost') => void;
  addPlayTime: (ms: number) => void;
}

function freshBoss(tier: number, levelIdx: number, eliteUnlocked: boolean): BossState {
  const elite = shouldBeElite(tier, eliteUnlocked);
  const hpMax = elite ? eliteBossHp(tier, levelIdx) : bossHp(tier, levelIdx);
  const nameKey = elite
    ? ELITE_NAME_KEYS[(tier - 1) % ELITE_NAME_KEYS.length]
    : bossNameKey(tier);
  return { tier, nameKey, hpCur: hpMax, hpMax, isElite: elite };
}

// Codex artifact bonuses (★15): completed categories grant permanent bonuses.
function codexBonuses(state: Persisted): { tap: number; flow: number; shard: number } {
  const out = { tap: 0, flow: 0, shard: 0 };
  if (state.totalPrestiges < 15) return out;
  const collected = new Set(state.collectedFacts);
  for (const cat of CATEGORIES) {
    if (!categoryComplete(cat, collected)) continue;
    if (cat === 'cosmos' || cat === 'future') out.shard += 0.05;
    else if (cat === 'quantum' || cat === 'life') out.tap += 0.05;
    else out.flow += 0.05;
  }
  return out;
}

function derivedPerTap(state: Persisted): number {
  let base = 1;
  for (const def of UPGRADES.filter((u) => u.kind === 'tap')) {
    const lvl = state.upgrades[def.id] ?? 0;
    base += def.amount * lvl;
  }
  let mult = 1 + state.perRunPerTapPctBonus;
  for (const id of Object.keys(state.tree)) {
    if (!state.tree[id]) continue;
    const n = nodeById(id);
    if (!n) continue;
    if (n.effect === 'tapMult' && n.value) mult *= 1 + n.value;
  }
  mult *= 1 + state.shop.tapBoost * 0.1;
  mult *= 1 + codexBonuses(state).tap;
  mult *= 1 + prestigePermanentBonuses(state.totalPrestiges).globalProductionPct;
  mult *= 1 + (state.totalPrestiges > 0 ? researchBonuses(state).postPrestigeProductionPct : 0);
  mult *= 1 + buildBonuses(state).unstableRewardPct;
  const now = Date.now();
  for (const b of state.activeBuffs) {
    if (b.type === 'tap' && b.expiresAt > now) mult *= b.mult;
  }
  return Math.max(1, Math.floor(base * mult));
}

function derivedPerSec(state: Persisted): number {
  let base = 0;
  for (const def of UPGRADES.filter((u) => u.kind === 'auto')) {
    const lvl = state.upgrades[def.id] ?? 0;
    base += def.amount * lvl;
  }
  let mult = 1;
  for (const id of Object.keys(state.tree)) {
    if (!state.tree[id]) continue;
    const n = nodeById(id);
    if (!n) continue;
    if (n.effect === 'flowMult' && n.value) mult *= 1 + n.value;
  }
  mult *= 1 + state.shop.flowBoost * 0.1;
  mult *= 1 + codexBonuses(state).flow;
  mult *= 1 + prestigePermanentBonuses(state.totalPrestiges).globalProductionPct;
  mult *= 1 + researchBonuses(state).passiveProductionPct;
  mult *= 1 + (state.totalPrestiges > 0 ? researchBonuses(state).postPrestigeProductionPct : 0);
  mult *= 1 + buildBonuses(state).passiveProductionPct;
  const now = Date.now();
  for (const b of state.activeBuffs) {
    if (b.type === 'flow' && b.expiresAt > now) mult *= b.mult;
  }
  return Math.floor(base * mult);
}

function activeBuffMult(state: Persisted, type: Buff['type'], fallback = 1): number {
  const now = Date.now();
  let mult = fallback;
  for (const b of state.activeBuffs) {
    if (b.type === type && b.expiresAt > now) mult *= b.mult;
  }
  return mult;
}

function activeBuffMax(state: Persisted, type: Buff['type']): number {
  const now = Date.now();
  let max = 0;
  for (const b of state.activeBuffs) {
    if (b.type === type && b.expiresAt > now) max = Math.max(max, b.mult);
  }
  return max;
}

function shardGainMult(state: Persisted): number {
  return (1 + state.shop.shardBoost * 0.1) * (1 + codexBonuses(state).shard) * (1 + buildBonuses(state).shardGainPct);
}

function researchBonuses(state: Persisted): ResearchBonusSummary {
  return state.researchBonuses ?? summarizeResearchBonuses(state.claimedResearchIds ?? []);
}

function buildBonuses(state: Persisted): BuildBonusSummary {
  return state.buildBonuses ?? summarizeBuildBonuses(state.ownedBuildNodeIds ?? []);
}

function researchRewardMult(state: Persisted): number {
  return 1 + researchBonuses(state).rewardMultiplierPct + prestigePermanentBonuses(state.totalPrestiges).rewardGainPct;
}

function researchShardChanceMult(state: Persisted): number {
  return 1 + researchBonuses(state).shardChancePct;
}

function researchRequirementMet(state: Persisted, id: string): boolean {
  const research = researchById(id);
  if (!research) return false;
  const req = research.requirement;
  if (req.type === 'none') return true;
  if (req.type === 'prestigeOrShard') return state.totalPrestiges > 0 || state.shards > 0;
  const passive = derivedPerSec(state);
  return passive >= req.min || Boolean(req.fallbackChapter && state.completedChapters.includes(req.fallbackChapter));
}

function researchCostMet(state: Persisted, id: string): boolean {
  const research = researchById(id);
  if (!research) return false;
  if (research.cost.currency === 'shards') return state.shards >= research.cost.amount;
  return state.damacana >= research.cost.amount;
}

function buildCostMet(state: Persisted, id: string): boolean {
  const node = buildNodeById(id);
  if (!node) return false;
  if (node.cost.currency === 'shards') return state.shards >= node.cost.amount;
  return state.damacana >= node.cost.amount;
}

function buildRequirementMet(state: Persisted, id: string): boolean {
  const node = buildNodeById(id);
  if (!node) return false;
  const prev = previousBuildNode(node);
  return !prev || (state.ownedBuildNodeIds ?? []).includes(prev.id);
}

function derivedAutoTapRate(state: Persisted): number {
  let r = 0;
  for (const id of Object.keys(state.tree)) {
    if (!state.tree[id]) continue;
    const n = nodeById(id);
    if (!n) continue;
    if (n.effect === 'autoTapRate' && n.value) r += n.value;
  }
  if (state.tree['fastPump']) r *= 2;
  if (state.tree['infiniteFlow'] && r < 2) r = 2;
  return r;
}

function derivedCombatStats(state: Persisted): CombatStats {
  const bonuses = state.combatStatBonuses ?? EMPTY_COMBAT_STAT_BONUSES;
  const research = researchBonuses(state);
  const build = buildBonuses(state);
  const prestige = prestigePermanentBonuses(state.totalPrestiges);
  const levelHp = state.bestLevel * COMBAT.playerHpPerLevel;
  const levelMana = state.bestLevel * COMBAT.playerManaPerLevel;
  const baseHp = BASE_COMBAT_STATS.maxHp + levelHp + bonuses.maxHp;
  const baseManaRegen = BASE_COMBAT_STATS.manaRegen + bonuses.manaRegen;
  const baseHpRegen = BASE_COMBAT_STATS.hpRegen + bonuses.hpRegen;
  return {
    maxHp: baseHp * (1 + research.maxHpPct + build.maxHpPct + prestige.maxHpPct),
    maxMana: (BASE_COMBAT_STATS.maxMana + levelMana + bonuses.maxMana) * (1 + prestige.maxManaPct),
    hpRegen: baseHpRegen * (1 + build.hpRegenPct),
    manaRegen: baseManaRegen * (1 + research.manaRegenPct + build.manaRegenPct + prestige.manaRegenPct) * activeBuffMult(state, 'manaRegen'),
    armor: BASE_COMBAT_STATS.armor + bonuses.armor + build.armor,
    damageReduction: Math.min(0.75, BASE_COMBAT_STATS.damageReduction + bonuses.damageReduction + build.damageReductionPct),
  };
}

function comboMax(state: Persisted): number {
  return state.tree['comboMaster'] ? BALANCE.combo.masterMax : BALANCE.combo.baseMax;
}

function effectiveComboPower(combo: number): number {
  if (combo <= 100) return Math.max(1, combo);
  if (combo <= 500) return 100 + Math.sqrt(combo - 100) * 5;
  return Math.min(300, 200 + Math.log10(combo - 400) * 34);
}

function tapHasCrit(state: Persisted): { crit: boolean; mult: number } {
  let chance = 0;
  if (state.tree['critDrop']) chance += BALANCE.crit.critDropChance;
  let m = BALANCE.crit.critMult;
  if (state.tree['voidClaw']) m = BALANCE.crit.voidClawCritMult;
  return { crit: Math.random() < chance, mult: m };
}

function applyRewardToState(state: Persisted, reward: EventReward): Partial<Persisted> {
  const patch: Partial<Persisted> = {};
  const now = Date.now();
  switch (reward.type) {
    case 'dmc':
      patch.damacana = Math.max(0, state.damacana + reward.amount);
      patch.totalEarned = state.totalEarned + Math.max(0, reward.amount);
      break;
    case 'shards':
      patch.shards = state.shards + reward.amount;
      break;
    case 'buffTap':
      patch.activeBuffs = [
        ...state.activeBuffs.filter((b) => b.id !== 'event_tap' && b.expiresAt > now),
        { id: 'event_tap', expiresAt: now + reward.durationMs, mult: reward.mult, type: 'tap', labelKey: 'tap' },
      ];
      break;
    case 'buffFlow':
      patch.activeBuffs = [
        ...state.activeBuffs.filter((b) => b.id !== 'event_flow' && b.expiresAt > now),
        { id: 'event_flow', expiresAt: now + reward.durationMs, mult: reward.mult, type: 'flow', labelKey: 'flow' },
      ];
      break;
    case 'buffAnomaly':
      patch.activeBuffs = [
        ...state.activeBuffs.filter((b) => b.expiresAt > now),
        {
          id: `anomaly_${reward.effect}_${now}_${Math.random().toString(36).slice(2, 7)}`,
          expiresAt: now + reward.durationMs,
          mult: reward.mult,
          type: reward.effect,
          labelKey: reward.labelKey ?? reward.effect,
        },
      ];
      break;
    case 'mana': {
      const stats = derivedCombatStats(state);
      patch.playerMana = Math.max(0, Math.min(stats.maxMana, (state.playerMana ?? stats.maxMana) + reward.amount));
      break;
    }
    case 'hp': {
      const stats = derivedCombatStats(state);
      patch.playerHp = Math.max(1, Math.min(stats.maxHp, (state.playerHp ?? stats.maxHp) + reward.amount));
      break;
    }
    case 'pctLoss':
      patch.damacana = Math.floor(state.damacana * (1 - reward.pct));
      break;
    case 'perTapPct':
      patch.perRunPerTapPctBonus = state.perRunPerTapPctBonus + reward.pct;
      break;
    case 'restoreBossHp':
      patch.boss = { ...state.boss, hpCur: state.boss.hpMax };
      break;
    case 'bossHpPct':
      patch.boss = {
        ...state.boss,
        hpCur: Math.max(1, Math.min(state.boss.hpMax, state.boss.hpCur + state.boss.hpMax * reward.pct)),
      };
      break;
    case 'flowLossSeconds': {
      const ps = derivedPerSec(state);
      patch.damacana = Math.max(0, state.damacana - ps * reward.seconds);
      break;
    }
    case 'cooldownReduce': {
      const reduceCooldowns = (cooldowns: Record<string, number>) => Object.fromEntries(
        Object.entries(cooldowns).map(([id, readyAt]) => {
          if (readyAt <= now) return [id, readyAt];
          return [id, now + (readyAt - now) * (1 - reward.pct)];
        }),
      );
      patch.activeAbilityCooldowns = reduceCooldowns(state.activeAbilityCooldowns);
      patch.combatAbilityCooldowns = reduceCooldowns(state.combatAbilityCooldowns);
      break;
    }
    case 'nothing':
      break;
  }
  return patch;
}

function randomKnowledgeDelayMs() {
  const { minMs, maxMs } = KNOWLEDGE_BULB_TIMING;
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

function randomKnowledgeBulbPoint(): { x: number; y: number } {
  const mobile = typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 640px), (pointer: coarse)').matches
    : false;
  const bounds = mobile
    ? { minX: 24, maxX: 76, minY: 34, maxY: 58 }
    : { minX: 18, maxX: 82, minY: 34, maxY: 66 };
  for (let i = 0; i < 12; i++) {
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    const bossDist = Math.hypot(x - 50, y - 24);
    const playerDist = Math.hypot(x - 50, y - 70);
    if (bossDist > 18 && playerDist > 18) return { x, y };
  }
  return mobile ? { x: 34 + Math.random() * 32, y: 42 + Math.random() * 12 } : { x: 30 + Math.random() * 40, y: 42 + Math.random() * 16 };
}

function completeChapterPatch(
  state: Persisted,
  defeatedBossTier: number,
): Partial<Pick<Persisted, 'completedChapters'>> & { showChapterComplete?: GameState['showChapterComplete'] } {
  const chapter = firstCompletableChapter(state.completedChapters, state.levelIdx, defeatedBossTier);
  if (!chapter) return {};
  const completedChapters = [...state.completedChapters, chapter.id];
  const upcoming = nextChapter(chapter.id);
  return {
    completedChapters,
    showChapterComplete: { chapterId: chapter.id, nextChapterId: upcoming?.id ?? null },
  };
}

let floatingIdCounter = 1;
let bossPhaseToastCounter = 1;

function bossDefeatDropPatch(
  state: Persisted,
  defeatedTier: number,
  now: number,
): { activeBuffs: Buff[]; shardGain: number; toast: BossPhaseToast } {
  const info = bossPhaseInfo(defeatedTier);
  const drop = rollBossDrop(info.finalPhase);
  let activeBuffs = state.activeBuffs.filter((buff) => buff.expiresAt > now);
  let shardGain = 0;
  if (drop?.buffType && drop.durationMs && drop.mult) {
    activeBuffs = [
      ...activeBuffs.filter((buff) => buff.id !== `boss_drop_${drop.id}`),
      {
        id: `boss_drop_${drop.id}`,
        expiresAt: now + drop.durationMs,
        mult: drop.mult,
        type: drop.buffType,
        labelKey: `bossDrop_${drop.id}`,
      },
    ];
  }
  if (drop?.shardGain) shardGain += drop.shardGain;
  return {
    activeBuffs,
    shardGain,
    toast: {
      id: bossPhaseToastCounter++,
      chapterId: info.chapter.id,
      phase: info.phase,
      totalPhases: info.totalPhases,
      finalPhase: info.finalPhase,
      dropId: drop?.id ?? null,
      shardGain,
      expiresAt: now + 3200,
    },
  };
}

const initialState: Persisted = {
  damacana: 0,
  totalEarned: 0,
  levelIdx: 0,
  upgrades: {},
  boss: freshBoss(1, 0, false),
  activeAbilityCooldowns: {},
  activeBuffs: [],
  tapsThisRun: 0,
  perRunPerTapPctBonus: 0,
  bossKillsThisRun: 0,
  runStartAt: Date.now(),
  shards: 0,
  crystals: 0,
  tree: {},
  totalPrestiges: 0,
  prestigePromptDismissedRunAt: 0,
  bestLevel: 0,
  bestBossTier: 1,
  collectedFacts: [],
  achievements: [],
  bossKillsLifetime: 0,
  bestCombo: 1,
  fastestLevel6Ms: null,
  totalPlayMs: 0,
  lastActiveAt: Date.now(),
  offlineMaxMs: OFFLINE_PROGRESS.defaultMaxMs,
  voidBurstUses: 0,
  completedChapters: [],
  discoveredEnemyTypeIds: ['basic'],
  knowledgeBulbsCollected: 0,
  nextKnowledgeBulbAt: 0,
  playerHp: BASE_COMBAT_STATS.maxHp,
  playerMana: BASE_COMBAT_STATS.maxMana,
  combatStatBonuses: EMPTY_COMBAT_STAT_BONUSES,
  combatAbilityCooldowns: {},
  completedResearchIds: [],
  claimedResearchIds: [],
  activeResearchId: null,
  activeResearchStartAt: 0,
  activeResearchEndAt: 0,
  researchBonuses: EMPTY_RESEARCH_BONUSES,
  ownedBuildNodeIds: [],
  buildBonuses: EMPTY_BUILD_BONUSES,
  shop: { tapBoost: 0, flowBoost: 0, shardBoost: 0 },
  audio: { master: 0.7, music: 0.6, sfx: 0.8, muted: false },
  hasStarted: false,
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      combo: 1,
      lastTapAt: 0,
      showEvolution: null,
      showPrestige: false,
      showTree: false,
      showSettings: false,
      showCodex: false,
      showAchievements: false,
      showProgression: false,
      showShop: false,
      showProfile: false,
      showResearch: false,
      showBuildTree: false,
      currentEvent: null,
      floatingNumbers: [],
      shake: null,
      recentEarnings: [],
      currentBulb: null,
      lastBulbAt: 0,
      pendingBulbLevel: null,
      currentFact: null,
      achievementToast: null,
      showChapterComplete: null,
      offlineReward: null,
      researchCompletedNotice: null,
      bossPhaseToast: null,
      enemyDiscoveryToast: null,

      tapDamacana: (clientX, clientY, options = {}) => {
        const s = get();
        const now = Date.now();
        let combo = s.combo;
        if (!options.passive) {
          const step = (BALANCE.combo.step * (options.comboBoost ?? 1) * activeBuffMult(s, 'comboGain') * (1 + buildBonuses(s).comboGainPct)) + (options.comboFlatBonus ?? 0);
          if (now - s.lastTapAt <= BALANCE.combo.window) {
            combo = Math.min(comboMax(s), combo + step);
          } else {
            combo = 1 + step;
          }
        }
        const perTap = derivedPerTap(s);
        const roll = tapHasCrit(s);
        const crit = options.forceCrit || roll.crit;
        const critMult = options.forceCrit ? Math.max(roll.mult, BALANCE.crit.critMult) * (1 + buildBonuses(s).weakPointDamagePct) : roll.mult;
        let multiplier = effectiveComboPower(combo) * (crit ? critMult : 1);
        multiplier *= options.damageMult ?? 1;
        const newTapsCount = options.passive ? s.tapsThisRun : s.tapsThisRun + 1;
        const lucky = !options.passive && s.tree['luckyTap'] && newTapsCount % BALANCE.luckyTap.interval === 0;
        if (lucky) multiplier *= BALANCE.luckyTap.mult;

        const dmg = Math.max(1, Math.floor(perTap * multiplier));
        const bossDmgMult = s.tree['bossKiller'] ? 2 : 1;
        const rewardBuff = activeBuffMult(s, 'reward') * researchRewardMult(s) * (1 + buildBonuses(s).unstableRewardPct);
        const earn = Math.max(0, Math.floor(dmg * (options.rewardMult ?? 1) * rewardBuff));

        let boss = { ...s.boss };
        let shardsDelta = 0;
        let crystalsDelta = 0;
        let dmcDelta = earn;
        let bossKillsRun = s.bossKillsThisRun;
        let bossKillsLife = s.bossKillsLifetime;
        let chapterPatch: ReturnType<typeof completeChapterPatch> = {};
        let activeBuffs = s.activeBuffs;
        let bossPhaseToast: BossPhaseToast | null = null;
        boss.hpCur -= Math.floor(dmg * bossDmgMult);

        let bestBossTier = s.bestBossTier;
        const eliteUnlocked = s.totalPrestiges >= 5;
        if (boss.hpCur <= 0) {
          const defeatedTier = boss.tier;
          const reward = Math.floor(bossReward(boss.tier, s.levelIdx) * rewardBuff);
          dmcDelta += reward;
          const mega = isMegaBoss(boss.tier);
          let dropMult = 1;
          for (const id of Object.keys(s.tree)) {
            if (!s.tree[id]) continue;
            const n = nodeById(id);
            if (n && n.effect === 'shardDropMult' && n.value) dropMult *= 1 + n.value;
          }
          const guaranteed = mega || boss.isElite;
          if (guaranteed) {
            let shardGain = 1;
            if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
            shardsDelta += shardGain;
          } else if (Math.random() < shardDropChance(boss.tier) * dropMult * activeBuffMult(s, 'shardChance') * researchShardChanceMult(s)) {
            let shardGain = 1;
            if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
            shardsDelta += shardGain;
          }
          // crystal drop from elites at ★10
          if (boss.isElite && s.totalPrestiges >= 10 && Math.random() < 0.05) {
            crystalsDelta += 1;
          }
          const dropPatch = bossDefeatDropPatch({ ...s, activeBuffs }, defeatedTier, now);
          activeBuffs = dropPatch.activeBuffs;
          shardsDelta += dropPatch.shardGain;
          bossPhaseToast = dropPatch.toast;
          bossKillsRun += 1;
          bossKillsLife += 1;
          chapterPatch = completeChapterPatch(s, defeatedTier);
          const nextTier = defeatedTier + 1;
          if (nextTier > bestBossTier) bestBossTier = nextTier;
          boss = freshBoss(nextTier, s.levelIdx, eliteUnlocked);
          set({ shake: { intensity: mega ? 'hard' : 'medium', at: now } });
        }

        if (shardsDelta > 0) shardsDelta = Math.round(shardsDelta * shardGainMult(s));

        const totalEarned = s.totalEarned + dmcDelta;
        const newLevelIdx = levelForTotal(totalEarned, s.totalPrestiges);
        const leveledUp = newLevelIdx > s.levelIdx;

        const fx = clientX ?? window.innerWidth / 2;
        const fy = clientY ?? window.innerHeight / 2;
        const floating = options.silent
          ? s.floatingNumbers
          : [
              ...s.floatingNumbers.slice(-12),
              { id: floatingIdCounter++, value: dmg, x: fx, y: fy, crit: crit || lucky },
            ];

        const recentEarnings = [
          ...s.recentEarnings.filter((r) => now - r.t < 20_000),
          { t: now, amount: dmcDelta },
        ];

        const arr = activeLevels(s.totalPrestiges);
        let fastestLevel6Ms = s.fastestLevel6Ms;
        if (leveledUp && newLevelIdx >= 6) {
          const elapsed = now - s.runStartAt;
          if (fastestLevel6Ms === null || elapsed < fastestLevel6Ms) fastestLevel6Ms = elapsed;
        }

        set({
          damacana: s.damacana + dmcDelta,
          totalEarned,
          shards: s.shards + shardsDelta,
          crystals: s.crystals + crystalsDelta,
          boss,
          activeBuffs,
          combo,
          lastTapAt: options.passive ? s.lastTapAt : now,
          tapsThisRun: newTapsCount,
          bossKillsThisRun: bossKillsRun,
          bossKillsLifetime: bossKillsLife,
          levelIdx: newLevelIdx,
          bestLevel: Math.max(s.bestLevel, newLevelIdx),
          bestBossTier,
          bestCombo: Math.max(s.bestCombo, combo),
          fastestLevel6Ms,
          floatingNumbers: floating,
          recentEarnings,
          ...(bossPhaseToast ? { bossPhaseToast } : {}),
          ...chapterPatch,
          ...(leveledUp
            ? {
                showEvolution: { name: arr[newLevelIdx].key, desc: arr[newLevelIdx].key },
                pendingBulbLevel: newLevelIdx,
                shake: { intensity: 'hard', at: now },
              }
            : {}),
        });

        if (leveledUp && get().tree['evolutionShock']) {
          const cur = get();
          const bonus = Math.floor(cur.damacana * 1);
          set({ damacana: cur.damacana + bonus, totalEarned: cur.totalEarned + bonus });
        }

        const maxLevel = activeLevels(get().totalPrestiges).length - 1;
        if (
          newLevelIdx >= maxLevel &&
          newLevelIdx >= BALANCE.prestige.requiredLevelIdx &&
          !get().showPrestige &&
          get().prestigePromptDismissedRunAt !== get().runStartAt
        ) {
          set({ showPrestige: true });
        }
      },

      tickAuto: (dtMs) => {
        const s = get();
        const now = Date.now();
        let buffs = s.activeBuffs.filter((b) => b.expiresAt > now);

        const ps = derivedPerSec({ ...s, activeBuffs: buffs });
        const passiveGain = (ps * dtMs) / 1000;
        const autoTapRate = derivedAutoTapRate({ ...s, activeBuffs: buffs });

        let boss = { ...s.boss };
        let dmcDelta = passiveGain;
        let shardsDelta = 0;
        let crystalsDelta = 0;
        let bestBossTier = s.bestBossTier;
        let bossKillsRun = s.bossKillsThisRun;
        let bossKillsLife = s.bossKillsLifetime;
        let shakeNeeded: GameState['shake'] = s.shake;
        let chapterPatch: ReturnType<typeof completeChapterPatch> = {};
        let bossPhaseToast: BossPhaseToast | null = null;
        const eliteUnlocked = s.totalPrestiges >= 5;

        if (autoTapRate > 0) {
          const autoTaps = (autoTapRate * dtMs) / 1000;
          const perTap = derivedPerTap({ ...s, activeBuffs: buffs });
          const bossDmgMult = s.tree['bossKiller'] ? 2 : 1;
          let dmgPool = perTap * autoTaps;
          while (dmgPool > 0 && boss.hpCur > 0) {
            const apply = Math.min(boss.hpCur, dmgPool * bossDmgMult);
            boss.hpCur -= apply;
            dmgPool -= apply / bossDmgMult;
            if (boss.hpCur <= 0) {
              const defeatedTier = boss.tier;
              const reward = Math.floor(bossReward(boss.tier, s.levelIdx) * researchRewardMult(s));
              dmcDelta += reward;
              const mega = isMegaBoss(boss.tier);
              let dropMult = 1;
              for (const id of Object.keys(s.tree)) {
                if (!s.tree[id]) continue;
                const n = nodeById(id);
                if (n && n.effect === 'shardDropMult' && n.value) dropMult *= 1 + n.value;
              }
              const guaranteed = mega || boss.isElite;
              if (guaranteed) {
                let shardGain = 1;
                if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
                shardsDelta += shardGain;
              } else if (Math.random() < shardDropChance(boss.tier) * dropMult * activeBuffMult(s, 'shardChance') * researchShardChanceMult(s)) {
                let shardGain = 1;
                if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
                shardsDelta += shardGain;
              }
              if (boss.isElite && s.totalPrestiges >= 10 && Math.random() < 0.05) crystalsDelta += 1;
              const dropPatch = bossDefeatDropPatch({ ...s, activeBuffs: buffs }, defeatedTier, now);
              buffs = dropPatch.activeBuffs;
              shardsDelta += dropPatch.shardGain;
              bossPhaseToast = dropPatch.toast;
              bossKillsRun += 1;
              bossKillsLife += 1;
              chapterPatch = completeChapterPatch({ ...s, completedChapters: chapterPatch.completedChapters ?? s.completedChapters }, defeatedTier);
              const nextTier = defeatedTier + 1;
              if (nextTier > bestBossTier) bestBossTier = nextTier;
              boss = freshBoss(nextTier, s.levelIdx, eliteUnlocked);
              shakeNeeded = { intensity: mega ? 'hard' : 'medium', at: now };
            }
          }
        }

        if (shardsDelta > 0) shardsDelta = Math.round(shardsDelta * shardGainMult(s));

        const totalEarned = s.totalEarned + dmcDelta;
        const newLevelIdx = levelForTotal(totalEarned, s.totalPrestiges);
        const leveledUp = newLevelIdx > s.levelIdx;
        const arr = activeLevels(s.totalPrestiges);

        const recentEarnings = [
          ...s.recentEarnings.filter((r) => now - r.t < 20_000),
          ...(dmcDelta > 0 ? [{ t: now, amount: dmcDelta }] : []),
        ];

        let combo = s.combo;
        if (now - s.lastTapAt > BALANCE.combo.decay * (1 + researchBonuses(s).comboDecayPct + buildBonuses(s).comboDecayPct) * activeBuffMult({ ...s, activeBuffs: buffs }, 'comboDecay')) combo = 0;

        let fastestLevel6Ms = s.fastestLevel6Ms;
        if (leveledUp && newLevelIdx >= 6) {
          const elapsed = now - s.runStartAt;
          if (fastestLevel6Ms === null || elapsed < fastestLevel6Ms) fastestLevel6Ms = elapsed;
        }

        set({
          damacana: s.damacana + dmcDelta,
          totalEarned,
          shards: s.shards + shardsDelta,
          crystals: s.crystals + crystalsDelta,
          boss,
          activeBuffs: buffs,
          bestBossTier,
          bossKillsThisRun: bossKillsRun,
          bossKillsLifetime: bossKillsLife,
          levelIdx: newLevelIdx,
          bestLevel: Math.max(s.bestLevel, newLevelIdx),
          combo,
          recentEarnings,
          shake: shakeNeeded,
          fastestLevel6Ms,
          ...(bossPhaseToast ? { bossPhaseToast } : {}),
          ...chapterPatch,
          ...(leveledUp
            ? {
                showEvolution: { name: arr[newLevelIdx].key, desc: arr[newLevelIdx].key },
                pendingBulbLevel: newLevelIdx,
              }
            : {}),
        });

        if (leveledUp && get().tree['evolutionShock']) {
          const cur = get();
          const bonus = Math.floor(cur.damacana * 1);
          set({ damacana: cur.damacana + bonus, totalEarned: cur.totalEarned + bonus });
        }

        const maxLevel = arr.length - 1;
        if (
          newLevelIdx >= maxLevel &&
          newLevelIdx >= BALANCE.prestige.requiredLevelIdx &&
          !get().showPrestige &&
          !get().showEvolution &&
          get().prestigePromptDismissedRunAt !== get().runStartAt
        ) {
          set({ showPrestige: true });
        }
      },

      buyUpgrade: (id) => {
        const s = get();
        const def = upgradeById(id);
        if (!def) return;
        if (s.levelIdx < def.unlockLevel) return;
        const lvl = s.upgrades[id] ?? 0;
        const cost = upgradeCost(def, lvl);
        if (s.damacana < cost) return;
        const free = s.tree['chaosCore'] && Math.random() < 0.1;
        set({
          damacana: free ? s.damacana : s.damacana - cost,
          upgrades: { ...s.upgrades, [id]: lvl + 1 },
          shake: { intensity: 'small', at: Date.now() },
        });
      },

      buyTreeNode: (id) => {
        const s = get();
        const node = nodeById(id);
        if (!node) return;
        if (s.tree[id]) return;
        const prev = previousNode(node);
        if (prev && !s.tree[prev.id]) return;
        if (s.shards < node.cost) return;
        set({
          shards: s.shards - node.cost,
          tree: { ...s.tree, [id]: true },
          shake: { intensity: 'small', at: Date.now() },
        });
      },

      fireAbility: (id) => {
        const s = get();
        const node = id === 'voidBurst' ? 'voidBurst' : id === 'flood' ? 'flood' : 'timeLoop';
        if (!s.tree[node]) return;
        const now = Date.now();
        const ready = s.activeAbilityCooldowns[id] ?? 0;
        if (now < ready) return;
        if (id === 'voidBurst') {
          const perTap = derivedPerTap(s);
          const dmg = perTap * BALANCE.abilities.voidBurst.dmgMult;
          const dmc = perTap * BALANCE.abilities.voidBurst.dmcMult;
          let boss = { ...s.boss };
          boss.hpCur -= dmg;
          let dmcDelta = dmc;
          let shardsDelta = 0;
          let bestBossTier = s.bestBossTier;
          let bossKillsRun = s.bossKillsThisRun;
          let bossKillsLife = s.bossKillsLifetime;
          let chapterPatch: ReturnType<typeof completeChapterPatch> = {};
          let activeBuffs = s.activeBuffs;
          let bossPhaseToast: BossPhaseToast | null = null;
          if (boss.hpCur <= 0) {
            const defeatedTier = boss.tier;
            dmcDelta += bossReward(boss.tier, s.levelIdx);
            const dropPatch = bossDefeatDropPatch({ ...s, activeBuffs }, defeatedTier, now);
            activeBuffs = dropPatch.activeBuffs;
            shardsDelta += dropPatch.shardGain;
            bossPhaseToast = dropPatch.toast;
            bossKillsRun += 1;
            bossKillsLife += 1;
            chapterPatch = completeChapterPatch(s, defeatedTier);
            const nextTier = defeatedTier + 1;
            if (nextTier > bestBossTier) bestBossTier = nextTier;
            boss = freshBoss(nextTier, s.levelIdx, s.totalPrestiges >= 5);
          }
          set({
            boss,
            damacana: s.damacana + dmcDelta,
            totalEarned: s.totalEarned + dmcDelta,
            shards: s.shards + shardsDelta,
            activeBuffs,
            bestBossTier,
            bossKillsThisRun: bossKillsRun,
            bossKillsLifetime: bossKillsLife,
            voidBurstUses: s.voidBurstUses + 1,
            ...(bossPhaseToast ? { bossPhaseToast } : {}),
            ...chapterPatch,
            shake: { intensity: 'hard', at: now },
            activeAbilityCooldowns: { ...s.activeAbilityCooldowns, voidBurst: now + BALANCE.abilities.voidBurst.cooldown },
          });
        } else if (id === 'flood') {
          set({
            activeBuffs: [
              ...s.activeBuffs.filter((b) => b.id !== 'ability_flood'),
              { id: 'ability_flood', expiresAt: now + BALANCE.abilities.flood.duration, mult: BALANCE.abilities.flood.mult, type: 'flow' },
            ],
            activeAbilityCooldowns: { ...s.activeAbilityCooldowns, flood: now + BALANCE.abilities.flood.cooldown },
            shake: { intensity: 'medium', at: now },
          });
        } else if (id === 'timeLoop') {
          const cutoff = now - BALANCE.abilities.timeLoop.replaySeconds * 1000;
          const replay = s.recentEarnings.filter((r) => r.t >= cutoff).reduce((sum, r) => sum + r.amount, 0);
          set({
            damacana: s.damacana + replay,
            totalEarned: s.totalEarned + replay,
            activeAbilityCooldowns: { ...s.activeAbilityCooldowns, timeLoop: now + BALANCE.abilities.timeLoop.cooldown },
            shake: { intensity: 'hard', at: now },
          });
        }
      },

      setShowTree: (v) => set({ showTree: v }),
      setShowPrestige: (v) => set((state) => ({
        showPrestige: v,
        ...(v ? {} : { prestigePromptDismissedRunAt: state.runStartAt }),
      })),
      setShowSettings: (v) => set({ showSettings: v }),
      setShowCodex: (v) => set({ showCodex: v }),
      setShowAchievements: (v) => set({ showAchievements: v }),
      setShowProgression: (v) => set({ showProgression: v }),
      setShowShop: (v) => set({ showShop: v }),
      setShowProfile: (v) => set({ showProfile: v }),
      setShowResearch: (v) => set({ showResearch: v }),
      setShowBuildTree: (v) => set({ showBuildTree: v }),

      dismissEvolution: () => set({ showEvolution: null }),
      dismissChapterComplete: () => set({ showChapterComplete: null }),
      dismissOfflineReward: () => set({ offlineReward: null }),
      dismissResearchNotice: () => set({ researchCompletedNotice: null }),
      dismissBossPhaseToast: () => set({ bossPhaseToast: null }),
      discoverEnemyType: (id) => {
        const s = get();
        if ((s.discoveredEnemyTypeIds ?? []).includes(id)) return;
        set({
          discoveredEnemyTypeIds: [...(s.discoveredEnemyTypeIds ?? []), id],
          enemyDiscoveryToast: id === 'basic' ? null : id,
        });
      },
      dismissEnemyDiscoveryToast: () => set({ enemyDiscoveryToast: null }),

      buyBuildNode: (id) => {
        const s = get();
        const node = buildNodeById(id);
        if (!node) return;
        if ((s.ownedBuildNodeIds ?? []).includes(id)) return;
        if (!buildRequirementMet(s, id) || !buildCostMet(s, id)) return;
        const ownedBuildNodeIds = [...(s.ownedBuildNodeIds ?? []), id];
        const bonuses = summarizeBuildBonuses(ownedBuildNodeIds);
        const stats = derivedCombatStats({ ...s, ownedBuildNodeIds, buildBonuses: bonuses });
        const costPatch = node.cost.currency === 'shards'
          ? { shards: s.shards - node.cost.amount }
          : { damacana: s.damacana - node.cost.amount };
        set({
          ...costPatch,
          ownedBuildNodeIds,
          buildBonuses: bonuses,
          playerHp: Math.min(stats.maxHp, s.playerHp ?? stats.maxHp),
          playerMana: Math.min(stats.maxMana, s.playerMana ?? stats.maxMana),
          shake: { intensity: 'small', at: Date.now() },
        });
      },

      refreshResearchProgress: () => {
        const s = get();
        if (!s.activeResearchId || !s.activeResearchEndAt) return;
        if (Date.now() < s.activeResearchEndAt) return;
        if (s.completedResearchIds.includes(s.activeResearchId)) return;
        set({
          completedResearchIds: [...s.completedResearchIds, s.activeResearchId],
          researchCompletedNotice: s.activeResearchId,
        });
      },

      startResearch: (id) => {
        const s = get();
        const research = researchById(id);
        if (!research) return;
        if (s.activeResearchId) return;
        if (s.claimedResearchIds.includes(id) || s.completedResearchIds.includes(id)) return;
        if (!researchRequirementMet(s, id) || !researchCostMet(s, id)) return;
        const now = Date.now();
        const costPatch = research.cost.currency === 'shards'
          ? { shards: s.shards - research.cost.amount }
          : { damacana: s.damacana - research.cost.amount };
        set({
          ...costPatch,
          activeResearchId: id,
          activeResearchStartAt: now,
          activeResearchEndAt: now + research.durationMs,
          researchCompletedNotice: null,
        });
      },

      claimResearch: (id) => {
        get().refreshResearchProgress();
        const s = get();
        if (s.activeResearchId !== id) return;
        if (!s.completedResearchIds.includes(id) && Date.now() < s.activeResearchEndAt) return;
        const claimedResearchIds = s.claimedResearchIds.includes(id) ? s.claimedResearchIds : [...s.claimedResearchIds, id];
        const completedResearchIds = s.completedResearchIds.includes(id) ? s.completedResearchIds : [...s.completedResearchIds, id];
        const bonuses = summarizeResearchBonuses(claimedResearchIds);
        const stats = derivedCombatStats({ ...s, claimedResearchIds, researchBonuses: bonuses });
        set({
          completedResearchIds,
          claimedResearchIds,
          activeResearchId: null,
          activeResearchStartAt: 0,
          activeResearchEndAt: 0,
          researchBonuses: bonuses,
          researchCompletedNotice: null,
          playerHp: Math.min(stats.maxHp, s.playerHp ?? stats.maxHp),
          playerMana: Math.min(stats.maxMana, s.playerMana ?? stats.maxMana),
          shake: { intensity: 'medium', at: Date.now() },
        });
      },

      applyCombatDamage: (amount) => {
        const s = get();
        const stats = derivedCombatStats(s);
        const shield = Math.min(1, Math.max(0, activeBuffMax(s, 'shield')));
        const incoming = amount * activeBuffMult(s, 'enemyDamage') * (1 - shield);
        const reduced = Math.max(0, Math.floor((incoming - stats.armor) * (1 - stats.damageReduction)));
        const hp = Math.max(0, Math.min(s.playerHp ?? stats.maxHp, stats.maxHp) - reduced);
        set({ playerHp: hp });
        return { damage: reduced, hp, collapsed: hp <= 0 };
      },

      healCombatHp: (amount) => {
        const s = get();
        const stats = derivedCombatStats(s);
        set({ playerHp: Math.min(stats.maxHp, Math.max(0, s.playerHp ?? stats.maxHp) + amount) });
      },

      restoreCombatMana: (amount) => {
        const s = get();
        const stats = derivedCombatStats(s);
        set({ playerMana: Math.min(stats.maxMana, Math.max(0, s.playerMana ?? 0) + amount) });
      },

      regenCombatResources: (dtMs) => {
        const s = get();
        const stats = derivedCombatStats(s);
        const hp = Math.min(stats.maxHp, Math.max(0, s.playerHp ?? stats.maxHp) + (stats.hpRegen * dtMs) / 1000);
        const mana = Math.min(stats.maxMana, Math.max(0, s.playerMana ?? 0) + (stats.manaRegen * dtMs) / 1000);
        set({ playerHp: hp, playerMana: mana });
      },

      spendCombatAbility: (id) => {
        const s = get();
        const ability = combatAbilityById(id);
        if (!ability) return false;
        const now = Date.now();
        if ((s.combatAbilityCooldowns[id] ?? 0) > now) return false;
        if ((s.playerMana ?? 0) < ability.manaCost) return false;
        const cooldownMult = Math.max(0.25, 1 - researchBonuses(s).abilityCooldownPct - buildBonuses(s).cooldownReductionPct - prestigePermanentBonuses(s.totalPrestiges).cooldownReductionPct);
        set({
          playerMana: Math.max(0, (s.playerMana ?? 0) - ability.manaCost),
          combatAbilityCooldowns: {
            ...(s.combatAbilityCooldowns ?? {}),
            [id]: now + ability.cooldownMs * cooldownMult,
          },
        });
        return true;
      },

      boostCombatCombo: (amount) => {
        const s = get();
        const now = Date.now();
        const next = Math.min(comboMax(s), Math.max(0, s.combo) + amount);
        set({
          combo: next,
          bestCombo: Math.max(s.bestCombo, next),
          lastTapAt: now,
        });
      },

      reduceCombatCombo: (pct) => {
        const s = get();
        const preserve = Math.min(0.8, Math.max(0, buildBonuses(s).damageComboPreservePct + prestigePermanentBonuses(s.totalPrestiges).comboRetentionPct));
        const next = Math.max(0, s.combo * (1 - pct * (1 - preserve)));
        set({
          combo: next,
          lastTapAt: Date.now(),
        });
      },

      claimOfflineProgress: () => {
        const s = get();
        if (!s.hasStarted) {
          set({ lastActiveAt: Date.now() });
          return;
        }
        const now = Date.now();
        const awayMs = Math.max(0, now - s.lastActiveAt);
        const research = researchBonuses(s);
        const build = buildBonuses(s);
        const maxOfflineMs = (s.offlineMaxMs || OFFLINE_PROGRESS.defaultMaxMs) + research.offlineCapMs;
        const cappedMs = Math.min(awayMs, maxOfflineMs);
        const ps = derivedPerSec(s);
        const gained = Math.floor(((ps * cappedMs) / 1000) * (1 + research.offlineEfficiencyPct + build.offlineEfficiencyPct));
        if (awayMs < OFFLINE_PROGRESS.minNotifyMs || gained <= 0) {
          set({ lastActiveAt: now });
          return;
        }

        const totalEarned = s.totalEarned + gained;
        const newLevelIdx = levelForTotal(totalEarned, s.totalPrestiges);
        const arr = activeLevels(s.totalPrestiges);
        set({
          damacana: s.damacana + gained,
          totalEarned,
          levelIdx: newLevelIdx,
          bestLevel: Math.max(s.bestLevel, newLevelIdx),
          lastActiveAt: now,
          offlineReward: { awayMs: cappedMs, gained },
          ...(newLevelIdx > s.levelIdx
            ? {
                showEvolution: { name: arr[newLevelIdx].key, desc: arr[newLevelIdx].key },
                pendingBulbLevel: null,
              }
            : {}),
        });
      },

      triggerEvent: () => {
        const s = get();
        if (s.currentEvent) return;
        const ev = pickRandomEvent();
        set({ currentEvent: ev });
      },

      resolveEventChoice: (key) => {
        const s = get();
        const ev = s.currentEvent;
        if (!ev || !ev.choices) return;
        const choice = ev.choices.find((c) => c.key === key);
        if (!choice) return;
        let next = { ...s };
        for (const r of choice.rewards) {
          const p = applyRewardToState(next, r);
          next = { ...next, ...p } as Persisted & typeof s;
        }
        set({
          damacana: next.damacana,
          totalEarned: next.totalEarned,
          shards: next.shards,
          activeBuffs: next.activeBuffs,
          boss: next.boss,
          perRunPerTapPctBonus: next.perRunPerTapPctBonus,
          playerHp: next.playerHp,
          playerMana: next.playerMana,
          activeAbilityCooldowns: next.activeAbilityCooldowns,
          combatAbilityCooldowns: next.combatAbilityCooldowns,
          currentEvent: null,
        });
      },

      dismissEvent: () => set({ currentEvent: null }),

      prestige: () => {
        const s = get();
        if (s.levelIdx < BALANCE.prestige.requiredLevelIdx) return;
        const gain = prestigeShardGain(s.totalEarned, s.totalPrestiges, researchBonuses(s).prestigeGainPct, Boolean(s.tree['guaranteedShards']));
        const now = Date.now();
        set({
          ...initialState,
          shards: s.shards + gain,
          crystals: s.crystals,
          tree: s.tree,
          totalPrestiges: s.totalPrestiges + 1,
          prestigePromptDismissedRunAt: 0,
          bestLevel: s.bestLevel,
          bestBossTier: s.bestBossTier,
          collectedFacts: s.collectedFacts,
          achievements: s.achievements,
          bossKillsLifetime: s.bossKillsLifetime,
          bestCombo: s.bestCombo,
          fastestLevel6Ms: s.fastestLevel6Ms,
          totalPlayMs: s.totalPlayMs,
          lastActiveAt: now,
          offlineMaxMs: s.offlineMaxMs || OFFLINE_PROGRESS.defaultMaxMs,
          voidBurstUses: s.voidBurstUses,
          completedChapters: [],
          discoveredEnemyTypeIds: s.discoveredEnemyTypeIds ?? ['basic'],
          knowledgeBulbsCollected: s.knowledgeBulbsCollected,
          nextKnowledgeBulbAt: now + randomKnowledgeDelayMs(),
          playerHp: Math.min(s.playerHp ?? BASE_COMBAT_STATS.maxHp, derivedCombatStats(s).maxHp),
          playerMana: Math.min(s.playerMana ?? BASE_COMBAT_STATS.maxMana, derivedCombatStats(s).maxMana),
          combatStatBonuses: s.combatStatBonuses ?? EMPTY_COMBAT_STAT_BONUSES,
          combatAbilityCooldowns: s.combatAbilityCooldowns ?? {},
          completedResearchIds: s.completedResearchIds ?? [],
          claimedResearchIds: s.claimedResearchIds ?? [],
          activeResearchId: s.activeResearchId ?? null,
          activeResearchStartAt: s.activeResearchStartAt ?? 0,
          activeResearchEndAt: s.activeResearchEndAt ?? 0,
          researchBonuses: s.researchBonuses ?? summarizeResearchBonuses(s.claimedResearchIds ?? []),
          ownedBuildNodeIds: s.ownedBuildNodeIds ?? [],
          buildBonuses: s.buildBonuses ?? summarizeBuildBonuses(s.ownedBuildNodeIds ?? []),
          shop: s.shop,
          audio: s.audio,
          hasStarted: s.hasStarted,
          damacana: s.tree['startingGift'] ? 100 : 0,
          boss: freshBoss(1, 0, false),
          runStartAt: now,
          showPrestige: false,
          showEvolution: null,
          shake: { intensity: 'hard', at: now },
          floatingNumbers: [],
          recentEarnings: [],
          currentEvent: null,
          currentBulb: null,
          lastBulbAt: s.lastBulbAt,
          pendingBulbLevel: null,
          currentFact: null,
          showChapterComplete: null,
          offlineReward: null,
          researchCompletedNotice: null,
          bossPhaseToast: null,
          enemyDiscoveryToast: null,
          combo: 1,
          lastTapAt: 0,
        });
      },

      setAudioSetting: (partial) => {
        const s = get();
        set({ audio: { ...s.audio, ...partial } });
      },

      start: () => {
        const s = get();
        const dmc = s.tree['startingGift'] && s.totalEarned === 0 ? 100 : s.damacana;
        const now = Date.now();
        set({
          hasStarted: true,
          damacana: dmc,
          runStartAt: now,
          lastActiveAt: now,
          playerHp: s.playerHp ?? derivedCombatStats(s).maxHp,
          playerMana: s.playerMana ?? derivedCombatStats(s).maxMana,
          nextKnowledgeBulbAt: s.nextKnowledgeBulbAt || now + randomKnowledgeDelayMs(),
        });
      },

      reset: () => {
        const now = Date.now();
        set({
          ...initialState,
          boss: freshBoss(1, 0, false),
          runStartAt: now,
          lastActiveAt: now,
          playerHp: BASE_COMBAT_STATS.maxHp,
          playerMana: BASE_COMBAT_STATS.maxMana,
          combatStatBonuses: EMPTY_COMBAT_STAT_BONUSES,
          combatAbilityCooldowns: {},
          completedResearchIds: [],
          claimedResearchIds: [],
          activeResearchId: null,
          activeResearchStartAt: 0,
          activeResearchEndAt: 0,
          researchBonuses: EMPTY_RESEARCH_BONUSES,
          ownedBuildNodeIds: [],
          buildBonuses: EMPTY_BUILD_BONUSES,
          nextKnowledgeBulbAt: 0,
          showChapterComplete: null,
          offlineReward: null,
          researchCompletedNotice: null,
          bossPhaseToast: null,
          discoveredEnemyTypeIds: ['basic'],
          enemyDiscoveryToast: null,
        });
      },

      pushFloating: (value, x, y, crit) => {
        const s = get();
        set({
          floatingNumbers: [
            ...s.floatingNumbers.slice(-12),
            { id: floatingIdCounter++, value, x, y, crit },
          ],
        });
      },

      consumeShake: () => set({ shake: null }),

      spawnBulbForLevel: (level) => {
        const s = get();
        if (s.currentBulb) return;
        const fact = pickFactForLevel(level, new Set(s.collectedFacts));
        if (!fact) {
          set({ pendingBulbLevel: null });
          return;
        }
        set({
          currentBulb: {
            factId: fact.id,
            expiresAt: Date.now() + 20_000,
            ...randomKnowledgeBulbPoint(),
          },
          lastBulbAt: Date.now(),
          nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs(),
          pendingBulbLevel: null,
        });
      },

      spawnRandomBulb: () => {
        const s = get();
        if (s.currentBulb) return;
        const fact = pickRandomBonusFact(new Set(s.collectedFacts));
        if (!fact) {
          set({ nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs() });
          return;
        }
        set({
          currentBulb: {
            factId: fact.id,
            expiresAt: Date.now() + 20_000,
            ...randomKnowledgeBulbPoint(),
          },
          lastBulbAt: Date.now(),
          nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs(),
        });
      },

      scheduleNextKnowledgeBulb: () => {
        set({ nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs() });
      },

      tapBulb: () => {
        const s = get();
        if (!s.currentBulb) return;
        const nextCount = s.knowledgeBulbsCollected + 1;
        const bonusShard = nextCount % 5 === 0 ? 1 : 0;
        set({
          currentFact: s.currentBulb.factId,
          currentBulb: null,
          knowledgeBulbsCollected: nextCount,
          shards: s.shards + bonusShard,
          nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs(),
        });
      },

      expireBulb: () => {
        if (get().currentBulb) {
          set({ currentBulb: null, nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs() });
        }
      },

      closeFactCard: () => {
        const s = get();
        const factId = s.currentFact;
        if (!factId) return;
        const fact = factById(factId);
        const already = s.collectedFacts.includes(factId);
        const collected = already ? s.collectedFacts : [...s.collectedFacts, factId];
        const reward = fact && !already ? fact.rewardShards : 0;
        set({
          currentFact: null,
          collectedFacts: collected,
          shards: s.shards + reward,
        });
      },

      unlockAchievement: (id) => {
        const s = get();
        if (s.achievements.includes(id)) return;
        set({ achievements: [...s.achievements, id], achievementToast: id });
      },

      dismissAchievementToast: () => set({ achievementToast: null }),

      buyShopItem: (id) => {
        const s = get();
        const item = SHOP_ITEMS.find((i) => i.id === id);
        if (!item) return;
        if (s.crystals < item.cost) return;
        set({
          crystals: s.crystals - item.cost,
          shop: { ...s.shop, [id]: s.shop[id] + 1 },
        });
      },

      addPlayTime: (ms) => {
        const s = get();
        set({ totalPlayMs: s.totalPlayMs + ms, lastActiveAt: Date.now() });
      },
    }),
    {
      name: 'damacana_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as never))),
      partialize: (s) => ({
        damacana: s.damacana,
        totalEarned: s.totalEarned,
        levelIdx: s.levelIdx,
        upgrades: s.upgrades,
        boss: s.boss,
        activeAbilityCooldowns: s.activeAbilityCooldowns,
        activeBuffs: s.activeBuffs,
        tapsThisRun: s.tapsThisRun,
        perRunPerTapPctBonus: s.perRunPerTapPctBonus,
        bossKillsThisRun: s.bossKillsThisRun,
        runStartAt: s.runStartAt,
        shards: s.shards,
        crystals: s.crystals,
        tree: s.tree,
        totalPrestiges: s.totalPrestiges,
        prestigePromptDismissedRunAt: s.prestigePromptDismissedRunAt,
        bestLevel: s.bestLevel,
        bestBossTier: s.bestBossTier,
        collectedFacts: s.collectedFacts,
        achievements: s.achievements,
        bossKillsLifetime: s.bossKillsLifetime,
        bestCombo: s.bestCombo,
        fastestLevel6Ms: s.fastestLevel6Ms,
        totalPlayMs: s.totalPlayMs,
        lastActiveAt: s.lastActiveAt,
        offlineMaxMs: s.offlineMaxMs,
        voidBurstUses: s.voidBurstUses,
        completedChapters: s.completedChapters,
        discoveredEnemyTypeIds: s.discoveredEnemyTypeIds,
        knowledgeBulbsCollected: s.knowledgeBulbsCollected,
        nextKnowledgeBulbAt: s.nextKnowledgeBulbAt,
        playerHp: s.playerHp,
        playerMana: s.playerMana,
        combatStatBonuses: s.combatStatBonuses,
        combatAbilityCooldowns: s.combatAbilityCooldowns,
        completedResearchIds: s.completedResearchIds,
        claimedResearchIds: s.claimedResearchIds,
        activeResearchId: s.activeResearchId,
        activeResearchStartAt: s.activeResearchStartAt,
        activeResearchEndAt: s.activeResearchEndAt,
        researchBonuses: s.researchBonuses,
        ownedBuildNodeIds: s.ownedBuildNodeIds,
        buildBonuses: s.buildBonuses,
        shop: s.shop,
        audio: s.audio,
        hasStarted: s.hasStarted,
        lastBulbAt: s.lastBulbAt,
      }),
    },
  ),
);

// Selectors / derived helpers
export function selectPerTap(s: GameState) {
  return derivedPerTap(s);
}
export function selectPerSec(s: GameState) {
  return derivedPerSec(s);
}
export function selectAutoTapRate(s: GameState) {
  return derivedAutoTapRate(s);
}
export function selectCombatStats(s: GameState) {
  return derivedCombatStats(s);
}
export function selectComboMax(s: GameState) {
  return comboMax(s);
}
export function selectResearchBonuses(s: GameState) {
  return researchBonuses(s);
}
export function selectBuildBonuses(s: GameState) {
  return buildBonuses(s);
}
