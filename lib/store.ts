'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BALANCE } from './config/balance';
import { LEVELS, activeLevels, levelForTotal } from './config/levels';
import { UPGRADES, upgradeById, upgradeCost } from './config/upgrades';
import { bossHp, bossNameKey, bossReward, isMegaBoss, shardDropChance, eliteBossHp } from './config/bosses';
import { nodeById, previousNode } from './config/skillTree';
import { AbsurdEvent, AnomalyEffectType, EventReward, pickRandomEvent } from './config/events';
import { CATEGORIES, categoryComplete, factById, pickFactForLevel, pickRandomBonusFact } from './config/facts';
import { ELITE_NAME_KEYS, KNOWLEDGE_BULB_TIMING, OFFLINE_PROGRESS, SHOP_ITEMS, shouldBeElite } from './config/progression';
import { ChapterId, firstCompletableChapter, nextChapter } from './config/chapters';
import {
  BASE_COMBAT_STATS,
  COMBAT,
  CombatAbilityId,
  CombatStatBonuses,
  CombatStats,
  EMPTY_COMBAT_STAT_BONUSES,
  combatAbilityById,
} from './config/combat';

export interface Buff {
  id: string;
  expiresAt: number;
  mult: number;
  type: 'tap' | 'flow' | AnomalyEffectType;
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
  knowledgeBulbsCollected: number;
  nextKnowledgeBulbAt: number;
  playerHp: number;
  playerMana: number;
  combatStatBonuses: CombatStatBonuses;
  combatAbilityCooldowns: Record<string, number>;
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
  dismissEvolution: () => void;
  dismissChapterComplete: () => void;
  dismissOfflineReward: () => void;
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
  return (1 + state.shop.shardBoost * 0.1) * (1 + codexBonuses(state).shard);
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
  const levelHp = state.bestLevel * COMBAT.playerHpPerLevel;
  const levelMana = state.bestLevel * COMBAT.playerManaPerLevel;
  return {
    maxHp: BASE_COMBAT_STATS.maxHp + levelHp + bonuses.maxHp,
    maxMana: BASE_COMBAT_STATS.maxMana + levelMana + bonuses.maxMana,
    hpRegen: BASE_COMBAT_STATS.hpRegen + bonuses.hpRegen,
    manaRegen: BASE_COMBAT_STATS.manaRegen + bonuses.manaRegen,
    armor: BASE_COMBAT_STATS.armor + bonuses.armor,
    damageReduction: Math.min(0.75, BASE_COMBAT_STATS.damageReduction + bonuses.damageReduction),
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
  knowledgeBulbsCollected: 0,
  nextKnowledgeBulbAt: 0,
  playerHp: BASE_COMBAT_STATS.maxHp,
  playerMana: BASE_COMBAT_STATS.maxMana,
  combatStatBonuses: EMPTY_COMBAT_STAT_BONUSES,
  combatAbilityCooldowns: {},
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

      tapDamacana: (clientX, clientY, options = {}) => {
        const s = get();
        const now = Date.now();
        let combo = s.combo;
        if (!options.passive) {
          const step = (BALANCE.combo.step * (options.comboBoost ?? 1) * activeBuffMult(s, 'comboGain')) + (options.comboFlatBonus ?? 0);
          if (now - s.lastTapAt <= BALANCE.combo.window) {
            combo = Math.min(comboMax(s), combo + step);
          } else {
            combo = 1 + step;
          }
        }
        const perTap = derivedPerTap(s);
        const roll = tapHasCrit(s);
        const crit = options.forceCrit || roll.crit;
        const critMult = options.forceCrit ? Math.max(roll.mult, BALANCE.crit.critMult) : roll.mult;
        let multiplier = effectiveComboPower(combo) * (crit ? critMult : 1);
        multiplier *= options.damageMult ?? 1;
        const newTapsCount = options.passive ? s.tapsThisRun : s.tapsThisRun + 1;
        const lucky = !options.passive && s.tree['luckyTap'] && newTapsCount % BALANCE.luckyTap.interval === 0;
        if (lucky) multiplier *= BALANCE.luckyTap.mult;

        const dmg = Math.max(1, Math.floor(perTap * multiplier));
        const bossDmgMult = s.tree['bossKiller'] ? 2 : 1;
        const rewardBuff = activeBuffMult(s, 'reward');
        const earn = Math.max(0, Math.floor(dmg * (options.rewardMult ?? 1) * rewardBuff));

        let boss = { ...s.boss };
        let shardsDelta = 0;
        let crystalsDelta = 0;
        let dmcDelta = earn;
        let bossKillsRun = s.bossKillsThisRun;
        let bossKillsLife = s.bossKillsLifetime;
        let chapterPatch: ReturnType<typeof completeChapterPatch> = {};
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
          } else if (Math.random() < shardDropChance(boss.tier) * dropMult * activeBuffMult(s, 'shardChance')) {
            let shardGain = 1;
            if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
            shardsDelta += shardGain;
          }
          // crystal drop from elites at ★10
          if (boss.isElite && s.totalPrestiges >= 10 && Math.random() < 0.05) {
            crystalsDelta += 1;
          }
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
        if (newLevelIdx >= maxLevel && newLevelIdx >= BALANCE.prestige.requiredLevelIdx && !get().showPrestige) {
          set({ showPrestige: true });
        }
      },

