'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame, selectArtifactBonuses, selectBuildBonuses, selectCombatStats, selectPerSec, selectPerTap, selectResearchBonuses } from '@/lib/store';
import type { Buff } from '@/lib/store';
import { currentChapter } from '@/lib/config/chapters';
import { bossPhaseCombatTuning, bossPhaseInfo } from '@/lib/config/bossMissions';
import { bossProfileForChapter, type BossPulseKind } from '@/lib/config/bossProfiles';
import { COMBAT, COMBAT_ABILITIES, CombatAbilityId, combatStyleForChapter } from '@/lib/config/combat';
import { CORE_DEFENSE, CORE_DEFENSE_HOOKS } from '@/lib/config/coreDefense';
import { planetThemeForChapter } from '@/lib/config/planetThemes';
import { prestigePermanentBonuses } from '@/lib/config/prestige';
import { pickWaveType, waveTypeById, waveVariantsForChapter, type WaveTypeId } from '@/lib/config/waves';
import {
  EnemyVariantId,
  enemyVariantById,
  pickEnemyVariant,
} from '@/lib/config/enemyVariants';
import { isMegaBoss } from '@/lib/config/bosses';
import { audio } from '@/lib/audio/AudioEngine';
import { fmt } from '@/lib/util';

interface Vec {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  size: number;
  speed: number;
  weakUntil: number;
  nextWeakAt: number;
  lastContactAt: number;
  hitUntil: number;
  variantId: EnemyVariantId;
  shieldHitsLeft: number;
  damageMult: number;
  rewardMult: number;
  splitDepth: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Pulse {
  id: number;
  bornAt: number;
  fireAt: number;
  hit: boolean;
  canceled: boolean;
  kind: BossPulseKind;
  damageMult: number;
  speed: number;
  warningMs: number;
}

interface HpFloat {
  id: number;
  value: number;
  x: number;
  y: number;
  bornAt: number;
}

interface AbilityEffect {
  id: number;
  kind: CombatAbilityId;
  x: number;
  y: number;
  bornAt: number;
  until: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  targetType: 'enemy' | 'boss';
  damage: number;
  crit: boolean;
  speed: number;
  angle: number;
  bornAt: number;
  color: string;
  hitUntil: number;
}

interface DamageFloat {
  id: number;
  value: number;
  x: number;
  y: number;
  bornAt: number;
  crit: boolean;
}

interface WaveStatus {
  type: WaveTypeId;
  incoming: boolean;
  until: number;
}

interface PendingWave {
  type: WaveTypeId;
  dueAt: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dist(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function edgeSpawn(): Vec {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: 8 + Math.random() * 84, y: 8 };
  if (side === 1) return { x: 92, y: 18 + Math.random() * 70 };
  if (side === 2) return { x: 8 + Math.random() * 84, y: 92 };
  return { x: 8, y: 18 + Math.random() * 70 };
}

const COMBO_TIERS = [
  { threshold: 1000, key: 'singularFlow' },
  { threshold: 500, key: 'realityBreak' },
  { threshold: 250, key: 'orbitStorm' },
  { threshold: 100, key: 'rupture' },
  { threshold: 50, key: 'unstable' },
  { threshold: 15, key: 'cosmic' },
  { threshold: 1, key: 'ready' },
] as const;

const ARENA_PERF = {
  desktopRenderMs: 24,
  mobileRenderMs: 42,
  mobileCollisionMs: 80,
  desktopEnemyCap: 9,
  mobileEnemyCap: 6,
  desktopParticleCap: 42,
  mobileParticleCap: 22,
  desktopEffectCap: 4,
  mobileEffectCap: 3,
  desktopHpFloatCap: 5,
  mobileHpFloatCap: 3,
};

function comboTier(combo: number) {
  return COMBO_TIERS.find((tier) => combo >= tier.threshold) ?? COMBO_TIERS[COMBO_TIERS.length - 1];
}

function comboCombatPressure(combo: number) {
  if (combo <= 100) return Math.max(1, combo);
  if (combo <= 500) return 100 + Math.sqrt(combo - 100) * 5;
  return Math.min(300, 200 + Math.log10(combo - 400) * 34);
}

function comboVisualIntensity(combo: number) {
  return clamp(Math.log10(Math.max(1, combo)) / 3, 0, 1);
}

function anomalyMult(buffs: Buff[], type: Buff['type']) {
  const now = Date.now();
  return buffs.reduce((mult, buff) => (
    buff.type === type && buff.expiresAt > now ? mult * buff.mult : mult
  ), 1);
}

function bossArenaPoint(now: number, pressure: number): Vec {
  const drift = 0.8 + pressure * 1.35;
  return {
    x: 50 + Math.sin(now / 2800) * drift,
    y: 18 + Math.sin(now / 3600 + 0.9) * (0.35 + pressure * 0.6),
  };
}

function applyEnemyDamage(enemy: Enemy, damage: number, now: number): { enemy: Enemy; killed: boolean } {
  const variant = enemyVariantById(enemy.variantId);
  let shieldHitsLeft = enemy.shieldHitsLeft;
  let adjustedDamage = damage;
  if (variant.special === 'shield' && shieldHitsLeft > 0) {
    adjustedDamage = Math.max(1, Math.floor(damage * 0.34));
    shieldHitsLeft -= 1;
  }
  const hp = enemy.hp - adjustedDamage;
  return {
    enemy: {
      ...enemy,
      hp,
      shieldHitsLeft,
      hitUntil: now + 150,
    },
    killed: hp <= 0,
  };
}

function splitterChildren(enemy: Enemy, now: number, slots: number): Enemy[] {
  const variant = enemyVariantById(enemy.variantId);
  if (variant.special !== 'splitter' || enemy.splitDepth > 0 || slots <= 0) return [];
  const childVariant = enemyVariantById('basic');
  return Array.from({ length: Math.min(2, slots) }).map((_, index) => {
    const angle = index === 0 ? -0.75 : 0.75;
    const maxHp = Math.max(4, Math.floor(enemy.maxHp * 0.32));
    return {
      id: enemyId++,
      x: clamp(enemy.x + Math.cos(angle) * 4.2, 5, 95),
      y: clamp(enemy.y + Math.sin(angle) * 4.2, 9, 93),
      hp: maxHp,
      maxHp,
      size: Math.max(5.5, enemy.size * 0.68),
      speed: enemy.speed * 1.22,
      weakUntil: 0,
      nextWeakAt: now + 2200 + Math.random() * 3800,
      lastContactAt: 0,
      hitUntil: now + 220,
      variantId: childVariant.id,
      shieldHitsLeft: 0,
      damageMult: 0.65,
      rewardMult: 0.35,
      splitDepth: enemy.splitDepth + 1,
    };
  });
}

function projectileStats(args: {
  perTap: number;
  perSec: number;
  build: ReturnType<typeof selectBuildBonuses>;
  research: ReturnType<typeof selectResearchBonuses>;
  artifacts: ReturnType<typeof selectArtifactBonuses>;
  prestige: ReturnType<typeof prestigePermanentBonuses>;
  combo: number;
  lowDensity: boolean;
  burstActive: boolean;
}) {
  const comboPressure = Math.min(2.2, 1 + comboCombatPressure(args.combo) * 0.004);
  const damage =
    (args.perTap * CORE_DEFENSE.projectileDamageMult + args.perSec * CORE_DEFENSE.projectilePassiveDamageMult) *
    comboPressure *
    (1 + args.build.orbitDamagePct + args.research.orbitDamagePct + args.artifacts.orbitDamagePct + args.prestige.orbitDamagePct);
  const cooldownMult = Math.max(0.42, 1 - args.build.cooldownReductionPct - args.artifacts.cooldownReductionPct - args.artifacts.projectileFireRatePct - args.prestige.cooldownReductionPct);
  return {
    intervalMs: (args.lowDensity ? CORE_DEFENSE.mobileAttackIntervalMs : CORE_DEFENSE.baseAttackIntervalMs) *
      cooldownMult *
      (args.burstActive ? CORE_DEFENSE.burstAttackIntervalMult : 1),
    damage: Math.max(1, Math.floor(damage * (args.burstActive ? 1.22 : 1))),
    speed: args.lowDensity ? CORE_DEFENSE.mobileProjectileSpeed : CORE_DEFENSE.projectileSpeed,
    critChance: Math.min(0.35, CORE_DEFENSE.projectileCritChance + args.build.weakPointDamagePct * 0.35),
    critDamage: CORE_DEFENSE.projectileCritDamage + args.build.weakPointDamagePct + args.artifacts.weakPointDamagePct + args.prestige.rewardGainPct,
    extraProjectileChance: args.artifacts.extraProjectileChancePct,
  };
}

let enemyId = 1;
let particleId = 1;
let pulseId = 1;
let hpFloatId = 1;
let abilityEffectId = 1;
let projectileId = 1;
let damageFloatId = 1;

export function CombatArena() {
  const t = useTranslations();
  const boss = useGame((s) => s.boss);
  const combo = useGame((s) => s.combo);
  const levelIdx = useGame((s) => s.levelIdx);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const completedChapters = useGame((s) => s.completedChapters);
  const perTap = useGame(selectPerTap);
  const perSec = useGame(selectPerSec);
  const combatStats = useGame(selectCombatStats);
  const researchBonuses = useGame(selectResearchBonuses);
  const buildBonuses = useGame(selectBuildBonuses);
  const artifactBonuses = useGame(selectArtifactBonuses);
  const playerHp = useGame((s) => s.playerHp);
  const playerMana = useGame((s) => s.playerMana);
  const abilityCooldowns = useGame((s) => s.combatAbilityCooldowns);
  const activeBuffs = useGame((s) => s.activeBuffs);
  const tap = useGame((s) => s.tapDamacana);
  const applyCombatDamage = useGame((s) => s.applyCombatDamage);
  const healCombatHp = useGame((s) => s.healCombatHp);
  const restoreCombatMana = useGame((s) => s.restoreCombatMana);
  const regenCombatResources = useGame((s) => s.regenCombatResources);
  const spendCombatAbility = useGame((s) => s.spendCombatAbility);
  const boostCombatCombo = useGame((s) => s.boostCombatCombo);
  const reduceCombatCombo = useGame((s) => s.reduceCombatCombo);
  const bossPhaseToast = useGame((s) => s.bossPhaseToast);
  const dismissBossPhaseToast = useGame((s) => s.dismissBossPhaseToast);
  const enemyDiscoveryToast = useGame((s) => s.enemyDiscoveryToast);
  const dismissEnemyDiscoveryToast = useGame((s) => s.dismissEnemyDiscoveryToast);
  const discoverEnemyType = useGame((s) => s.discoverEnemyType);
  const rollArtifactReward = useGame((s) => s.rollArtifactReward);
  const sfxEnabled = useGame((s) => !s.audio.muted);

  const chapter = currentChapter(completedChapters);
  const style = useMemo(() => combatStyleForChapter(chapter), [chapter]);
  const planetTheme = useMemo(() => planetThemeForChapter(chapter.id), [chapter.id]);
  const bossProfile = useMemo(() => bossProfileForChapter(chapter.id), [chapter.id]);
  const finalBoss = boss.tier === chapter.finalBossTier;
  const mega = isMegaBoss(boss.tier);
  const phaseInfo = bossPhaseInfo(boss.tier);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef(new Set<string>());
  const dragRef = useRef(false);
  const targetRef = useRef<Vec>({ x: 50, y: 70 });
  const playerRef = useRef({ x: 50, y: 70, hitUntil: 0, healUntil: 0 });
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const abilityEffectsRef = useRef<AbilityEffect[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const lastSpawnRef = useRef(0);
  const lastProjectileShotRef = useRef(0);
  const burstFireUntilRef = useRef(0);
  const waveRef = useRef(1);
  const pendingWaveRef = useRef<PendingWave | null>(null);
  const activeWaveTypeRef = useRef<WaveTypeId>('normal');
  const lastOrbitRef = useRef(0);
  const lastBossPulseRef = useRef(0);
  const lastBossSummonRef = useRef(0);
  const lastBossShieldAtRef = useRef(Date.now());
  const lastBossSweepAtRef = useRef(Date.now());
  const lastGlobalContactRef = useRef(0);
  const lastResourceRegenRef = useRef(0);
  const lastOrbitSlashDamageRef = useRef(0);
  const invulnerableUntilRef = useRef(0);
  const collapseRestoreAtRef = useRef(0);
  const bossShieldUntilRef = useRef(0);
  const bossRageUntilRef = useRef(0);
  const rageTriggeredTierRef = useRef<number | null>(null);
  const nextBossWeakAtRef = useRef(Date.now() + 5000);
  const lastComboTierRef = useRef(1);
  const consumedAnomalyBuffsRef = useRef(new Set<string>());
  const lowDensityRef = useRef(false);
  const lastRenderRef = useRef(0);
  const lastCollisionCheckRef = useRef(0);

  const [player, setPlayer] = useState(playerRef.current);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [abilityEffects, setAbilityEffects] = useState<AbilityEffect[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [damageFloats, setDamageFloats] = useState<DamageFloat[]>([]);
  const [burstFireUntil, setBurstFireUntil] = useState(0);
  const [bossWeakUntil, setBossWeakUntil] = useState(0);
  const [bossHitUntil, setBossHitUntil] = useState(0);
  const [bossSummonUntil, setBossSummonUntil] = useState(0);
  const [bossShieldUntil, setBossShieldUntil] = useState(0);
  const [bossRageUntil, setBossRageUntil] = useState(0);
  const [comboFlash, setComboFlash] = useState<string | null>(null);
  const [hpFloats, setHpFloats] = useState<HpFloat[]>([]);
  const [collapseUntil, setCollapseUntil] = useState(0);
  const [collapseOverlayUntil, setCollapseOverlayUntil] = useState(0);
  const [entrance, setEntrance] = useState(0);
  const [lowDensity, setLowDensity] = useState(false);
  const [waveStatus, setWaveStatus] = useState<WaveStatus | null>(null);

  const perTapRef = useRef(perTap);
  const perSecRef = useRef(perSec);
  const comboRef = useRef(combo);
  const styleRef = useRef(style);
  const planetThemeRef = useRef(planetTheme);
  const sfxRef = useRef(sfxEnabled);
  const tapRef = useRef(tap);
  const bossRef = useRef(boss);
  const bossProfileRef = useRef(bossProfile);
  const chapterRef = useRef(chapter);
  const combatStatsRef = useRef(combatStats);
  const applyCombatDamageRef = useRef(applyCombatDamage);
  const healCombatHpRef = useRef(healCombatHp);
  const restoreCombatManaRef = useRef(restoreCombatMana);
  const regenCombatResourcesRef = useRef(regenCombatResources);
  const spendCombatAbilityRef = useRef(spendCombatAbility);
  const boostCombatComboRef = useRef(boostCombatCombo);
  const reduceCombatComboRef = useRef(reduceCombatCombo);
  const activeBuffsRef = useRef(activeBuffs);
  const researchBonusesRef = useRef(researchBonuses);
  const buildBonusesRef = useRef(buildBonuses);
  const artifactBonusesRef = useRef(artifactBonuses);
  const totalPrestigesRef = useRef(totalPrestiges);
  const discoverEnemyTypeRef = useRef(discoverEnemyType);
  const rollArtifactRewardRef = useRef(rollArtifactReward);

  useEffect(() => { perTapRef.current = perTap; }, [perTap]);
  useEffect(() => { perSecRef.current = perSec; }, [perSec]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { styleRef.current = style; }, [style]);
  useEffect(() => { planetThemeRef.current = planetTheme; }, [planetTheme]);
  useEffect(() => { sfxRef.current = sfxEnabled; }, [sfxEnabled]);
  useEffect(() => { tapRef.current = tap; }, [tap]);
  useEffect(() => { bossRef.current = boss; }, [boss]);
  useEffect(() => { bossProfileRef.current = bossProfile; }, [bossProfile]);
  useEffect(() => { chapterRef.current = chapter; }, [chapter]);
  useEffect(() => { combatStatsRef.current = combatStats; }, [combatStats]);
  useEffect(() => { applyCombatDamageRef.current = applyCombatDamage; }, [applyCombatDamage]);
  useEffect(() => { healCombatHpRef.current = healCombatHp; }, [healCombatHp]);
  useEffect(() => { restoreCombatManaRef.current = restoreCombatMana; }, [restoreCombatMana]);
  useEffect(() => { regenCombatResourcesRef.current = regenCombatResources; }, [regenCombatResources]);
  useEffect(() => { spendCombatAbilityRef.current = spendCombatAbility; }, [spendCombatAbility]);
  useEffect(() => { boostCombatComboRef.current = boostCombatCombo; }, [boostCombatCombo]);
  useEffect(() => { reduceCombatComboRef.current = reduceCombatCombo; }, [reduceCombatCombo]);
  useEffect(() => { activeBuffsRef.current = activeBuffs; }, [activeBuffs]);
  useEffect(() => { researchBonusesRef.current = researchBonuses; }, [researchBonuses]);
  useEffect(() => { buildBonusesRef.current = buildBonuses; }, [buildBonuses]);
  useEffect(() => { artifactBonusesRef.current = artifactBonuses; }, [artifactBonuses]);
  useEffect(() => { totalPrestigesRef.current = totalPrestiges; }, [totalPrestiges]);
  useEffect(() => { discoverEnemyTypeRef.current = discoverEnemyType; }, [discoverEnemyType]);
  useEffect(() => { rollArtifactRewardRef.current = rollArtifactReward; }, [rollArtifactReward]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queries = [
      window.matchMedia('(max-width: 640px)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const update = () => {
      const next = queries.some((query) => query.matches);
      lowDensityRef.current = next;
      setLowDensity(next);
    };
    update();
    queries.forEach((query) => query.addEventListener('change', update));
    return () => {
      queries.forEach((query) => query.removeEventListener('change', update));
    };
  }, []);

  useEffect(() => {
    const now = Date.now();
    lastBossSummonRef.current = now;
    lastBossShieldAtRef.current = now;
    lastBossSweepAtRef.current = now;
    bossShieldUntilRef.current = 0;
    bossRageUntilRef.current = 0;
    rageTriggeredTierRef.current = null;
    setBossShieldUntil(0);
    setBossRageUntil(0);
    activeWaveTypeRef.current = 'normal';
    pendingWaveRef.current = null;
    setWaveStatus(null);
    setEntrance((v) => v + 1);
  }, [boss.tier]);

  const emitParticles = useCallback((x: number, y: number, color: string, count: number, power = 1) => {
    const low = lowDensityRef.current;
    const adjustedCount = Math.max(1, Math.floor(count * (low ? 0.45 : 1)));
    const burst: Particle[] = Array.from({ length: adjustedCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.08 + Math.random() * 0.22) * power * (low ? 0.82 : 1);
      return {
        id: particleId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: low ? 320 + Math.random() * 220 : 460 + Math.random() * 360,
        maxLife: low ? 560 : 820,
        color,
        size: low ? 1.5 + Math.random() * 2.5 : 2 + Math.random() * 4,
      };
    });
    const cap = low ? ARENA_PERF.mobileParticleCap : ARENA_PERF.desktopParticleCap;
    particlesRef.current = [...particlesRef.current.slice(-cap), ...burst].slice(-cap);
    setParticles(particlesRef.current);
  }, []);

  const pushHpFloat = useCallback((value: number, x: number, y: number) => {
    const id = hpFloatId++;
    const cap = lowDensityRef.current ? ARENA_PERF.mobileHpFloatCap : ARENA_PERF.desktopHpFloatCap;
    setHpFloats((items) => [
      ...items.slice(-(cap - 1)),
      { id, value, x, y, bornAt: Date.now() },
    ]);
    setTimeout(() => {
      setHpFloats((items) => items.filter((item) => item.id !== id));
    }, 1000);
  }, []);

  const pushDamageFloat = useCallback((value: number, x: number, y: number, crit = false) => {
    const id = damageFloatId++;
    const cap = lowDensityRef.current ? 5 : 9;
    setDamageFloats((items) => [
      ...items.slice(-(cap - 1)),
      { id, value, x, y, crit, bornAt: Date.now() },
    ]);
    setTimeout(() => {
      setDamageFloats((items) => items.filter((item) => item.id !== id));
    }, 760);
  }, []);

  const triggerBurstFire = useCallback((now = Date.now()) => {
    burstFireUntilRef.current = Math.max(
      burstFireUntilRef.current + CORE_DEFENSE.burstStackMs,
      now + CORE_DEFENSE.burstDurationMs,
    );
    burstFireUntilRef.current = Math.min(burstFireUntilRef.current, now + CORE_DEFENSE.burstDurationMs + 900);
    setBurstFireUntil(burstFireUntilRef.current);
    boostCombatComboRef.current(1.8);
  }, []);

  const pointFromEvent = useCallback((e: PointerEvent): Vec => {
    const box = arenaRef.current?.getBoundingClientRect();
    if (!box) return targetRef.current;
    return {
      x: clamp(((e.clientX - box.left) / box.width) * 100, 6, 94),
      y: clamp(((e.clientY - box.top) / box.height) * 100, 12, 92),
    };
  }, []);

  const damagePlayer = useCallback((amount: number) => {
    const now = Date.now();
    if (now < invulnerableUntilRef.current) return;
    const p = playerRef.current;
    const result = applyCombatDamageRef.current(amount);
    playerRef.current = { ...p, hitUntil: now + 360 };
    targetRef.current = { x: p.x, y: p.y };
    setPlayer(playerRef.current);
    pushHpFloat(result.damage, p.x, p.y - 6);
    emitParticles(p.x, p.y, '#ff3d6e', 10, 1.1);
    useGame.setState({ shake: { intensity: 'small', at: now } });
    if (sfxRef.current) audio.sfxPlayerHit();
    if (result.collapsed) {
      const healPct = COMBAT.bossCollapseHealMinPct + Math.random() * (COMBAT.bossCollapseHealMaxPct - COMBAT.bossCollapseHealMinPct);
      const currentBoss = bossRef.current;
      const healedBoss = {
        ...currentBoss,
        hpCur: Math.min(currentBoss.hpMax, currentBoss.hpCur + currentBoss.hpMax * healPct),
      };
      bossRef.current = healedBoss;
      invulnerableUntilRef.current = now + COMBAT.collapseRecoveryMs + buildBonusesRef.current.collapseRecoveryMs;
      collapseRestoreAtRef.current = now + COMBAT.collapseRestoreDelayMs;
      setCollapseUntil(invulnerableUntilRef.current);
      setCollapseOverlayUntil(now + COMBAT.collapseOverlayMs);
      playerRef.current = { ...p, hitUntil: now + COMBAT.collapseOverlayMs, healUntil: invulnerableUntilRef.current };
      targetRef.current = { x: 50, y: 70 };
      pulsesRef.current = [];
      setPulses([]);
      setPlayer(playerRef.current);
      useGame.setState({ shake: { intensity: 'hard', at: now } });
      useGame.setState((state) => ({ boss: healedBoss, combo: 0, lastTapAt: 0 }));
      emitParticles(p.x, p.y, '#ff3d6e', 28, 1.8);
    } else {
      reduceCombatComboRef.current(0.18);
    }
  }, [emitParticles, pushHpFloat]);

  const bossDamageGuardMult = useCallback(() => {
    const profile = bossProfileRef.current;
    return Date.now() <= bossShieldUntilRef.current ? profile.shieldWindow?.damageTakenMult ?? 0.42 : 1;
  }, []);

  const spawnWave = useCallback((now: number, forcedCount = 0, forcedVariants?: EnemyVariantId[], waveTypeId: WaveTypeId = 'normal') => {
    const activeChapter = chapterRef.current;
    const activeStyle = styleRef.current;
    const tuning = bossPhaseCombatTuning(bossRef.current.tier, lowDensityRef.current);
    const wave = waveTypeById(waveTypeId);
    const perfCap = lowDensityRef.current ? ARENA_PERF.mobileEnemyCap : ARENA_PERF.desktopEnemyCap;
    const enemyCap = Math.min(perfCap, tuning.maxMinions);
    const targetCount = Math.min(enemyCap, 2 + activeChapter.order + Math.floor(waveRef.current / 3));
    const needed = Math.max(1, targetCount - enemiesRef.current.length);
    const baseCount = forcedCount > 0 ? forcedCount : Math.min(needed, 2 + Math.floor(Math.random() * 2));
    const waveCount = forcedCount > 0
      ? baseCount
      : Math.max(1, Math.ceil(baseCount * wave.countMult + wave.countAdd));
    const count = Math.min(waveCount, Math.max(0, enemyCap - enemiesRef.current.length));
    if (count <= 0) return;
    const waveVariants = forcedVariants ?? waveVariantsForChapter(waveTypeId, activeChapter.id);
    const nextEnemies = [...enemiesRef.current];
    for (let i = 0; i < count; i++) {
      const start = edgeSpawn();
      const variant = waveVariants?.length
        ? enemyVariantById(waveVariants[(waveRef.current + i) % waveVariants.length])
        : pickEnemyVariant(activeChapter, tuning.info.progress);
      discoverEnemyTypeRef.current(variant.id);
      const maxHp = Math.max(8, Math.floor((perTapRef.current * (2.8 + activeChapter.order * 1.1) + bossRef.current.tier * 1.6) * tuning.enemyHpMult * variant.hpMult * wave.hpMult));
      nextEnemies.push({
        id: enemyId++,
        x: start.x,
        y: start.y,
        hp: maxHp,
        maxHp,
        size: (7.5 + activeChapter.order * 0.8 + Math.random() * 2) * (variant.id === 'tank' ? 1.14 : variant.id === 'rush' ? 0.84 : 1),
        speed: (5.2 + activeChapter.order * 0.72) * activeStyle.speedMult * tuning.enemySpeedMult * variant.speedMult * wave.speedMult,
        weakUntil: 0,
        nextWeakAt: now + 2800 + Math.random() * 5200,
        lastContactAt: 0,
        hitUntil: 0,
        variantId: variant.id,
        shieldHitsLeft: variant.shieldHits ?? 0,
        damageMult: variant.damageMult * wave.damageMult,
        rewardMult: variant.rewardMult * wave.rewardMult,
        splitDepth: 0,
      });
    }
    waveRef.current += 1;
    activeWaveTypeRef.current = waveTypeId;
    setWaveStatus({ type: waveTypeId, incoming: false, until: now + (wave.special ? 4200 : 2600) });
    if (waveTypeId === 'elite') rollArtifactRewardRef.current('eliteWave');
    if (waveTypeId === 'anomaly') rollArtifactRewardRef.current('anomalyWave');
    enemiesRef.current = nextEnemies;
    setEnemies(nextEnemies);
  }, []);

  const strikeEnemy = useCallback((id: number, e: PointerEvent) => {
    e.stopPropagation();
    const point = pointFromEvent(e);
    const now = Date.now();
    triggerBurstFire(now);
    const activeStyle = styleRef.current;
    const visualIntensity = comboVisualIntensity(comboRef.current);
    let critical = false;
    let killed = false;
    let killedEnemy: Enemy | null = null;
    let rewardMult = 1;
    let hitVariant = enemyVariantById('basic');
    const damageBase = perTapRef.current * (1 + Math.min(comboCombatPressure(comboRef.current), 180) * 0.055);
    let next = enemiesRef.current.map((enemy) => {
      if (enemy.id !== id) return enemy;
      hitVariant = enemyVariantById(enemy.variantId);
      rewardMult = enemy.rewardMult;
      critical = now <= enemy.weakUntil;
      const result = applyEnemyDamage(enemy, Math.floor(damageBase * (critical ? 3.1 : 1)), now);
      killed = result.killed;
      if (killed) killedEnemy = result.enemy;
      return {
        ...result.enemy,
        weakUntil: critical ? 0 : enemy.weakUntil,
        nextWeakAt: critical ? now + 6500 + Math.random() * 4500 : enemy.nextWeakAt,
      };
    }).filter((enemy) => enemy.hp > 0);
    if (killedEnemy) {
      next = [
        ...next,
        ...splitterChildren(killedEnemy, now, (lowDensityRef.current ? ARENA_PERF.mobileEnemyCap : ARENA_PERF.desktopEnemyCap) - next.length),
      ];
      if (hitVariant.special === 'anomaly') {
        useGame.setState((state) => ({
          shards: state.shards + (Math.random() < 0.18 ? 1 : 0),
          activeBuffs: [
            ...state.activeBuffs.filter((buff) => buff.id !== 'enemy_anomaly_signal' && buff.expiresAt > now),
            { id: 'enemy_anomaly_signal', expiresAt: now + 12_000, mult: 1.15, type: 'shardChance', labelKey: 'shardChance' },
          ],
        }));
      }
    }

    enemiesRef.current = next;
    setEnemies(next);
    emitParticles(
      point.x,
      point.y,
      critical ? activeStyle.weak : activeStyle.enemy,
      Math.floor((critical ? 20 : 10) + visualIntensity * 12),
      (critical ? 1.6 : 1) + visualIntensity * 0.55,
    );
    tapRef.current(e.clientX, e.clientY, {
      damageMult: (critical ? 2.6 : 1) * bossDamageGuardMult(),
      rewardMult: (critical ? 1.35 : 1 + Math.min(comboRef.current, 20) * 0.012) * rewardMult,
      comboBoost: critical ? 7 : 1.55,
      comboFlatBonus: critical ? 6 : 0,
      forceCrit: critical,
    });
    if (critical) boostCombatComboRef.current(8);
    if (killed) boostCombatComboRef.current(10 + Math.min(36, comboRef.current * 0.04));
    restoreCombatManaRef.current(critical ? COMBAT.weakManaOnHit : COMBAT.comboManaOnHit);
    if (sfxRef.current) {
      if (critical) audio.sfxCriticalRupture();
      else audio.sfxCombatHit(comboRef.current);
    }
    if (critical || comboRef.current >= 10 || killed) {
      useGame.setState({ shake: { intensity: critical || killed ? 'medium' : 'small', at: now } });
    }
    if (critical) setComboFlash(t('combat.criticalRupture'));
    else if (killed) setComboFlash(`x${Math.max(2, Math.floor(comboRef.current))}`);
    else if (comboRef.current >= 2) setComboFlash(`x${Math.floor(comboRef.current)}`);
  }, [bossDamageGuardMult, emitParticles, pointFromEvent, t, triggerBurstFire]);

  const strikeBoss = useCallback((e: PointerEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const point = pointFromEvent(e);
    triggerBurstFire(now);
    const critical = now <= bossWeakUntil;
    const visualIntensity = comboVisualIntensity(comboRef.current);
    emitParticles(
      point.x,
      point.y,
      critical ? styleRef.current.weak : chapterRef.current.accent,
      Math.floor((critical ? 28 : 14) + visualIntensity * 14),
      (critical ? 2 : 1.2) + visualIntensity * 0.6,
    );
    tapRef.current(e.clientX, e.clientY, {
      damageMult: (critical ? 3.4 : finalBoss ? 1.35 : 1.15) * bossDamageGuardMult(),
      rewardMult: critical ? 1.45 : 1.06,
      comboBoost: critical ? 8 : 1.6,
      comboFlatBonus: critical ? 8 : 0,
      forceCrit: critical,
    });
    setBossHitUntil(now + (critical ? 360 : 210));
    if (critical) boostCombatComboRef.current(18);
    restoreCombatManaRef.current(critical ? COMBAT.weakManaOnHit : COMBAT.comboManaOnHit);
    if (critical) {
      const canceledPulses = pulsesRef.current.map((pulse) => (
        now < pulse.fireAt ? { ...pulse, canceled: true } : pulse
      ));
      pulsesRef.current = canceledPulses;
      setPulses(canceledPulses);
      setBossWeakUntil(0);
      setComboFlash(t('combat.criticalRupture'));
      useGame.setState({ shake: { intensity: 'hard', at: now } });
      if (sfxRef.current) audio.sfxCriticalRupture();
    } else {
      if (comboRef.current >= 8) useGame.setState({ shake: { intensity: 'small', at: now } });
      if (sfxRef.current) audio.sfxCombatHit(comboRef.current);
    }
  }, [bossDamageGuardMult, bossWeakUntil, emitParticles, finalBoss, pointFromEvent, t, triggerBurstFire]);

  const damageEnemiesInRadius = useCallback((center: Vec, radius: number, damage: number, color: string) => {
    const now = Date.now();
    let hitCount = 0;
    let killedCount = 0;
    const killedEnemies: Enemy[] = [];
    let next = enemiesRef.current
      .map((enemy) => {
        if (dist(enemy, center) > radius) return enemy;
        const result = applyEnemyDamage(enemy, damage, now);
        hitCount += 1;
        if (result.killed) {
          killedCount += 1;
          killedEnemies.push(result.enemy);
        }
        return result.enemy;
      })
      .filter((enemy) => enemy.hp > 0);
    for (const enemy of killedEnemies) {
      next = [
        ...next,
        ...splitterChildren(enemy, now, (lowDensityRef.current ? ARENA_PERF.mobileEnemyCap : ARENA_PERF.desktopEnemyCap) - next.length),
      ];
    }
    enemiesRef.current = next;
    setEnemies(enemiesRef.current);
    if (hitCount > 0) {
      emitParticles(center.x, center.y, color, Math.min(28, 8 + hitCount * 5), 1.6);
      useGame.setState({ shake: { intensity: hitCount >= 3 ? 'medium' : 'small', at: Date.now() } });
    }
    return { hitCount, killedCount };
  }, [emitParticles]);

  const addAbilityEffect = useCallback((kind: CombatAbilityId, x: number, y: number, durationMs: number) => {
    const now = Date.now();
    abilityEffectsRef.current = [
      ...abilityEffectsRef.current.slice(-(lowDensityRef.current ? ARENA_PERF.mobileEffectCap - 1 : ARENA_PERF.desktopEffectCap - 1)),
      { id: abilityEffectId++, kind, x, y, bornAt: now, until: now + durationMs },
    ];
    setAbilityEffects(abilityEffectsRef.current);
  }, []);

  const activateAbility = useCallback((id: CombatAbilityId) => {
    const ability = COMBAT_ABILITIES.find((item) => item.id === id);
    if (!ability || !spendCombatAbilityRef.current(id)) return;
    const now = Date.now();
    const center = { x: playerRef.current.x, y: playerRef.current.y };
    const build = buildBonusesRef.current;
    if (id === 'waveBurst') {
      const damage = Math.max(1, Math.floor(perTapRef.current * (ability.damageMult ?? 1) * (1 + build.aoeDamagePct)));
      const hits = damageEnemiesInRadius(center, ability.radius, damage, '#5cf6ff');
      if (hits.hitCount > 0) boostCombatComboRef.current(8 + hits.hitCount * 5 + hits.killedCount * 8);
      tapRef.current(undefined, undefined, { damageMult: 0.7 * bossDamageGuardMult(), rewardMult: 0.35, passive: true, silent: true });
      addAbilityEffect(id, center.x, center.y, 620);
      if (sfxRef.current) audio.sfxAbility();
    } else if (id === 'orbitSlash') {
      addAbilityEffect(id, center.x, center.y, ability.durationMs ?? 4000);
      boostCombatComboRef.current(6);
      if (sfxRef.current) audio.sfxAbility();
    } else if (id === 'coreHeal') {
      healCombatHpRef.current(combatStatsRef.current.maxHp * (ability.healPct ?? 0.3));
      playerRef.current = { ...playerRef.current, healUntil: now + 850 };
      setPlayer(playerRef.current);
      emitParticles(center.x, center.y, '#5cf6ff', 24, 1.4);
      addAbilityEffect(id, center.x, center.y, 900);
      boostCombatComboRef.current(10);
      if (sfxRef.current) audio.sfxTreeUnlock();
    }
  }, [addAbilityEffect, bossDamageGuardMult, damageEnemiesInRadius, emitParticles]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysRef.current.add(key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (nowPerf: number) => {
      const now = Date.now();
      const dt = Math.min(42, nowPerf - last);
      last = nowPerf;
      const lowDensityFrame = lowDensityRef.current;
      const activePhaseTuning = bossPhaseCombatTuning(bossRef.current.tier, lowDensityFrame);
      const enemyCap = Math.min(lowDensityFrame ? ARENA_PERF.mobileEnemyCap : ARENA_PERF.desktopEnemyCap, activePhaseTuning.maxMinions);
      const checkCollision = !lowDensityFrame || now - lastCollisionCheckRef.current >= ARENA_PERF.mobileCollisionMs;
      if (checkCollision) lastCollisionCheckRef.current = now;
      const activeAnomalies = activeBuffsRef.current.filter((buff) => buff.expiresAt > now);
      const activeProfile = bossProfileRef.current;
      const currentBoss = bossRef.current;
      const bossHpRatio = currentBoss.hpMax > 0 ? currentBoss.hpCur / currentBoss.hpMax : 1;
      if (
        activeProfile.rage &&
        rageTriggeredTierRef.current !== currentBoss.tier &&
        bossHpRatio <= activeProfile.rage.hpThreshold
      ) {
        rageTriggeredTierRef.current = currentBoss.tier;
        bossRageUntilRef.current = now + activeProfile.rage.durationMs;
        setBossRageUntil(bossRageUntilRef.current);
        setBossHitUntil(now + 900);
        useGame.setState({ shake: { intensity: 'medium', at: now } });
      }
      const rageActive = now <= bossRageUntilRef.current;
      const pulseRateMult = activeProfile.pulseIntervalMult * (rageActive ? activeProfile.rage?.pulseIntervalMult ?? 1 : 1);
      const summonRateMult = activeProfile.summonIntervalMult * (rageActive ? activeProfile.rage?.summonIntervalMult ?? 1 : 1);
      const dueWave = pendingWaveRef.current;
      if (dueWave && now >= dueWave.dueAt) {
        pendingWaveRef.current = null;
        spawnWave(now, 0, undefined, dueWave.type);
      }
      for (const buff of activeAnomalies) {
        if (buff.type !== 'waveSurge' || consumedAnomalyBuffsRef.current.has(buff.id)) continue;
        consumedAnomalyBuffsRef.current.add(buff.id);
        spawnWave(now, Math.max(1, Math.floor(buff.mult * 2)));
      }
      if (collapseRestoreAtRef.current === 0 && now - lastResourceRegenRef.current > 250) {
        const elapsed = lastResourceRegenRef.current === 0 ? 250 : now - lastResourceRegenRef.current;
        lastResourceRegenRef.current = now;
        regenCombatResourcesRef.current(elapsed);
      }
      if (collapseRestoreAtRef.current > 0 && now >= collapseRestoreAtRef.current) {
        collapseRestoreAtRef.current = 0;
        healCombatHpRef.current(combatStatsRef.current.maxHp);
        playerRef.current = { ...playerRef.current, healUntil: invulnerableUntilRef.current };
        emitParticles(playerRef.current.x, playerRef.current.y, '#5cf6ff', 26, 1.35);
      }
      const p = { ...playerRef.current };
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;
      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (dx !== 0 || dy !== 0) {
        const mag = Math.hypot(dx, dy) || 1;
        const speed = 38 * (dt / 1000);
        p.x = clamp(p.x + (dx / mag) * speed, 7, 93);
        p.y = clamp(p.y + (dy / mag) * speed, 16, 91);
        targetRef.current = { x: p.x, y: p.y };
      } else {
        const target = targetRef.current;
        const lerp = dragRef.current ? Math.min(1, dt / 76) : Math.min(1, dt / 190);
        p.x = clamp(p.x + (target.x - p.x) * lerp, 7, 93);
        p.y = clamp(p.y + (target.y - p.y) * lerp, 16, 91);
      }

      const activeStyle = styleRef.current;
      const activeTheme = planetThemeRef.current;
      const activeChapter = chapterRef.current;
      const activeBuild = buildBonusesRef.current;
      const activeArtifacts = artifactBonusesRef.current;
      const activePrestige = prestigePermanentBonuses(totalPrestigesRef.current);
      const orbitJammerMult = enemiesRef.current.some((enemy) => enemy.variantId === 'orbitJammer') ? 0.62 : 1;
      const updatedEnemies = enemiesRef.current.map((enemy) => {
        const variant = enemyVariantById(enemy.variantId);
        let nextWeakAt = enemy.nextWeakAt;
        let weakUntil = enemy.weakUntil;
        if (now >= nextWeakAt) {
          weakUntil = now + COMBAT.weakPointDurationMs * anomalyMult(activeAnomalies, 'weakPoint');
          nextWeakAt = now + 6900 + Math.random() * 6200;
        }
        const toPlayer = { x: p.x - enemy.x, y: p.y - enemy.y };
        const length = Math.hypot(toPlayer.x, toPlayer.y) || 1;
        const wobble = activeChapter.id === 'saturn' ? Math.sin((now + enemy.id * 311) / 520) * 0.75 : 0;
        const orbitSlow = activeBuild.orbitSlowPct > 0 && dist(enemy, p) < 28 ? 1 - Math.min(0.35, activeBuild.orbitSlowPct) : 1;
        const step = enemy.speed * activeStyle.aggression * anomalyMult(activeAnomalies, 'enemySpeed') * (1 + activeBuild.enemyAggressionPct) * orbitSlow * (dt / 1000);
        const x = clamp(enemy.x + (toPlayer.x / length) * step + wobble * (dt / 1000), 4, 96);
        const y = clamp(enemy.y + (toPlayer.y / length) * step, 8, 96);
        let lastContactAt = enemy.lastContactAt;
        let hitUntil = enemy.hitUntil;
        if (
          checkCollision &&
          dist({ x, y }, p) < COMBAT.playerContactRadius &&
          now - lastContactAt > COMBAT.contactCooldownMs &&
          now - lastGlobalContactRef.current > COMBAT.globalContactCooldownMs
        ) {
          lastContactAt = now;
          lastGlobalContactRef.current = now;
          hitUntil = now + 180;
          damagePlayer(COMBAT.contactDamage * enemy.damageMult * activePhaseTuning.enemyDamageMult);
          if (variant.special === 'manaLeech') {
            restoreCombatManaRef.current(-12);
            useGame.setState((state) => ({
              activeBuffs: [
                ...state.activeBuffs.filter((buff) => buff.id !== 'enemy_mana_leech' && buff.expiresAt > now),
                { id: 'enemy_mana_leech', expiresAt: now + 5_000, mult: 0.65, type: 'manaRegen', labelKey: 'manaLeech' },
              ],
            }));
          }
        }
        return { ...enemy, x, y, weakUntil, nextWeakAt, lastContactAt, hitUntil };
      });
      enemiesRef.current = updatedEnemies;

      if (!pendingWaveRef.current && (now - lastSpawnRef.current > activePhaseTuning.spawnDelayMs || updatedEnemies.length === 0)) {
        lastSpawnRef.current = now;
        const nextWave = pickWaveType(activeChapter, activePhaseTuning.info.progress);
        if (nextWave.special && updatedEnemies.length > 0) {
          const warningMs = lowDensityFrame ? 720 : 920;
          pendingWaveRef.current = { type: nextWave.id, dueAt: now + warningMs };
          activeWaveTypeRef.current = nextWave.id;
          setWaveStatus({ type: nextWave.id, incoming: true, until: now + warningMs + 1200 });
        } else {
          spawnWave(now, 0, undefined, nextWave.id);
        }
      }

      const burstActive = now <= burstFireUntilRef.current;
      const projectileCap = lowDensityFrame ? CORE_DEFENSE.projectileCapMobile : CORE_DEFENSE.projectileCapDesktop;
      const shotStats = projectileStats({
        perTap: perTapRef.current,
        perSec: perSecRef.current,
        build: activeBuild,
        research: researchBonusesRef.current,
        artifacts: activeArtifacts,
        prestige: activePrestige,
        combo: comboRef.current,
        lowDensity: lowDensityFrame,
        burstActive,
      });
      if (
        CORE_DEFENSE_HOOKS.autoFire &&
        now - lastProjectileShotRef.current >= shotStats.intervalMs &&
        projectilesRef.current.length < projectileCap
      ) {
        const targetEnemy = enemiesRef.current
          .map((enemy) => ({ enemy, distance: dist(enemy, p) }))
          .filter((item) => item.distance < 58)
          .sort((a, b) => a.distance - b.distance)[0]?.enemy;
        const bossPoint = bossArenaPoint(now, activePhaseTuning.info.progress);
        const targetPoint = targetEnemy ?? bossPoint;
        const angle = Math.atan2(targetPoint.y - p.y, targetPoint.x - p.x);
        const crit = Math.random() < shotStats.critChance;
        const baseProjectile: Projectile = {
            id: projectileId++,
            x: p.x,
            y: p.y,
            targetId: targetEnemy?.id ?? bossRef.current.tier,
            targetType: targetEnemy ? 'enemy' as const : 'boss' as const,
            damage: Math.floor(shotStats.damage * (crit ? shotStats.critDamage : 1)),
            crit,
            speed: shotStats.speed,
            angle,
            bornAt: now,
            color: crit ? '#ffd166' : burstActive ? '#ff5ce8' : activeTheme.particleColor,
            hitUntil: 0,
          };
        const shots: Projectile[] = [baseProjectile];
        if (
          projectilesRef.current.length + shots.length < projectileCap &&
          Math.random() < shotStats.extraProjectileChance
        ) {
          shots.push({
            ...baseProjectile,
            id: projectileId++,
            angle: angle + (Math.random() > 0.5 ? 0.16 : -0.16),
            damage: Math.max(1, Math.floor(baseProjectile.damage * 0.72)),
            color: burstActive ? '#ff5ce8' : '#bffcff',
          });
        }
        projectilesRef.current = [...projectilesRef.current, ...shots].slice(-projectileCap);
        lastProjectileShotRef.current = now;
        if (!lowDensityFrame) emitParticles(p.x, p.y, burstActive ? '#ff5ce8' : activeTheme.particleColor, burstActive ? 5 : 3, 0.45);
      }

      if (CORE_DEFENSE_HOOKS.projectileFiring && projectilesRef.current.length > 0) {
        const survivors: Projectile[] = [];
        let nextEnemies = enemiesRef.current;
        for (const projectile of projectilesRef.current) {
          const targetEnemy = projectile.targetType === 'enemy'
            ? nextEnemies.find((enemy) => enemy.id === projectile.targetId)
            : undefined;
          const bossPoint = bossArenaPoint(now, activePhaseTuning.info.progress);
          const targetPoint = targetEnemy ? { x: targetEnemy.x, y: targetEnemy.y } : bossPoint;
          const dxp = targetPoint.x - projectile.x;
          const dyp = targetPoint.y - projectile.y;
          const distance = Math.hypot(dxp, dyp) || 1;
          const step = projectile.speed * dt;
          const hitRadius = targetEnemy ? Math.max(2.8, targetEnemy.size * 0.2) : 5.4;
          if (distance <= step + hitRadius) {
            if (targetEnemy) {
              const killedEnemies: Enemy[] = [];
              const targetVariant = enemyVariantById(targetEnemy.variantId);
              nextEnemies = nextEnemies
                .map((enemy) => {
                  if (enemy.id !== targetEnemy.id) return enemy;
                  const result = applyEnemyDamage(enemy, projectile.damage, now);
                  if (result.killed) killedEnemies.push(result.enemy);
                  const pushX = clamp(result.enemy.x + (dxp / distance) * 0.8, 4, 96);
                  const pushY = clamp(result.enemy.y + (dyp / distance) * 0.8, 8, 96);
                  return { ...result.enemy, x: pushX, y: pushY, hitUntil: now + (projectile.crit ? 260 : 170) };
                })
                .filter((enemy) => enemy.hp > 0);
              for (const enemy of killedEnemies) {
                nextEnemies = [
                  ...nextEnemies,
                  ...splitterChildren(enemy, now, enemyCap - nextEnemies.length),
                ];
                if (targetVariant.special === 'anomaly') {
                  useGame.setState((state) => ({
                    shards: state.shards + (Math.random() < 0.18 ? 1 : 0),
                    activeBuffs: [
                      ...state.activeBuffs.filter((buff) => buff.id !== 'enemy_anomaly_signal' && buff.expiresAt > now),
                      { id: 'enemy_anomaly_signal', expiresAt: now + 12_000, mult: 1.15, type: 'shardChance', labelKey: 'shardChance' },
                    ],
                  }));
                }
              }
              pushDamageFloat(projectile.damage, targetPoint.x, targetPoint.y - 3, projectile.crit);
              emitParticles(targetPoint.x, targetPoint.y, projectile.crit ? '#ffd166' : targetVariant.accent, projectile.crit ? 12 : 7, projectile.crit ? 1.15 : 0.75);
              if (killedEnemies.length > 0) {
                boostCombatComboRef.current(6 + killedEnemies.length * 4);
                restoreCombatManaRef.current(COMBAT.comboManaOnHit);
                tapRef.current(undefined, undefined, { damageMult: 0.1, rewardMult: 0.18 * targetEnemy.rewardMult, passive: true, silent: true });
              } else if (projectile.crit) {
                boostCombatComboRef.current(2.5);
              }
            } else {
              setBossHitUntil(now + (projectile.crit ? 260 : 150));
              pushDamageFloat(projectile.damage, targetPoint.x, targetPoint.y - 5, projectile.crit);
              emitParticles(targetPoint.x, targetPoint.y, projectile.crit ? '#ffd166' : activeChapter.accent, projectile.crit ? 10 : 5, projectile.crit ? 1 : 0.65);
              tapRef.current(undefined, undefined, {
                damageMult: (projectile.crit ? 0.24 : 0.14) * bossDamageGuardMult(),
                rewardMult: projectile.crit ? 0.14 : 0.08,
                comboBoost: projectile.crit ? 2.4 : 0.7,
                passive: true,
                silent: true,
              });
            }
            continue;
          }
          const nx = projectile.x + (dxp / distance) * step;
          const ny = projectile.y + (dyp / distance) * step;
          if (now - projectile.bornAt < 1850 && nx > -5 && nx < 105 && ny > -5 && ny < 105) {
            survivors.push({
              ...projectile,
              x: nx,
              y: ny,
              angle: Math.atan2(dyp, dxp),
              targetType: targetEnemy ? projectile.targetType : 'boss',
              targetId: targetEnemy ? projectile.targetId : bossRef.current.tier,
            });
          }
        }
        enemiesRef.current = nextEnemies;
        projectilesRef.current = survivors.slice(-projectileCap);
      }

      if (now - lastOrbitRef.current > COMBAT.passiveOrbitMs) {
        lastOrbitRef.current = now;
        const target = enemiesRef.current
          .map((enemy) => ({ enemy, d: dist(enemy, p) }))
          .filter((item) => item.d < 30)
          .sort((a, b) => a.d - b.d)[0]?.enemy;
        if (target) {
          const damage = Math.max(1, Math.floor(perTapRef.current * 0.48 * orbitJammerMult * anomalyMult(activeAnomalies, 'orbitDamage') * (1 + researchBonusesRef.current.orbitDamagePct + activeBuild.orbitDamagePct + activeArtifacts.orbitDamagePct + activePrestige.orbitDamagePct)));
          let killedEnemy: Enemy | null = null;
          enemiesRef.current = enemiesRef.current
            .map((enemy) => {
              if (enemy.id !== target.id) return enemy;
              const result = applyEnemyDamage(enemy, damage, now);
              if (result.killed) killedEnemy = result.enemy;
              return result.enemy;
            })
            .filter((enemy) => enemy.hp > 0);
          if (killedEnemy) {
            enemiesRef.current = [
              ...enemiesRef.current,
              ...splitterChildren(killedEnemy, now, enemyCap - enemiesRef.current.length),
            ];
          }
          emitParticles(target.x, target.y, enemyVariantById(target.variantId).accent, 5, 0.7);
        }
        tapRef.current(undefined, undefined, { damageMult: 0.12 * orbitJammerMult * bossDamageGuardMult(), rewardMult: 0.18, passive: true, silent: true });
      }

      const activeOrbit = abilityEffectsRef.current.find((effect) => effect.kind === 'orbitSlash' && now < effect.until);
      if (activeOrbit && now - lastOrbitSlashDamageRef.current > 220) {
        lastOrbitSlashDamageRef.current = now;
        const damage = Math.max(1, Math.floor(perTapRef.current * 0.28 * orbitJammerMult * anomalyMult(activeAnomalies, 'orbitDamage') * (1 + researchBonusesRef.current.orbitDamagePct + activeBuild.orbitDamagePct + activeArtifacts.orbitDamagePct + activePrestige.orbitDamagePct)));
        const baseRadius = COMBAT_ABILITIES.find((ability) => ability.id === 'orbitSlash')?.radius ?? 28;
        const radius = baseRadius * (1 + activeBuild.orbitSlashRadiusPct + activeArtifacts.orbitRadiusPct);
        let orbitHits = 0;
        const killedEnemies: Enemy[] = [];
        let nextEnemies = enemiesRef.current
          .map((enemy) => {
            if (dist(enemy, p) > radius) return enemy;
            orbitHits += 1;
            const result = applyEnemyDamage(enemy, damage, now);
            if (result.killed) killedEnemies.push(result.enemy);
            return result.enemy;
          })
          .filter((enemy) => enemy.hp > 0);
        for (const enemy of killedEnemies) {
          nextEnemies = [
            ...nextEnemies,
            ...splitterChildren(enemy, now, enemyCap - nextEnemies.length),
          ];
        }
        enemiesRef.current = nextEnemies;
        emitParticles(p.x, p.y, '#ff5ce8', 5, 0.75);
        if (orbitHits > 0) boostCombatComboRef.current(1 + Math.min(4, orbitHits));
        tapRef.current(undefined, undefined, { damageMult: 0.08 * orbitJammerMult * bossDamageGuardMult(), rewardMult: 0.12, passive: true, silent: true });
      }

      if (
        activeProfile.shieldWindow &&
        now - lastBossShieldAtRef.current > activeProfile.shieldWindow.intervalMs
      ) {
        lastBossShieldAtRef.current = now;
        bossShieldUntilRef.current = now + activeProfile.shieldWindow.durationMs;
        setBossShieldUntil(bossShieldUntilRef.current);
        setBossHitUntil(now + 650);
        emitParticles(bossArenaPoint(now, activePhaseTuning.info.progress).x, bossArenaPoint(now, activePhaseTuning.info.progress).y, '#80fff4', 10, 0.85);
      }

      if (
        activeProfile.orbitSweep &&
        now - lastBossSweepAtRef.current > activeProfile.orbitSweep.intervalMs
      ) {
        lastBossSweepAtRef.current = now;
        const fireAt = now + activeProfile.orbitSweep.warningMs;
        pulsesRef.current = [
          ...pulsesRef.current,
          {
            id: pulseId++,
            bornAt: now,
            fireAt,
            hit: false,
            canceled: false,
            kind: 'sweep',
            damageMult: activeProfile.orbitSweep.damageMult,
            speed: activeProfile.orbitSweep.speed,
            warningMs: activeProfile.orbitSweep.warningMs,
          },
        ];
        setBossWeakUntil((current) => Math.max(current, fireAt));
        setBossHitUntil(now + activeProfile.orbitSweep.warningMs);
      }

      if (now - lastBossPulseRef.current > activePhaseTuning.pulseIntervalMs * pulseRateMult * anomalyMult(activeAnomalies, 'bossSlow')) {
        lastBossPulseRef.current = now;
        const corruptedProfile = activeProfile.corruptedPulse;
        const corrupted = !!corruptedProfile && Math.random() < corruptedProfile.chance;
        const warningMs = COMBAT.bossPulseWarningMs * (corrupted ? 1.08 : 1);
        const fireAt = now + warningMs;
        pulsesRef.current = [
          ...pulsesRef.current,
          {
            id: pulseId++,
            bornAt: now,
            fireAt,
            hit: false,
            canceled: false,
            kind: corrupted ? 'corrupted' : 'pulse',
            damageMult: corrupted && corruptedProfile ? corruptedProfile.damageMult : 1,
            speed: COMBAT.bossPulseSpeed * (corrupted && corruptedProfile ? corruptedProfile.speedMult : 1),
            warningMs,
          },
        ];
        setBossWeakUntil((current) => Math.max(current, fireAt));
        setBossHitUntil(now + warningMs);
      }
      pulsesRef.current = pulsesRef.current
        .map((pulse) => {
          if (pulse.canceled || now < pulse.fireAt) return pulse;
          const radius = ((now - pulse.fireAt) * pulse.speed) / anomalyMult(activeAnomalies, 'bossSlow');
          const distance = dist(bossArenaPoint(now, activePhaseTuning.info.progress), p);
          if (!pulse.hit && Math.abs(distance - radius) < COMBAT.bossPulseDamageBand) {
            damagePlayer(COMBAT.bossPulseDamage * activePhaseTuning.pulseDamageMult * pulse.damageMult * anomalyMult(activeAnomalies, 'bossRage') * (1 + activeArtifacts.bossPulseDamagePct));
            return { ...pulse, hit: true };
          }
          return pulse;
        })
        .filter((pulse) => now - pulse.bornAt < 3600);

      if (now >= nextBossWeakAtRef.current) {
        const weakTiming = activeProfile.weakPointTiming;
        setBossWeakUntil(now + COMBAT.weakPointDurationMs * weakTiming.durationMult * anomalyMult(activeAnomalies, 'weakPoint'));
        nextBossWeakAtRef.current = now + weakTiming.minMs + Math.random() * (weakTiming.maxMs - weakTiming.minMs);
      }

      const bossIsMajor = currentBoss.tier === activeChapter.finalBossTier || isMegaBoss(currentBoss.tier);
      const summonInterval = activePhaseTuning.summonIntervalMs * summonRateMult * (bossIsMajor ? 0.82 : 1) * anomalyMult(activeAnomalies, 'bossSlow');
      if (
        enemiesRef.current.length < enemyCap &&
        now - lastBossSummonRef.current > summonInterval
      ) {
        lastBossSummonRef.current = now;
        const summonCount = Math.min(enemyCap - enemiesRef.current.length, activePhaseTuning.summonCount + (bossIsMajor ? 1 : 0));
        setBossSummonUntil(now + 1250);
        setBossHitUntil(now + 950);
        spawnWave(now, summonCount, activeProfile.summonBias);
        const bossPoint = bossArenaPoint(now, activePhaseTuning.info.progress);
        emitParticles(bossPoint.x, bossPoint.y, activeChapter.accent, bossIsMajor ? 22 : 16, 1.35);
        useGame.setState({ shake: { intensity: 'small', at: now } });
      }

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * dt,
          y: particle.y + particle.vy * dt,
          life: particle.life - dt,
        }))
        .filter((particle) => particle.life > 0 && particle.x > -6 && particle.x < 106 && particle.y > -6 && particle.y < 106);

      abilityEffectsRef.current = abilityEffectsRef.current
        .map((effect) => effect.kind === 'orbitSlash' ? { ...effect, x: p.x, y: p.y } : effect)
        .filter((effect) => effect.until > now);

      playerRef.current = p;
      const renderInterval = lowDensityFrame ? ARENA_PERF.mobileRenderMs : ARENA_PERF.desktopRenderMs;
      if (nowPerf - lastRenderRef.current >= renderInterval) {
        lastRenderRef.current = nowPerf;
        setPlayer(p);
        setEnemies(enemiesRef.current);
        setPulses(pulsesRef.current);
        setProjectiles(projectilesRef.current);
        setParticles(particlesRef.current);
        setAbilityEffects(abilityEffectsRef.current);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [bossDamageGuardMult, damagePlayer, emitParticles, pushDamageFloat, spawnWave]);

  useEffect(() => {
    if (!comboFlash) return;
    const id = setTimeout(() => setComboFlash(null), 720);
    return () => clearTimeout(id);
  }, [comboFlash]);

  useEffect(() => {
    if (!bossPhaseToast) return;
    const delay = Math.max(600, bossPhaseToast.expiresAt - Date.now());
    const id = setTimeout(() => dismissBossPhaseToast(), delay);
    return () => clearTimeout(id);
  }, [bossPhaseToast, dismissBossPhaseToast]);

  useEffect(() => {
    if (!enemyDiscoveryToast) return;
    const id = setTimeout(() => dismissEnemyDiscoveryToast(), 3200);
    return () => clearTimeout(id);
  }, [enemyDiscoveryToast, dismissEnemyDiscoveryToast]);

  useEffect(() => {
    const tier = comboTier(combo);
    if (combo <= 1) {
      lastComboTierRef.current = 1;
      return;
    }
    if (tier.threshold > lastComboTierRef.current) {
      setComboFlash(t(`combat.comboTiers.${tier.key}` as any));
    }
    lastComboTierRef.current = tier.threshold;
  }, [combo, t]);

  const activeComboTier = comboTier(combo);
  const comboLabel = t(`combat.comboTiers.${activeComboTier.key}` as any);
  const intensity = comboVisualIntensity(combo);
  const bossHpPct = Math.max(0, Math.min(100, (boss.hpCur / boss.hpMax) * 100));
  const playerHpPct = (Math.min(playerHp ?? combatStats.maxHp, combatStats.maxHp) / combatStats.maxHp) * 100;
  const playerManaPct = (Math.min(playerMana ?? 0, combatStats.maxMana) / combatStats.maxMana) * 100;
  const renderNow = Date.now();
  const renderBossPoint = bossArenaPoint(renderNow, phaseInfo.progress);
  const playerHit = renderNow <= player.hitUntil;
  const collapseActive = renderNow <= collapseUntil;
  const collapseOverlayActive = renderNow <= collapseOverlayUntil;
  const orbitSlashActive = abilityEffects.some((effect) => effect.kind === 'orbitSlash');
  const bossWeakActive = renderNow <= bossWeakUntil;
  const bossHitActive = renderNow <= bossHitUntil;
  const bossSummoning = renderNow <= bossSummonUntil;
  const bossShieldActive = renderNow <= bossShieldUntil;
  const bossRageActive = renderNow <= bossRageUntil;
  const burstFireActive = renderNow <= burstFireUntil;
  const bossWarningActive = pulses.some((pulse) => !pulse.canceled && renderNow < pulse.fireAt);
  const bossSweepWarningActive = pulses.some((pulse) => pulse.kind === 'sweep' && !pulse.canceled && renderNow < pulse.fireAt);
  const bossCorruptedWarningActive = pulses.some((pulse) => pulse.kind === 'corrupted' && !pulse.canceled && renderNow < pulse.fireAt);
  const showBossTarget = bossWeakActive || bossWarningActive || bossSummoning || bossHitActive || bossShieldActive || bossRageActive;
  const activeWaveStatus = waveStatus && waveStatus.until > renderNow ? waveStatus : null;
  const activeWaveDef = activeWaveStatus ? waveTypeById(activeWaveStatus.type) : null;
  const activeBossPhaseToast = bossPhaseToast && bossPhaseToast.expiresAt > renderNow ? bossPhaseToast : null;
  const bossStatusLabel = bossCorruptedWarningActive
    ? t('combat.corruptedPulse')
    : bossSweepWarningActive
      ? t('combat.orbitSweep')
      : bossShieldActive
        ? t('combat.bossShield')
        : bossRageActive
          ? t('combat.bossRage')
          : bossWarningActive
            ? t('combat.bossAttackWarning')
            : bossWeakActive
              ? t('combat.weakPointExposed')
              : bossSummoning
                ? t('combat.bossSummoning')
                : t('combat.bossTarget');
  const bossSize = Math.round((lowDensity ? (finalBoss || mega ? 112 : 92) : (finalBoss || mega ? 128 : 104)) * CORE_DEFENSE.bossControllerScale);
  const coreSize = lowDensity ? CORE_DEFENSE.mobilePlayerCoreSizePx : CORE_DEFENSE.playerCoreSizePx;
  const coreShieldSize = lowDensity ? CORE_DEFENSE.playerShieldSizePx - 8 : CORE_DEFENSE.playerShieldSizePx;
  const weakPointAngle = bossProfile.rotatingWeakPoint ? (renderNow / 1000) * bossProfile.rotatingWeakPoint.speed : 0;
  const weakPointRadius = bossProfile.rotatingWeakPoint?.radiusPx ?? 0;
  const weakPointX = Math.cos(weakPointAngle) * weakPointRadius;
  const weakPointY = Math.sin(weakPointAngle) * weakPointRadius;
  const playerGlow = lowDensity ? 0.62 : 1;
  const renderedPulses = lowDensity ? pulses.slice(-1) : pulses;
  const renderedParticles = lowDensity ? particles.slice(-ARENA_PERF.mobileParticleCap) : particles;
  const renderedHpFloats = lowDensity ? hpFloats.slice(-ARENA_PERF.mobileHpFloatCap) : hpFloats;
  const renderedDamageFloats = lowDensity ? damageFloats.slice(-5) : damageFloats;
  const renderedTargetLines = enemies
    .map((enemy) => {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      return { enemy, distance: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) * (180 / Math.PI) };
    })
    .filter((item) => item.distance < 42)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, lowDensity ? CORE_DEFENSE.targetLineLimitMobile : CORE_DEFENSE.targetLineLimitDesktop);

