'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame, selectCombatStats, selectPerTap } from '@/lib/store';
import { currentChapter } from '@/lib/config/chapters';
import { COMBAT, COMBAT_ABILITIES, CombatAbilityId, combatStyleForChapter } from '@/lib/config/combat';
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

let enemyId = 1;
let particleId = 1;
let pulseId = 1;
let hpFloatId = 1;
let abilityEffectId = 1;

export function CombatArena() {
  const t = useTranslations();
  const boss = useGame((s) => s.boss);
  const combo = useGame((s) => s.combo);
  const levelIdx = useGame((s) => s.levelIdx);
  const completedChapters = useGame((s) => s.completedChapters);
  const perTap = useGame(selectPerTap);
  const combatStats = useGame(selectCombatStats);
  const playerHp = useGame((s) => s.playerHp);
  const playerMana = useGame((s) => s.playerMana);
  const abilityCooldowns = useGame((s) => s.combatAbilityCooldowns);
  const tap = useGame((s) => s.tapDamacana);
  const applyCombatDamage = useGame((s) => s.applyCombatDamage);
  const healCombatHp = useGame((s) => s.healCombatHp);
  const restoreCombatMana = useGame((s) => s.restoreCombatMana);
  const regenCombatResources = useGame((s) => s.regenCombatResources);
  const spendCombatAbility = useGame((s) => s.spendCombatAbility);
  const sfxEnabled = useGame((s) => !s.audio.muted);

  const chapter = currentChapter(completedChapters);
  const style = useMemo(() => combatStyleForChapter(chapter), [chapter]);
  const finalBoss = boss.tier === chapter.finalBossTier;
  const mega = isMegaBoss(boss.tier);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef(new Set<string>());
  const dragRef = useRef(false);
  const targetRef = useRef<Vec>({ x: 50, y: 70 });
  const playerRef = useRef({ x: 50, y: 70, hitUntil: 0, healUntil: 0 });
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const abilityEffectsRef = useRef<AbilityEffect[]>([]);
  const lastSpawnRef = useRef(0);
  const waveRef = useRef(1);
  const lastOrbitRef = useRef(0);
  const lastBossPulseRef = useRef(0);
  const lastGlobalContactRef = useRef(0);
  const lastResourceRegenRef = useRef(0);
  const lastOrbitSlashDamageRef = useRef(0);
  const invulnerableUntilRef = useRef(0);
  const nextBossWeakAtRef = useRef(Date.now() + 5000);

  const [player, setPlayer] = useState(playerRef.current);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [abilityEffects, setAbilityEffects] = useState<AbilityEffect[]>([]);
  const [bossWeakUntil, setBossWeakUntil] = useState(0);
  const [comboFlash, setComboFlash] = useState<string | null>(null);
  const [hpFloats, setHpFloats] = useState<HpFloat[]>([]);
  const [collapseUntil, setCollapseUntil] = useState(0);
  const [entrance, setEntrance] = useState(0);

  const perTapRef = useRef(perTap);
  const comboRef = useRef(combo);
  const styleRef = useRef(style);
  const sfxRef = useRef(sfxEnabled);
  const tapRef = useRef(tap);
  const bossRef = useRef(boss);
  const chapterRef = useRef(chapter);
  const combatStatsRef = useRef(combatStats);
  const applyCombatDamageRef = useRef(applyCombatDamage);
  const healCombatHpRef = useRef(healCombatHp);
  const restoreCombatManaRef = useRef(restoreCombatMana);
  const regenCombatResourcesRef = useRef(regenCombatResources);
  const spendCombatAbilityRef = useRef(spendCombatAbility);

  useEffect(() => { perTapRef.current = perTap; }, [perTap]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { styleRef.current = style; }, [style]);
  useEffect(() => { sfxRef.current = sfxEnabled; }, [sfxEnabled]);
  useEffect(() => { tapRef.current = tap; }, [tap]);
  useEffect(() => { bossRef.current = boss; }, [boss]);
  useEffect(() => { chapterRef.current = chapter; }, [chapter]);
  useEffect(() => { combatStatsRef.current = combatStats; }, [combatStats]);
  useEffect(() => { applyCombatDamageRef.current = applyCombatDamage; }, [applyCombatDamage]);
  useEffect(() => { healCombatHpRef.current = healCombatHp; }, [healCombatHp]);
  useEffect(() => { restoreCombatManaRef.current = restoreCombatMana; }, [restoreCombatMana]);
  useEffect(() => { regenCombatResourcesRef.current = regenCombatResources; }, [regenCombatResources]);
  useEffect(() => { spendCombatAbilityRef.current = spendCombatAbility; }, [spendCombatAbility]);

  useEffect(() => {
    setEntrance((v) => v + 1);
  }, [boss.tier]);

  const emitParticles = useCallback((x: number, y: number, color: string, count: number, power = 1) => {
    const burst: Particle[] = Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.08 + Math.random() * 0.22) * power;
      return {
        id: particleId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 460 + Math.random() * 360,
        maxLife: 820,
        color,
        size: 2 + Math.random() * 4,
      };
    });
    particlesRef.current = [...particlesRef.current.slice(-42), ...burst];
    setParticles(particlesRef.current);
  }, []);

  const pushHpFloat = useCallback((value: number, x: number, y: number) => {
    const id = hpFloatId++;
    setHpFloats((items) => [
      ...items.slice(-5),
      { id, value, x, y, bornAt: Date.now() },
    ]);
    setTimeout(() => {
      setHpFloats((items) => items.filter((item) => item.id !== id));
    }, 1000);
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
      invulnerableUntilRef.current = now + COMBAT.collapseRecoveryMs;
      setCollapseUntil(invulnerableUntilRef.current);
      healCombatHpRef.current(combatStatsRef.current.maxHp);
      playerRef.current = { ...p, hitUntil: invulnerableUntilRef.current, healUntil: invulnerableUntilRef.current };
      targetRef.current = { x: 50, y: 70 };
      pulsesRef.current = [];
      setPulses([]);
      setPlayer(playerRef.current);
      useGame.setState({ shake: { intensity: 'hard', at: now } });
      useGame.setState((state) => ({ boss: healedBoss, combo: 0, lastTapAt: 0 }));
      emitParticles(p.x, p.y, '#ff3d6e', 28, 1.8);
    }
  }, [emitParticles, pushHpFloat]);

  const spawnWave = useCallback((now: number) => {
    const activeChapter = chapterRef.current;
    const activeStyle = styleRef.current;
    const targetCount = Math.min(7, 2 + activeChapter.order + Math.floor(waveRef.current / 3));
    const needed = Math.max(1, targetCount - enemiesRef.current.length);
    const count = Math.min(needed, 2 + Math.floor(Math.random() * 2));
    const nextEnemies = [...enemiesRef.current];
    for (let i = 0; i < count; i++) {
      const start = edgeSpawn();
      const maxHp = Math.max(8, Math.floor(perTapRef.current * (2.8 + activeChapter.order * 1.1) + bossRef.current.tier * 1.6));
      nextEnemies.push({
        id: enemyId++,
        x: start.x,
        y: start.y,
        hp: maxHp,
        maxHp,
        size: 7.5 + activeChapter.order * 0.8 + Math.random() * 2,
        speed: (5.2 + activeChapter.order * 0.72) * activeStyle.speedMult,
        weakUntil: 0,
        nextWeakAt: now + 2800 + Math.random() * 5200,
        lastContactAt: 0,
        hitUntil: 0,
      });
    }
    waveRef.current += 1;
    enemiesRef.current = nextEnemies;
    setEnemies(nextEnemies);
  }, []);

  const strikeEnemy = useCallback((id: number, e: PointerEvent) => {
    e.stopPropagation();
    const point = pointFromEvent(e);
    const now = Date.now();
    const activeStyle = styleRef.current;
    let critical = false;
    let killed = false;
    const damageBase = perTapRef.current * (1 + Math.min(comboRef.current, 25) * 0.16);
    const next = enemiesRef.current.map((enemy) => {
      if (enemy.id !== id) return enemy;
      critical = now <= enemy.weakUntil;
      const damage = Math.floor(damageBase * (critical ? 3.1 : 1));
      const hp = enemy.hp - damage;
      killed = hp <= 0;
      return {
        ...enemy,
        hp,
        weakUntil: critical ? 0 : enemy.weakUntil,
        hitUntil: now + 130,
        nextWeakAt: critical ? now + 6500 + Math.random() * 4500 : enemy.nextWeakAt,
      };
    }).filter((enemy) => enemy.hp > 0);

    enemiesRef.current = next;
    setEnemies(next);
    emitParticles(point.x, point.y, critical ? activeStyle.weak : activeStyle.enemy, critical ? 20 : 10, critical ? 1.6 : 1);
    tapRef.current(e.clientX, e.clientY, {
      damageMult: critical ? 2.6 : 1,
      rewardMult: critical ? 1.35 : 1 + Math.min(comboRef.current, 20) * 0.012,
      comboBoost: critical ? 4 : 1,
      forceCrit: critical,
    });
    restoreCombatManaRef.current(critical ? COMBAT.weakManaOnHit : COMBAT.comboManaOnHit);
    if (sfxRef.current) {
      if (critical) audio.sfxCriticalRupture();
      else audio.sfxCombatHit(comboRef.current);
    }
    if (critical || comboRef.current >= 10 || killed) {
      useGame.setState({ shake: { intensity: critical || killed ? 'medium' : 'small', at: now } });
    }
    if (critical) setComboFlash(t('combat.criticalRupture'));
    else if (comboRef.current >= 15) setComboFlash(t('combat.cosmicChain'));
    else if (comboRef.current >= 5) setComboFlash('x5');
    else if (comboRef.current >= 2) setComboFlash('x2');
  }, [emitParticles, pointFromEvent, t]);

  const strikeBoss = useCallback((e: PointerEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const point = pointFromEvent(e);
    const critical = now <= bossWeakUntil;
    emitParticles(point.x, point.y, critical ? styleRef.current.weak : chapterRef.current.accent, critical ? 28 : 14, critical ? 2 : 1.2);
    tapRef.current(e.clientX, e.clientY, {
      damageMult: critical ? 3.4 : finalBoss ? 1.35 : 1.15,
      rewardMult: critical ? 1.45 : 1.06,
      comboBoost: critical ? 5 : 1.2,
      forceCrit: critical,
    });
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
    } else if (sfxRef.current) {
      audio.sfxCombatHit(comboRef.current);
    }
  }, [bossWeakUntil, emitParticles, finalBoss, pointFromEvent, t]);

  const damageEnemiesInRadius = useCallback((center: Vec, radius: number, damage: number, color: string) => {
    let hitCount = 0;
    enemiesRef.current = enemiesRef.current
      .map((enemy) => {
        if (dist(enemy, center) > radius) return enemy;
        hitCount += 1;
        return { ...enemy, hp: enemy.hp - damage, hitUntil: Date.now() + 180 };
      })
      .filter((enemy) => enemy.hp > 0);
    setEnemies(enemiesRef.current);
    if (hitCount > 0) {
      emitParticles(center.x, center.y, color, Math.min(28, 8 + hitCount * 5), 1.6);
      useGame.setState({ shake: { intensity: hitCount >= 3 ? 'medium' : 'small', at: Date.now() } });
    }
  }, [emitParticles]);

  const addAbilityEffect = useCallback((kind: CombatAbilityId, x: number, y: number, durationMs: number) => {
    const now = Date.now();
    abilityEffectsRef.current = [
      ...abilityEffectsRef.current.slice(-4),
      { id: abilityEffectId++, kind, x, y, bornAt: now, until: now + durationMs },
    ];
    setAbilityEffects(abilityEffectsRef.current);
  }, []);

  const activateAbility = useCallback((id: CombatAbilityId) => {
    const ability = COMBAT_ABILITIES.find((item) => item.id === id);
    if (!ability || !spendCombatAbilityRef.current(id)) return;
    const now = Date.now();
    const center = { x: playerRef.current.x, y: playerRef.current.y };
    if (id === 'waveBurst') {
      const damage = Math.max(1, Math.floor(perTapRef.current * (ability.damageMult ?? 1)));
      damageEnemiesInRadius(center, ability.radius, damage, '#5cf6ff');
      tapRef.current(undefined, undefined, { damageMult: 0.7, rewardMult: 0.35, passive: true, silent: true });
      addAbilityEffect(id, center.x, center.y, 620);
      if (sfxRef.current) audio.sfxAbility();
    } else if (id === 'orbitSlash') {
      addAbilityEffect(id, center.x, center.y, ability.durationMs ?? 4000);
      if (sfxRef.current) audio.sfxAbility();
    } else if (id === 'coreHeal') {
      healCombatHpRef.current(combatStatsRef.current.maxHp * (ability.healPct ?? 0.3));
      playerRef.current = { ...playerRef.current, healUntil: now + 850 };
      setPlayer(playerRef.current);
      emitParticles(center.x, center.y, '#5cf6ff', 24, 1.4);
      addAbilityEffect(id, center.x, center.y, 900);
      if (sfxRef.current) audio.sfxTreeUnlock();
    }
  }, [addAbilityEffect, damageEnemiesInRadius, emitParticles]);

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
      if (now - lastResourceRegenRef.current > 250) {
        const elapsed = lastResourceRegenRef.current === 0 ? 250 : now - lastResourceRegenRef.current;
        lastResourceRegenRef.current = now;
        regenCombatResourcesRef.current(elapsed);
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
      const activeChapter = chapterRef.current;
      const updatedEnemies = enemiesRef.current.map((enemy) => {
        let nextWeakAt = enemy.nextWeakAt;
        let weakUntil = enemy.weakUntil;
        if (now >= nextWeakAt) {
          weakUntil = now + COMBAT.weakPointDurationMs;
          nextWeakAt = now + 6900 + Math.random() * 6200;
        }
        const toPlayer = { x: p.x - enemy.x, y: p.y - enemy.y };
        const length = Math.hypot(toPlayer.x, toPlayer.y) || 1;
        const wobble = activeChapter.id === 'saturn' ? Math.sin((now + enemy.id * 311) / 520) * 0.75 : 0;
        const step = enemy.speed * activeStyle.aggression * (dt / 1000);
        const x = clamp(enemy.x + (toPlayer.x / length) * step + wobble * (dt / 1000), 4, 96);
        const y = clamp(enemy.y + (toPlayer.y / length) * step, 8, 96);
        let lastContactAt = enemy.lastContactAt;
        let hitUntil = enemy.hitUntil;
        if (
          dist({ x, y }, p) < COMBAT.playerContactRadius &&
          now - lastContactAt > COMBAT.contactCooldownMs &&
          now - lastGlobalContactRef.current > COMBAT.globalContactCooldownMs
        ) {
          lastContactAt = now;
          lastGlobalContactRef.current = now;
          hitUntil = now + 180;
          damagePlayer(COMBAT.contactDamage);
        }
        return { ...enemy, x, y, weakUntil, nextWeakAt, lastContactAt, hitUntil };
      });
      enemiesRef.current = updatedEnemies;

      if (now - lastSpawnRef.current > COMBAT.enemySpawnDelayMs || updatedEnemies.length === 0) {
        lastSpawnRef.current = now;
        spawnWave(now);
      }

      if (now - lastOrbitRef.current > COMBAT.passiveOrbitMs) {
        lastOrbitRef.current = now;
        const target = enemiesRef.current
          .map((enemy) => ({ enemy, d: dist(enemy, p) }))
          .filter((item) => item.d < 30)
          .sort((a, b) => a.d - b.d)[0]?.enemy;
        if (target) {
          const damage = Math.max(1, Math.floor(perTapRef.current * 0.48));
          enemiesRef.current = enemiesRef.current
            .map((enemy) => enemy.id === target.id ? { ...enemy, hp: enemy.hp - damage, hitUntil: now + 90 } : enemy)
            .filter((enemy) => enemy.hp > 0);
          emitParticles(target.x, target.y, activeStyle.enemy, 5, 0.7);
        }
        tapRef.current(undefined, undefined, { damageMult: 0.12, rewardMult: 0.18, passive: true, silent: true });
      }

      const activeOrbit = abilityEffectsRef.current.find((effect) => effect.kind === 'orbitSlash' && now < effect.until);
      if (activeOrbit && now - lastOrbitSlashDamageRef.current > 220) {
        lastOrbitSlashDamageRef.current = now;
        const damage = Math.max(1, Math.floor(perTapRef.current * 0.28));
        const radius = COMBAT_ABILITIES.find((ability) => ability.id === 'orbitSlash')?.radius ?? 28;
        enemiesRef.current = enemiesRef.current
          .map((enemy) => dist(enemy, p) <= radius ? { ...enemy, hp: enemy.hp - damage, hitUntil: now + 90 } : enemy)
          .filter((enemy) => enemy.hp > 0);
        emitParticles(p.x, p.y, '#ff5ce8', 5, 0.75);
        tapRef.current(undefined, undefined, { damageMult: 0.08, rewardMult: 0.12, passive: true, silent: true });
      }

      if (now - lastBossPulseRef.current > 3100) {
        lastBossPulseRef.current = now;
        const fireAt = now + COMBAT.bossPulseWarningMs;
        pulsesRef.current = [...pulsesRef.current, { id: pulseId++, bornAt: now, fireAt, hit: false, canceled: false }];
        setBossWeakUntil((current) => Math.max(current, fireAt));
      }
      pulsesRef.current = pulsesRef.current
        .map((pulse) => {
          if (pulse.canceled || now < pulse.fireAt) return pulse;
          const radius = (now - pulse.fireAt) * COMBAT.bossPulseSpeed;
          const distance = dist({ x: 50, y: 24 }, p);
          if (!pulse.hit && Math.abs(distance - radius) < COMBAT.bossPulseDamageBand) {
            damagePlayer(COMBAT.bossPulseDamage);
            return { ...pulse, hit: true };
          }
          return pulse;
        })
        .filter((pulse) => now - pulse.bornAt < 3600);

      if (now >= nextBossWeakAtRef.current) {
        setBossWeakUntil(now + COMBAT.weakPointDurationMs);
        nextBossWeakAtRef.current = now + COMBAT.bossWeakMinMs + Math.random() * (COMBAT.bossWeakMaxMs - COMBAT.bossWeakMinMs);
      }

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * dt,
          y: particle.y + particle.vy * dt,
          life: particle.life - dt,
        }))
        .filter((particle) => particle.life > 0);

      abilityEffectsRef.current = abilityEffectsRef.current
        .map((effect) => effect.kind === 'orbitSlash' ? { ...effect, x: p.x, y: p.y } : effect)
        .filter((effect) => effect.until > now);

      playerRef.current = p;
      setPlayer(p);
      setEnemies(enemiesRef.current);
      setPulses(pulsesRef.current);
      setParticles(particlesRef.current);
      setAbilityEffects(abilityEffectsRef.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [damagePlayer, emitParticles, spawnWave]);

  useEffect(() => {
    if (!comboFlash) return;
    const id = setTimeout(() => setComboFlash(null), 720);
    return () => clearTimeout(id);
  }, [comboFlash]);

  const comboLabel = combo >= 15 ? t('combat.cosmicChain') : combo >= 5 ? 'x5' : combo >= 2 ? 'x2' : t('combat.chainReady');
  const bossHpPct = Math.max(0, Math.min(100, (boss.hpCur / boss.hpMax) * 100));
  const playerHpPct = (Math.min(playerHp ?? combatStats.maxHp, combatStats.maxHp) / combatStats.maxHp) * 100;
  const playerManaPct = (Math.min(playerMana ?? 0, combatStats.maxMana) / combatStats.maxMana) * 100;
  const playerHit = Date.now() <= player.hitUntil;
  const collapseActive = Date.now() <= collapseUntil;

  return (
    <div
      ref={arenaRef}
      tabIndex={0}
      onPointerDown={(e) => {
        dragRef.current = true;
        targetRef.current = pointFromEvent(e);
      }}
      onPointerMove={(e) => {
        if (!dragRef.current) return;
        targetRef.current = pointFromEvent(e);
      }}
      onPointerUp={() => { dragRef.current = false; }}
      onPointerCancel={() => { dragRef.current = false; }}
      className="relative mx-3 mt-2 min-h-[390px] flex-1 overflow-hidden rounded-lg border border-cyan/25 bg-black/35 shadow-[0_0_34px_rgba(92,246,255,0.12)] outline-none"
      style={{ touchAction: 'none', background: `radial-gradient(circle at 50% 25%, ${style.arenaGlow}, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.48) 100%)` }}
      aria-label="combat arena"
    >
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute inset-x-5 top-[32%] h-px bg-cyan/20" />
        <div className="absolute inset-x-10 top-[62%] h-px bg-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
      </div>

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[9px] font-space uppercase tracking-widest text-white/60">
              <span>{finalBoss ? t('combat.chapterBoss') : t('combat.boss')}</span>
              <span className="text-white/70">T{boss.tier}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full transition-[width]"
                style={{ width: `${bossHpPct}%`, background: finalBoss ? chapter.accent : '#ff3d6e', boxShadow: `0 0 16px ${finalBoss ? chapter.glow : 'rgba(255,61,110,0.6)'}` }}
              />
            </div>
          </div>
          <div className="w-24">
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

      <motion.button
        key={entrance}
        initial={{ scale: 0.78, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.96 }}
        onPointerDown={strikeBoss}
        className="absolute left-1/2 top-[22%] z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55"
        style={{
          width: finalBoss || mega ? 128 : 104,
          height: finalBoss || mega ? 128 : 104,
          borderColor: finalBoss ? chapter.accent : mega ? '#ffd166' : '#ff3d6e',
          color: finalBoss ? chapter.accent : '#ff3d6e',
          boxShadow: `0 0 ${finalBoss ? 52 : 34}px ${finalBoss ? chapter.glow : 'rgba(255,61,110,0.42)'}`,
        }}
        aria-label="boss entity"
      >
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute h-[72%] w-[72%] rounded-full border border-current/40 animate-spinslow" />
        {Date.now() <= bossWeakUntil && (
          <div className="absolute h-7 w-7 rounded-full border-2 border-gold bg-gold/20 shadow-[0_0_18px_rgba(255,209,102,0.9)]" />
        )}
        <div className="font-vt text-4xl">{chapter.planetGlyph}</div>
      </motion.button>

      {pulses.map((pulse) => {
        const now = Date.now();
        const warning = now < pulse.fireAt;
        const age = warning ? now - pulse.bornAt : now - pulse.fireAt;
        const radius = warning ? 11 + (age / COMBAT.bossPulseWarningMs) * 7 : age * COMBAT.bossPulseSpeed;
        const opacity = pulse.canceled ? 0.18 : warning ? 0.85 : Math.max(0, 1 - age / 2400);
        return (
          <div
            key={pulse.id}
            className="pointer-events-none absolute left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${radius * 2}%`,
              aspectRatio: '1 / 1',
              opacity,
              borderColor: pulse.canceled ? 'rgba(92,246,255,0.5)' : warning ? 'rgba(255,209,102,0.9)' : 'rgba(255,61,110,0.55)',
              borderStyle: warning ? 'dashed' : 'solid',
              boxShadow: pulse.canceled ? '0 0 18px rgba(92,246,255,0.28)' : warning ? '0 0 24px rgba(255,209,102,0.42)' : '0 0 20px rgba(255,61,110,0.32)',
            }}
          />
        );
      })}

      {enemies.map((enemy) => {
        const weak = Date.now() <= enemy.weakUntil;
        const hit = Date.now() <= enemy.hitUntil;
        return (
          <button
            key={enemy.id}
            onPointerDown={(e) => strikeEnemy(enemy.id, e)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-black/70"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              width: `${enemy.size * 2}px`,
              height: `${enemy.size * 2}px`,
              borderColor: weak ? style.weak : style.enemy,
              boxShadow: `0 0 ${hit ? 26 : 16}px ${weak ? style.weak : style.enemyGlow}`,
              transform: `translate(-50%, -50%) scale(${hit ? 1.16 : 1})`,
            }}
            aria-label="enemy"
          >
            <span className="absolute inset-[22%] rounded-full bg-current opacity-45" style={{ color: weak ? style.weak : style.enemy }} />
            {weak && <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_14px_rgba(255,209,102,0.95)]" />}
            <span className="absolute -bottom-2 left-1/2 h-1 w-9 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full" style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`, background: weak ? style.weak : style.enemy }} />
            </span>
          </button>
        );
      })}

      <div
        className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          left: `${player.x}%`,
          top: `${player.y}%`,
          width: 54,
          height: 54,
          borderColor: playerHit ? '#ff3d6e' : collapseActive ? '#5cf6ff' : chapter.accent,
          background: playerHit ? 'rgba(255,61,110,0.28)' : collapseActive ? 'rgba(92,246,255,0.18)' : 'rgba(92,246,255,0.08)',
          boxShadow: playerHit
            ? '0 0 36px rgba(255,61,110,0.9), 0 0 70px rgba(255,61,110,0.24)'
            : `0 0 ${combo >= 10 ? 36 : 22}px ${combo >= 10 ? 'rgba(255,92,232,0.72)' : chapter.glow}`,
        }}
      >
        {playerHit && (
          <div className="absolute -inset-5 rounded-full border border-danger/55 bg-danger/10 shadow-[0_0_26px_rgba(255,61,110,0.45)]" />
        )}
        {collapseActive && (
          <div className="absolute -inset-7 rounded-full border border-cyan/50 shadow-[0_0_30px_rgba(92,246,255,0.42)]" />
        )}
        <div className="absolute inset-2 rounded-full bg-cyan/20 blur-[1px]" />
        <div className="absolute left-1/2 top-[-10px] h-3 w-3 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_14px_rgba(92,246,255,0.9)]" />
        <div
          className="absolute left-1/2 top-1/2 h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/35 animate-spinslow"
          style={{ boxShadow: combo >= 5 ? '0 0 18px rgba(255,92,232,0.35)' : undefined }}
        />
      </div>

      {particles.map((particle) => (
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
            boxShadow: `0 0 12px ${particle.color}`,
          }}
        />
      ))}

      {abilityEffects.map((effect) => {
        const age = Date.now() - effect.bornAt;
        const duration = Math.max(1, effect.until - effect.bornAt);
        const progress = Math.min(1, age / duration);
        const color = effect.kind === 'coreHeal' ? '#5cf6ff' : effect.kind === 'orbitSlash' ? '#ff5ce8' : '#5cf6ff';
        return (
          <div
            key={effect.id}
            className="pointer-events-none absolute z-[35] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              width: effect.kind === 'waveBurst' ? `${36 + progress * 190}px` : effect.kind === 'coreHeal' ? `${70 + progress * 70}px` : 126,
              height: effect.kind === 'waveBurst' ? `${36 + progress * 190}px` : effect.kind === 'coreHeal' ? `${70 + progress * 70}px` : 126,
              borderColor: color,
              opacity: effect.kind === 'orbitSlash' ? 0.75 : Math.max(0, 1 - progress),
              boxShadow: `0 0 26px ${color}`,
              transform: `translate(-50%, -50%) rotate(${age * 0.42}deg)`,
            }}
          >
            {effect.kind === 'orbitSlash' && (
              <div className="absolute left-1/2 top-[-5px] h-3 w-10 -translate-x-1/2 rounded-full bg-pink shadow-[0_0_18px_rgba(255,92,232,0.9)]" />
            )}
          </div>
        );
      })}

      {hpFloats.map((item) => {
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

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-40 flex items-end justify-between gap-3">
        <div>
          <div className="font-vt text-4xl leading-none text-pink drop-shadow-[0_0_18px_rgba(255,92,232,0.65)]">
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

      <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2">
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
              className="relative h-11 w-11 overflow-hidden rounded-md border bg-black/75 font-vt text-lg transition active:scale-95 disabled:opacity-45"
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

      {collapseActive && (
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
          </div>
        </motion.div>
      )}
    </div>
  );
}
