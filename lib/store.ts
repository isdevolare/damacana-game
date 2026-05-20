'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BALANCE } from './config/balance';
import { LEVELS, activeLevels, levelForTotal } from './config/levels';
import { UPGRADES, upgradeById, upgradeCost } from './config/upgrades';
import { bossHp, bossNameKey, bossReward, isMegaBoss, shardDropChance, eliteBossHp } from './config/bosses';
import { nodeById, previousNode } from './config/skillTree';
import { AbsurdEvent, EventReward, pickRandomEvent } from './config/events';
import { CATEGORIES, categoryComplete, factById, pickFactForLevel, pickRandomBonusFact } from './config/facts';
import { ELITE_NAME_KEYS, SHOP_ITEMS, shouldBeElite } from './config/progression';

export interface Buff {
  id: string;
  expiresAt: number;
  mult: number;
  type: 'tap' | 'flow';
}

export interface BossState {
  tier: number;
  nameKey: string;
  hpCur: number;
  hpMax: number;
  isElite: boolean;
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
  voidBurstUses: number;
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

  // actions
  tapDamacana: (clientX?: number, clientY?: number) => void;
  tickAuto: (dtMs: number) => void;
  buyUpgrade: (id: string) => void;
  buyTreeNode: (id: string) => void;
  fireAbility: (id: 'voidBurst' | 'flood' | 'timeLoop') => void;
  setShowTree: (v: boolean) => void;
  setShowPrestige: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setShowCodex: (v: boolean) => void;
  setShowAchievements: (v: boolean) => void;
  setShowProgression: (v: boolean) => void;
  setShowShop: (v: boolean) => void;
  dismissEvolution: () => void;
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

function comboMax(state: Persisted): number {
  return state.tree['comboMaster'] ? BALANCE.combo.masterMax : BALANCE.combo.baseMax;
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
        ...state.activeBuffs.filter((b) => b.id !== 'event_tap'),
        { id: 'event_tap', expiresAt: Date.now() + reward.durationMs, mult: reward.mult, type: 'tap' },
      ];
      break;
    case 'buffFlow':
      patch.activeBuffs = [
        ...state.activeBuffs.filter((b) => b.id !== 'event_flow'),
        { id: 'event_flow', expiresAt: Date.now() + reward.durationMs, mult: reward.mult, type: 'flow' },
      ];
      break;
    case 'pctLoss':
      patch.damacana = Math.floor(state.damacana * (1 - reward.pct));
      break;
    case 'perTapPct':
      patch.perRunPerTapPctBonus = state.perRunPerTapPctBonus + reward.pct;
      break;
    case 'restoreBossHp':
      patch.boss = { ...state.boss, hpCur: state.boss.hpMax };
      break;
    case 'flowLossSeconds': {
      const ps = derivedPerSec(state);
      patch.damacana = Math.max(0, state.damacana - ps * reward.seconds);
      break;
    }
    case 'nothing':
      break;
  }
  return patch;
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
  voidBurstUses: 0,
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
      currentEvent: null,
      floatingNumbers: [],
      shake: null,
      recentEarnings: [],
      currentBulb: null,
      lastBulbAt: 0,
      pendingBulbLevel: null,
      currentFact: null,
      achievementToast: null,

      tapDamacana: (clientX, clientY) => {
        const s = get();
        const now = Date.now();
        let combo = s.combo;
        if (now - s.lastTapAt <= BALANCE.combo.window) {
          combo = Math.min(comboMax(s), combo + BALANCE.combo.step);
        } else {
          combo = 1 + BALANCE.combo.step;
        }
        const perTap = derivedPerTap(s);
        const { crit, mult: critMult } = tapHasCrit(s);
        let multiplier = combo * (crit ? critMult : 1);
        const newTapsCount = s.tapsThisRun + 1;
        const lucky = s.tree['luckyTap'] && newTapsCount % BALANCE.luckyTap.interval === 0;
        if (lucky) multiplier *= BALANCE.luckyTap.mult;

        const dmg = Math.max(1, Math.floor(perTap * multiplier));
        const bossDmgMult = s.tree['bossKiller'] ? 2 : 1;
        const earn = dmg;

        let boss = { ...s.boss };
        let shardsDelta = 0;
        let crystalsDelta = 0;
        let dmcDelta = earn;
        let bossKillsRun = s.bossKillsThisRun;
        let bossKillsLife = s.bossKillsLifetime;
        boss.hpCur -= Math.floor(dmg * bossDmgMult);

        let bestBossTier = s.bestBossTier;
        const eliteUnlocked = s.totalPrestiges >= 5;
        if (boss.hpCur <= 0) {
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
          } else if (Math.random() < shardDropChance(boss.tier) * dropMult) {
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
          const nextTier = boss.tier + 1;
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
        const floating = [
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
          lastTapAt: now,
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
              } else if (Math.random() < shardDropChance(boss.tier) * dropMult) {
                let shardGain = 1;
                if (s.tree['doubleShard'] && Math.random() < 0.25) shardGain *= 2;
                shardsDelta += shardGain;
              }
              if (boss.isElite && s.totalPrestiges >= 10 && Math.random() < 0.05) crystalsDelta += 1;
              bossKillsRun += 1;
              bossKillsLife += 1;
              const nextTier = boss.tier + 1;
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
        if (now - s.lastTapAt > BALANCE.combo.decay) combo = 1;

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
          if (boss.hpCur <= 0) {
            dmcDelta += bossReward(boss.tier, s.levelIdx);
            bossKillsRun += 1;
            bossKillsLife += 1;
            const nextTier = boss.tier + 1;
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

      dismissEvolution: () => set({ showEvolution: null }),

      triggerEvent: () => {
        const s = get();
        if (s.currentEvent) return;
        const ev = pickRandomEvent();
        set({ currentEvent: ev });
        if (ev.kind === 'auto' && ev.autoRewards) {
          let next = { ...s };
          for (const r of ev.autoRewards) {
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
          });
        }
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
          voidBurstUses: s.voidBurstUses,
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
          pendingBulbLevel: null,
          currentFact: null,
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
        set({ hasStarted: true, damacana: dmc, runStartAt: Date.now() });
      },

      reset: () => set({ ...initialState, boss: freshBoss(1, 0, false), runStartAt: Date.now() }),

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
          pendingBulbLevel: null,
        });
      },

      spawnRandomBulb: () => {
        const s = get();
        if (s.currentBulb) return;
        const fact = pickRandomBonusFact(new Set(s.collectedFacts));
        if (!fact) return;
        set({
          currentBulb: {
            factId: fact.id,
            expiresAt: Date.now() + 20_000,
            x: 12 + Math.random() * 66,
            y: 8 + Math.random() * 22,
          },
          lastBulbAt: Date.now(),
        });
      },

      tapBulb: () => {
        const s = get();
        if (!s.currentBulb) return;
        set({ currentFact: s.currentBulb.factId, currentBulb: null });
      },

      expireBulb: () => {
        if (get().currentBulb) set({ currentBulb: null });
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
        set({ totalPlayMs: s.totalPlayMs + ms });
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
        voidBurstUses: s.voidBurstUses,
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
export function selectComboMax(s: GameState) {
  return comboMax(s);
}