      tickAuto: (dtMs) => {
        const s = get();
        const now = Date.now();
        const buffs = s.activeBuffs.filter((b) => b.expiresAt > now);

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
              const reward = bossReward(boss.tier, s.levelIdx);
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
              } else if (Math.random() < shardDropChance(boss.tier) * dropMult * activeBuffMult(s, 'shardChance')) {
                let shardGain = 1;
                if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
                shardsDelta += shardGain;
              }
              if (boss.isElite && s.totalPrestiges >= 10 && Math.random() < 0.05) crystalsDelta += 1;
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
        if (now - s.lastTapAt > BALANCE.combo.decay) combo = 0;

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
        if (newLevelIdx >= maxLevel && newLevelIdx >= BALANCE.prestige.requiredLevelIdx && !get().showPrestige && !get().showEvolution) {
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
          let bestBossTier = s.bestBossTier;
          let bossKillsRun = s.bossKillsThisRun;
          let bossKillsLife = s.bossKillsLifetime;
          let chapterPatch: ReturnType<typeof completeChapterPatch> = {};
          if (boss.hpCur <= 0) {
            const defeatedTier = boss.tier;
            dmcDelta += bossReward(boss.tier, s.levelIdx);
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
            bestBossTier,
            bossKillsThisRun: bossKillsRun,
            bossKillsLifetime: bossKillsLife,
            voidBurstUses: s.voidBurstUses + 1,
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
      setShowPrestige: (v) => set({ showPrestige: v }),
      setShowSettings: (v) => set({ showSettings: v }),
      setShowCodex: (v) => set({ showCodex: v }),
      setShowAchievements: (v) => set({ showAchievements: v }),
      setShowProgression: (v) => set({ showProgression: v }),
      setShowShop: (v) => set({ showShop: v }),
      setShowProfile: (v) => set({ showProfile: v }),

      dismissEvolution: () => set({ showEvolution: null }),
      dismissChapterComplete: () => set({ showChapterComplete: null }),
      dismissOfflineReward: () => set({ offlineReward: null }),

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
        set({
          playerMana: Math.max(0, (s.playerMana ?? 0) - ability.manaCost),
          combatAbilityCooldowns: {
            ...(s.combatAbilityCooldowns ?? {}),
            [id]: now + ability.cooldownMs,
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
        const next = Math.max(0, s.combo * (1 - pct));
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
        const cappedMs = Math.min(awayMs, s.offlineMaxMs || OFFLINE_PROGRESS.defaultMaxMs);
        const ps = derivedPerSec(s);
        const gained = Math.floor((ps * cappedMs) / 1000);
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
        let gain = BALANCE.prestige.shardFormula(s.totalEarned);
        if (s.tree['guaranteedShards']) gain += 5;
        set({
          ...initialState,
          shards: s.shards + gain,
          crystals: s.crystals,
          tree: s.tree,
          totalPrestiges: s.totalPrestiges + 1,
          bestLevel: s.bestLevel,
          bestBossTier: s.bestBossTier,
          collectedFacts: s.collectedFacts,
          achievements: s.achievements,
          bossKillsLifetime: s.bossKillsLifetime,
          bestCombo: s.bestCombo,
          fastestLevel6Ms: s.fastestLevel6Ms,
          totalPlayMs: s.totalPlayMs,
          lastActiveAt: Date.now(),
          offlineMaxMs: s.offlineMaxMs || OFFLINE_PROGRESS.defaultMaxMs,
          voidBurstUses: s.voidBurstUses,
          completedChapters: s.completedChapters,
          knowledgeBulbsCollected: s.knowledgeBulbsCollected,
          nextKnowledgeBulbAt: Date.now() + randomKnowledgeDelayMs(),
          playerHp: Math.min(s.playerHp ?? BASE_COMBAT_STATS.maxHp, derivedCombatStats(s).maxHp),
          playerMana: Math.min(s.playerMana ?? BASE_COMBAT_STATS.maxMana, derivedCombatStats(s).maxMana),
          combatStatBonuses: s.combatStatBonuses ?? EMPTY_COMBAT_STAT_BONUSES,
          combatAbilityCooldowns: s.combatAbilityCooldowns ?? {},
          shop: s.shop,
          audio: s.audio,
          hasStarted: s.hasStarted,
          damacana: s.tree['startingGift'] ? 100 : 0,
          boss: freshBoss(1, 0, false),
          runStartAt: Date.now(),
          showPrestige: false,
          showEvolution: null,
          shake: { intensity: 'hard', at: Date.now() },
          floatingNumbers: [],
          recentEarnings: [],
          currentEvent: null,
          currentBulb: null,
          lastBulbAt: s.lastBulbAt,
          pendingBulbLevel: null,
          currentFact: null,
          showChapterComplete: null,
          offlineReward: null,
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
          nextKnowledgeBulbAt: 0,
          showChapterComplete: null,
          offlineReward: null,
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
            x: 12 + Math.random() * 66,
            y: 8 + Math.random() * 22,
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
            x: 12 + Math.random() * 66,
            y: 8 + Math.random() * 22,
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
        knowledgeBulbsCollected: s.knowledgeBulbsCollected,
        nextKnowledgeBulbAt: s.nextKnowledgeBulbAt,
        playerHp: s.playerHp,
        playerMana: s.playerMana,
        combatStatBonuses: s.combatStatBonuses,
        combatAbilityCooldowns: s.combatAbilityCooldowns,
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