  return (
    <div
      ref={arenaRef}
      data-combat-arena
      tabIndex={0}
      onPointerDown={(e) => {
        triggerBurstFire();
        dragRef.current = true;
        targetRef.current = pointFromEvent(e);
      }}
      onPointerMove={(e) => {
        if (!dragRef.current) return;
        targetRef.current = pointFromEvent(e);
      }}
      onPointerUp={() => { dragRef.current = false; }}
      onPointerCancel={() => { dragRef.current = false; }}
      className="relative mx-2 mt-1.5 flex-1 overflow-hidden rounded-lg border border-cyan/25 bg-black/35 shadow-[0_0_22px_rgba(92,246,255,0.1)] outline-none sm:mx-3 sm:mt-2 sm:shadow-[0_0_34px_rgba(92,246,255,0.12)]"
      style={{
        minHeight: 'clamp(280px, calc(100dvh - 270px), 420px)',
        touchAction: 'none',
        borderColor: planetTheme.arenaBorder,
        boxShadow: lowDensity ? `0 0 20px ${planetTheme.ambientGlow}` : `0 0 34px ${planetTheme.ambientGlow}`,
        background: `radial-gradient(circle at 50% 22%, ${planetTheme.arenaTint}, ${style.arenaGlow} 34%, rgba(0,0,0,0.48) 100%)`,
      }}
      aria-label="combat arena"
    >
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute inset-x-5 top-[32%] h-px" style={{ background: planetTheme.gridColor }} />
        <div className="absolute inset-x-10 top-[62%] h-px bg-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
      </div>
      {planetTheme.effect === 'rings' && !lowDensity && (
        <div
          className="pointer-events-none absolute left-1/2 top-[50%] z-[4] h-20 w-[118%] -translate-x-1/2 -rotate-12 rounded-full border opacity-20"
          style={{ borderColor: planetTheme.uiAccent, boxShadow: `0 0 26px ${planetTheme.ambientGlow}` }}
        />
      )}
      {planetTheme.effect === 'storm' && (
        <div
          className="pointer-events-none absolute inset-x-[-10%] top-[22%] z-[4] h-32 opacity-20"
          style={{ background: `repeating-linear-gradient(155deg, transparent 0 18px, ${planetTheme.dustColor} 20px 23px, transparent 24px 40px)` }}
        />
      )}
      {planetTheme.effect === 'dust' && (
        <div
          className="pointer-events-none absolute inset-x-[-8%] top-[34%] z-[4] h-20"
          style={{ opacity: 0.18, background: `linear-gradient(105deg, transparent, ${planetTheme.dustColor}, transparent)` }}
        />
      )}

      <div className="pointer-events-none absolute left-2 right-2 top-2 z-20 sm:left-3 sm:right-3 sm:top-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[9px] font-space uppercase tracking-widest text-white/60">
              <span style={{ color: chapter.accent }}>{t(`combat.bossThemes.${bossProfile.i18nKey}` as any)} · {phaseInfo.finalPhase ? t('combat.finalPhase') : t('combat.phaseLabel', { phase: phaseInfo.phase, total: phaseInfo.totalPhases })}</span>
              <span className="text-white/70">T{boss.tier}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full transition-[width]"
                style={{ width: `${bossHpPct}%`, background: finalBoss ? chapter.accent : '#ff3d6e', boxShadow: `0 0 16px ${finalBoss ? chapter.glow : 'rgba(255,61,110,0.6)'}` }}
              />
            </div>
          </div>
          <div className="w-20 sm:w-24">
            <div className="flex items-center justify-between text-[9px] font-space uppercase tracking-widest text-white/60">
              <span>{t('combat.hp')}</span>
              <span>{Math.ceil(playerHp ?? combatStats.maxHp)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full transition-[width,background-color] duration-300"
                style={{
                  width: `${playerHpPct}%`,
                  background: playerHit || playerHpPct < 35 ? '#ff3d6e' : '#5cf6ff',
                  boxShadow: playerHit ? '0 0 14px rgba(255,61,110,0.85)' : '0 0 12px rgba(92,246,255,0.72)',
                }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[8px] font-space uppercase tracking-widest text-white/45">
              <span>{t('combat.mana')}</span>
              <span>{Math.floor(playerMana ?? 0)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-purple transition-[width] duration-300 shadow-[0_0_10px_rgba(184,122,255,0.75)]"
                style={{ width: `${playerManaPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {showBossTarget && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-none absolute left-1/2 top-[6.5%] z-40 -translate-x-1/2 rounded-md border border-white/15 bg-black/70 px-2.5 py-1 text-center shadow-[0_0_18px_rgba(0,0,0,0.5)]"
          style={{
            borderColor: bossWeakActive ? 'rgba(255,209,102,0.72)' : bossShieldActive ? 'rgba(128,255,244,0.68)' : bossRageActive || bossWarningActive ? 'rgba(255,61,110,0.62)' : 'rgba(92,246,255,0.42)',
            boxShadow: bossWeakActive
              ? '0 0 20px rgba(255,209,102,0.24)'
              : bossShieldActive
                ? '0 0 20px rgba(128,255,244,0.24)'
                : bossRageActive || bossWarningActive
                ? '0 0 22px rgba(255,61,110,0.26)'
                : '0 0 18px rgba(92,246,255,0.18)',
          }}
        >
          <div className="font-space text-[8px] uppercase tracking-[0.22em] text-white/55">
            {t('combat.bossTarget')}
          </div>
          <div
            className="mt-0.5 font-vt text-sm leading-none"
            style={{ color: bossWeakActive ? '#ffd166' : bossShieldActive ? '#80fff4' : bossRageActive || bossWarningActive ? '#ff3d6e' : '#5cf6ff' }}
          >
            {bossStatusLabel}
          </div>
        </motion.div>
      )}

      {activeWaveStatus && activeWaveDef && (
        <motion.div
          key={`${activeWaveStatus.type}-${activeWaveStatus.incoming ? 'incoming' : 'active'}`}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-[16%] z-40 -translate-x-1/2 rounded-md border bg-black/72 px-2.5 py-1 text-center shadow-[0_0_18px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          style={{
            borderColor: activeWaveDef.accent,
            boxShadow: lowDensity ? undefined : `0 0 18px ${activeWaveDef.accent}44`,
          }}
        >
          <div
            className="font-space text-[8px] uppercase tracking-[0.2em]"
            style={{ color: activeWaveDef.accent }}
          >
            {activeWaveStatus.incoming
              ? t('combat.waveIncoming', { wave: t(`combat.waves.${activeWaveDef.i18nKey}` as any) })
              : t('combat.waveLabel', { wave: t(`combat.waves.${activeWaveDef.i18nKey}` as any) })}
          </div>
        </motion.div>
      )}

      {activeBossPhaseToast && (
        <motion.div
          key={activeBossPhaseToast.id}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-[14%] z-50 w-[min(88%,300px)] -translate-x-1/2 rounded-lg border border-gold/35 bg-black/78 px-3 py-2 text-center shadow-[0_0_22px_rgba(255,209,102,0.18)]"
        >
          <div className="font-space text-[8px] uppercase tracking-[0.24em] text-gold/80">
            {activeBossPhaseToast.finalPhase ? t('combat.missionClear') : t('combat.phaseClear')}
          </div>
          <div className="mt-0.5 font-vt text-base leading-none text-white">
            {t('combat.phaseLabel', { phase: activeBossPhaseToast.phase, total: activeBossPhaseToast.totalPhases })}
          </div>
          {activeBossPhaseToast.dropId && (
            <>
              <div className="mt-1 font-space text-[9px] uppercase tracking-wider text-cyan">
                {t('combat.bossDrop')}: {t(`bossDrops.${activeBossPhaseToast.dropId}.name` as any)}
                {activeBossPhaseToast.shardGain > 0 ? ` +${activeBossPhaseToast.shardGain} ${t('ui.shards')}` : ''}
              </div>
              <div className="mt-0.5 font-space text-[8px] uppercase tracking-wider text-white/55">
                {t(`bossDrops.${activeBossPhaseToast.dropId}.desc` as any)}
              </div>
            </>
          )}
        </motion.div>
      )}

      {enemyDiscoveryToast && (
        <motion.div
          key={enemyDiscoveryToast}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-[15%] z-50 w-[min(86%,280px)] -translate-x-1/2 rounded-md border border-cyan/35 bg-black/78 px-3 py-2 text-center shadow-[0_0_18px_rgba(92,246,255,0.18)]"
        >
          <div className="font-space text-[8px] uppercase tracking-[0.22em] text-white/50">
            {t('combat.newThreat')}
          </div>
          <div className="mt-0.5 font-space text-[10px] uppercase tracking-[0.18em] text-cyan">
            {t(`enemyVariants.${enemyDiscoveryToast}.name` as any)}
          </div>
        </motion.div>
      )}

      <motion.div
        key={`boss-entrance-${entrance}`}
        initial={{ opacity: 0.85, scale: 0.2 }}
        animate={{ opacity: 0, scale: 1.85 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-[18%] z-[9] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          left: `${renderBossPoint.x}%`,
          top: `${renderBossPoint.y}%`,
          width: bossSize + 18,
          borderColor: chapter.accent,
          boxShadow: lowDensity ? undefined : `0 0 32px ${chapter.glow}`,
        }}
      />

      <motion.button
        key={entrance}
        initial={{ scale: 0.42, opacity: 0, rotate: -18 }}
        animate={{
          scale: bossHitActive ? 1.07 : bossSummoning || bossRageActive ? 1.04 : bossWarningActive ? 1.03 : 1,
          opacity: 1,
          rotate: bossHitActive ? 2 : bossRageActive ? -1.5 : 0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        whileTap={{ scale: 0.96 }}
        onPointerDown={strikeBoss}
        className="absolute left-1/2 top-[18%] z-[25] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-black/60"
        style={{
          left: `${renderBossPoint.x}%`,
          top: `${renderBossPoint.y}%`,
          width: bossSize,
          height: bossSize,
          borderColor: bossWeakActive ? '#ffd166' : bossShieldActive ? '#80fff4' : bossRageActive || bossWarningActive ? '#ff3d6e' : finalBoss ? chapter.accent : mega ? '#ffd166' : '#ff3d6e',
          color: bossShieldActive ? '#80fff4' : finalBoss ? chapter.accent : '#ff3d6e',
          boxShadow: bossWeakActive
            ? lowDensity ? '0 0 28px rgba(255,209,102,0.42)' : '0 0 62px rgba(255,209,102,0.64), inset 0 0 24px rgba(255,209,102,0.2)'
            : bossShieldActive
              ? lowDensity ? '0 0 28px rgba(128,255,244,0.36)' : '0 0 58px rgba(128,255,244,0.48), inset 0 0 24px rgba(128,255,244,0.18)'
              : bossRageActive || bossWarningActive
              ? lowDensity ? '0 0 30px rgba(255,61,110,0.42)' : '0 0 64px rgba(255,61,110,0.58), inset 0 0 24px rgba(255,61,110,0.18)'
              : lowDensity ? `0 0 ${finalBoss ? 26 : 20}px ${finalBoss ? chapter.glow : 'rgba(255,61,110,0.32)'}` : `0 0 ${finalBoss ? 52 : 34}px ${finalBoss ? chapter.glow : 'rgba(255,61,110,0.42)'}`,
        }}
        aria-label="boss entity"
      >
        <div className="absolute inset-2 rounded-full border border-white/10" />
        <div className="absolute h-[78%] w-[78%] rounded-full border border-current/35 animate-spinslow" />
        <div
          className="absolute h-[58%] w-[58%] rounded-full border border-white/10"
          style={{
            background: bossShieldActive
              ? 'radial-gradient(circle, rgba(128,255,244,0.18), rgba(128,255,244,0.02) 66%)'
              : bossWarningActive
              ? 'radial-gradient(circle, rgba(255,61,110,0.2), rgba(255,61,110,0.02) 66%)'
              : bossSummoning
                ? 'radial-gradient(circle, rgba(92,246,255,0.18), rgba(92,246,255,0.02) 66%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 68%)',
          }}
        />
        {bossHitActive && !lowDensity && (
          <div className="absolute -inset-2 rounded-full border border-white/40 bg-white/5 shadow-[0_0_26px_rgba(255,255,255,0.24)]" />
        )}
        {bossSummoning && (
          <div className="absolute -inset-4 rounded-full border border-dashed border-cyan/50 sm:animate-spinslow sm:shadow-[0_0_28px_rgba(92,246,255,0.24)]" />
        )}
        {bossShieldActive && (
          <div className="absolute -inset-4 rounded-full border-2 border-cyan/55 bg-cyan/5 shadow-[0_0_26px_rgba(128,255,244,0.32)]" />
        )}
        {bossRageActive && (
          <div className="absolute -inset-5 rounded-full border-2 border-dashed border-danger/60 bg-danger/5 shadow-[0_0_30px_rgba(255,61,110,0.34)]" />
        )}
        {bossWeakActive && (
          <>
            <div className="absolute -inset-3 rounded-full border-2 border-gold/70 shadow-[0_0_30px_rgba(255,209,102,0.45)]" />
            <div
              className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full border-2 border-gold bg-gold/15 shadow-[0_0_24px_rgba(255,209,102,0.95)]"
              style={{ transform: `translate(calc(-50% + ${weakPointX}px), calc(-50% + ${weakPointY}px))` }}
            >
              <div className="absolute inset-2 rounded-full bg-gold/75 shadow-[0_0_18px_rgba(255,209,102,0.9)]" />
            </div>
          </>
        )}
        <div className="font-vt text-4xl">{chapter.planetGlyph}</div>
      </motion.button>

      {renderedPulses.map((pulse) => {
        const warning = renderNow < pulse.fireAt;
        const age = warning ? renderNow - pulse.bornAt : renderNow - pulse.fireAt;
        const radius = warning ? 11 + (age / pulse.warningMs) * (pulse.kind === 'sweep' ? 10 : 7) : age * pulse.speed;
        const opacity = pulse.canceled ? 0.18 : warning ? 0.85 : Math.max(0, 1 - age / 2400);
        const warningColor = pulse.kind === 'corrupted' ? 'rgba(184,122,255,0.95)' : pulse.kind === 'sweep' ? 'rgba(92,246,255,0.88)' : 'rgba(255,209,102,0.95)';
        const activeColor = pulse.kind === 'corrupted' ? 'rgba(184,122,255,0.78)' : pulse.kind === 'sweep' ? 'rgba(255,209,102,0.7)' : 'rgba(255,61,110,0.72)';
        const glowColor = pulse.kind === 'corrupted' ? 'rgba(184,122,255,0.46)' : pulse.kind === 'sweep' ? 'rgba(92,246,255,0.35)' : 'rgba(255,61,110,0.42)';
        return (
          <div
            key={pulse.id}
            className="pointer-events-none absolute left-1/2 top-[24%] z-[8] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              left: `${renderBossPoint.x}%`,
              top: `${renderBossPoint.y}%`,
              width: `${radius * 2}%`,
              aspectRatio: '1 / 1',
              opacity,
              borderColor: pulse.canceled ? 'rgba(92,246,255,0.5)' : warning ? warningColor : activeColor,
              borderStyle: warning ? 'dashed' : 'solid',
              borderWidth: pulse.kind === 'corrupted' && !warning ? 4 : warning ? 2 : 3,
              background: warning ? 'rgba(255,209,102,0.04)' : pulse.kind === 'corrupted' ? 'rgba(184,122,255,0.055)' : 'rgba(255,61,110,0.045)',
              boxShadow: lowDensity ? undefined : pulse.canceled ? '0 0 18px rgba(92,246,255,0.28)' : warning ? `0 0 30px ${warningColor}` : `0 0 32px ${glowColor}`,
            }}
          >
            {warning && !lowDensity && (
              <div className="absolute inset-[14%] rounded-full border border-gold/35" />
            )}
          </div>
        );
      })}

      {projectiles.map((projectile) => (
        <div
          key={projectile.id}
          className="pointer-events-none absolute z-[31] h-1.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${projectile.x}%`,
            top: `${projectile.y}%`,
            background: projectile.color,
            transform: `translate(-50%, -50%) rotate(${projectile.angle}rad)`,
            opacity: Math.max(0.25, 1 - (renderNow - projectile.bornAt) / 1850),
            boxShadow: lowDensity ? undefined : `0 0 ${projectile.crit ? 18 : 12}px ${projectile.color}`,
          }}
        >
          {!lowDensity && (
            <span
              className="absolute right-full top-1/2 h-px w-7 -translate-y-1/2 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${projectile.color})` }}
            />
          )}
        </div>
      ))}

      {renderedTargetLines.map(({ enemy, distance, angle }) => (
        <div
          key={`target-${enemy.id}`}
          className="pointer-events-none absolute z-[12] h-px origin-left bg-cyan/20"
          style={{
            left: `${enemy.x}%`,
            top: `${enemy.y}%`,
            width: `${distance}%`,
            transform: `rotate(${angle}deg)`,
            opacity: Math.max(0.08, 0.28 - distance * 0.004),
            boxShadow: lowDensity ? undefined : '0 0 8px rgba(92,246,255,0.18)',
          }}
        />
      ))}

      {enemies.map((enemy) => {
        const weak = renderNow <= enemy.weakUntil;
        const hit = renderNow <= enemy.hitUntil;
        const variant = enemyVariantById(enemy.variantId);
        const shielded = enemy.shieldHitsLeft > 0;
        return (
          <button
            key={enemy.id}
            onPointerDown={(e) => strikeEnemy(enemy.id, e)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-[38%] border bg-black/70"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              width: `${enemy.size * 2}px`,
              height: `${enemy.size * 2}px`,
              borderColor: weak ? style.weak : shielded ? '#ffffff' : variant.accent,
              boxShadow: lowDensity ? `0 0 ${hit ? 14 : 8}px ${weak ? style.weak : variant.glow}` : `0 0 ${hit ? 26 : 16}px ${weak ? style.weak : variant.glow}`,
              transform: `translate(-50%, -50%) scale(${hit ? 1.16 : 1})`,
            }}
            aria-label={t(`enemyVariants.${variant.i18nKey}.name` as any)}
            title={t(`enemyVariants.${variant.i18nKey}.name` as any)}
          >
            <span
              className="absolute inset-[24%] rounded-[30%] bg-current opacity-45"
              style={{
                color: weak ? style.weak : variant.accent,
                transform: variant.id === 'rush'
                  ? 'skewX(-18deg) rotate(45deg)'
                  : variant.id === 'tank'
                    ? 'rotate(0deg)'
                    : variant.id === 'orbitJammer'
                      ? 'rotate(45deg) scale(1.16)'
                      : 'rotate(45deg)',
                borderRadius: variant.id === 'tank' ? '18%' : variant.id === 'manaLeech' ? '50%' : '30%',
              }}
            />
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-vt text-[13px] leading-none"
              style={{ color: shielded ? '#ffffff' : variant.accent, textShadow: `0 0 8px ${variant.glow}` }}
            >
              {variant.symbol}
            </span>
            {shielded && (
              <span className="absolute -inset-1 rounded-[38%] border border-white/55 bg-white/5" />
            )}
            {weak && <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_14px_rgba(255,209,102,0.95)]" />}
            <span className="absolute -bottom-2 left-1/2 h-1 w-9 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full" style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`, background: weak ? style.weak : variant.accent }} />
            </span>
          </button>
        );
      })}

      <div
        className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          left: `${player.x}%`,
          top: `${player.y}%`,
          width: coreSize,
          height: coreSize,
          borderColor: playerHit ? '#ff3d6e' : collapseActive ? '#5cf6ff' : chapter.accent,
          background: playerHit ? 'rgba(255,61,110,0.24)' : burstFireActive ? 'rgba(255,92,232,0.16)' : collapseActive ? 'rgba(92,246,255,0.18)' : 'rgba(2,16,24,0.82)',
          boxShadow: playerHit
            ? `0 0 ${36 * playerGlow}px rgba(255,61,110,0.78)`
            : collapseActive
              ? `0 0 ${42 * playerGlow}px rgba(92,246,255,0.72)`
              : burstFireActive
                ? `0 0 ${44 * playerGlow}px rgba(255,92,232,0.58)`
                : `0 0 ${(18 + intensity * 30) * playerGlow}px ${combo >= 15 ? `rgba(255,92,232,${0.34 + intensity * 0.2})` : chapter.glow}`,
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/20"
          style={{
            width: coreShieldSize,
            height: coreShieldSize,
            opacity: playerHpPct > 66 ? 0.48 : playerHpPct > 33 ? 0.3 : 0.16,
            boxShadow: lowDensity ? undefined : `0 0 ${playerHit ? 26 : 16}px rgba(92,246,255,0.16)`,
          }}
        />
        {playerHit && !lowDensity && (
          <div className="absolute -inset-4 rounded-full border-2 border-danger/55 bg-danger/10 shadow-[0_0_28px_rgba(255,61,110,0.48)]" />
        )}
        {collapseActive && (
          <div className="absolute -inset-5 rounded-full border border-cyan/45 bg-cyan/5 shadow-[0_0_28px_rgba(92,246,255,0.36)]" />
        )}
        {burstFireActive && (
          <div className="absolute -inset-3 rounded-full border border-dashed border-pink/45 shadow-[0_0_20px_rgba(255,92,232,0.34)]" />
        )}
        <div className="absolute inset-[8px] rounded-full bg-cyan shadow-[0_0_18px_rgba(92,246,255,0.98)]" />
        <div className="absolute inset-[17px] rounded-full bg-white/85" />
        {orbitSlashActive && (
          <div
            className="absolute left-1/2 top-1/2 h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-pink/35 animate-spinslow"
            style={{ boxShadow: `0 0 ${14 + intensity * 16}px rgba(255,92,232,${0.2 + intensity * 0.18})` }}
          />
        )}
      </div>

      {renderedParticles.map((particle) => (
        <div
          key={particle.id}
          className="pointer-events-none absolute z-40 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            opacity: Math.max(0, particle.life / particle.maxLife),
            boxShadow: lowDensity ? undefined : `0 0 12px ${particle.color}`,
          }}
        />
      ))}

      {abilityEffects.map((effect) => {
        const age = renderNow - effect.bornAt;
        const duration = Math.max(1, effect.until - effect.bornAt);
        const progress = Math.min(1, age / duration);
        const color = effect.kind === 'coreHeal' ? '#5cf6ff' : effect.kind === 'orbitSlash' ? '#ff5ce8' : '#5cf6ff';
        const orbitEffectSize = 112 * (1 + buildBonuses.orbitSlashRadiusPct + artifactBonuses.orbitRadiusPct);
        return (
          <div
            key={effect.id}
            className="pointer-events-none absolute z-[35] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              width: effect.kind === 'waveBurst' ? `${34 + progress * 170}px` : effect.kind === 'coreHeal' ? `${60 + progress * 58}px` : orbitEffectSize,
              height: effect.kind === 'waveBurst' ? `${34 + progress * 170}px` : effect.kind === 'coreHeal' ? `${60 + progress * 58}px` : orbitEffectSize,
              borderColor: color,
              borderStyle: effect.kind === 'orbitSlash' ? 'dashed' : 'solid',
              opacity: effect.kind === 'orbitSlash' ? 0.48 : Math.max(0, 1 - progress),
              boxShadow: lowDensity ? undefined : effect.kind === 'orbitSlash' ? `0 0 16px ${color}` : `0 0 24px ${color}`,
              transform: `translate(-50%, -50%) rotate(${age * 0.42}deg)`,
            }}
          >
            {effect.kind === 'orbitSlash' && (
              <div className="absolute left-1/2 top-[-4px] h-2 w-8 -translate-x-1/2 rounded-full bg-pink shadow-[0_0_14px_rgba(255,92,232,0.72)]" />
            )}
          </div>
        );
      })}

      {renderedHpFloats.map((item) => {
        const age = Date.now() - item.bornAt;
        return (
          <div
            key={item.id}
            className="pointer-events-none absolute z-50 -translate-x-1/2 font-vt text-xl text-danger drop-shadow-[0_0_12px_rgba(255,61,110,0.9)]"
            style={{
              left: `${item.x}%`,
              top: `${item.y - age * 0.018}%`,
              opacity: Math.max(0, 1 - age / 900),
            }}
          >
            -{item.value} HP
          </div>
        );
      })}

      {renderedDamageFloats.map((item) => {
        const age = Date.now() - item.bornAt;
        return (
          <div
            key={item.id}
            className="pointer-events-none absolute z-50 -translate-x-1/2 font-vt text-sm drop-shadow-[0_0_10px_rgba(255,209,102,0.65)]"
            style={{
              left: `${item.x}%`,
              top: `${item.y - age * 0.014}%`,
              color: item.crit ? '#ffd166' : '#bffcff',
              opacity: Math.max(0, 1 - age / 720),
              transform: `translate(-50%, 0) scale(${item.crit ? 1.18 : 1})`,
            }}
          >
            {item.crit ? 'CRIT ' : ''}{fmt(item.value)}
          </div>
        );
      })}

      <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-40 flex items-end justify-between gap-3 sm:bottom-3 sm:left-3 sm:right-3">
        <div>
          <div className="font-vt text-3xl leading-none text-pink drop-shadow-[0_0_18px_rgba(255,92,232,0.65)] sm:text-4xl">
            x{combo.toFixed(combo >= 10 ? 0 : 1)}
          </div>
          <div className="font-space text-[9px] uppercase tracking-widest text-white/60">
            {comboLabel}
          </div>
        </div>
        <div className="text-right font-space text-[9px] uppercase tracking-widest text-white/45">
          <div>{t('combat.wave')} {waveRef.current}</div>
          <div>{t('combat.orbitDamage')} {fmt(Math.max(1, Math.floor(perTap * 0.48)))}</div>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1.5 pb-[env(safe-area-inset-bottom)] sm:bottom-4 sm:gap-2 sm:pb-0">
        {COMBAT_ABILITIES.map((ability) => {
          const now = Date.now();
          const readyAt = abilityCooldowns?.[ability.id] ?? 0;
          const cooling = readyAt > now;
          const enoughMana = (playerMana ?? 0) >= ability.manaCost;
          const disabled = cooling || !enoughMana;
          const cooldownPct = cooling ? Math.max(0, Math.min(100, ((readyAt - now) / ability.cooldownMs) * 100)) : 0;
          return (
            <button
              key={ability.id}
              disabled={disabled}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                activateAbility(ability.id);
              }}
              className="relative h-9 w-9 overflow-hidden rounded-md border bg-black/75 font-vt text-base transition active:scale-95 disabled:opacity-45 sm:h-11 sm:w-11 sm:text-lg"
              style={{
                borderColor: enoughMana ? 'rgba(92,246,255,0.55)' : 'rgba(255,255,255,0.16)',
                color: ability.id === 'coreHeal' ? '#5cf6ff' : ability.id === 'orbitSlash' ? '#ff5ce8' : '#ffd166',
                boxShadow: !disabled ? '0 0 16px rgba(92,246,255,0.22)' : undefined,
              }}
              aria-label={t(`combat.abilities.${ability.key}.name` as any)}
              title={`${t(`combat.abilities.${ability.key}.name` as any)} · ${ability.manaCost} ${t('combat.mana')}`}
            >
              {ability.id === 'waveBurst' ? '≋' : ability.id === 'orbitSlash' ? '◌' : '+'}
              {cooling && (
                <span
                  className="absolute inset-x-0 bottom-0 bg-white/20"
                  style={{ height: `${cooldownPct}%` }}
                />
              )}
              <span className="absolute bottom-0.5 right-1 font-space text-[7px] text-white/60">
                {ability.manaCost}
              </span>
            </button>
          );
        })}
      </div>

      {comboFlash && (
        <motion.div
          key={comboFlash}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="pointer-events-none absolute left-1/2 top-[45%] z-50 -translate-x-1/2 font-major text-xl text-gold drop-shadow-[0_0_18px_rgba(255,209,102,0.8)]"
        >
          {comboFlash}
        </motion.div>
      )}

      {collapseActive && !collapseOverlayActive && (
        <div className="pointer-events-none absolute left-1/2 top-[58%] z-[55] -translate-x-1/2 rounded-full border border-cyan/35 bg-black/55 px-4 py-2 text-center font-space text-[9px] uppercase tracking-[0.22em] text-cyan shadow-[0_0_18px_rgba(92,246,255,0.22)]">
          <div>{t('combat.recovering')}</div>
          <div className="mt-1 text-white/55">{t('combat.invulnerable')}</div>
        </div>
      )}

      {collapseOverlayActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-[1px]"
        >
          <div className="text-center">
            <div className="font-major text-3xl text-danger drop-shadow-[0_0_24px_rgba(255,61,110,0.9)]">
              {t('combat.coreCollapsed')}
            </div>
            <div className="mt-2 font-space text-[10px] uppercase tracking-[0.28em] text-cyan/80">
              {t('combat.recovering')}
            </div>
            <div className="mt-2 font-space text-[9px] uppercase tracking-[0.22em] text-white/60">
              {t('combat.invulnerable')}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
