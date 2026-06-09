'use client';

import { useEffect } from 'react';
import { useGame, selectBuildBonuses } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { BALANCE } from '@/lib/config/balance';
import { systemUnlocked } from '@/lib/config/systemUnlocks';

export function useGameLoop() {
  const tick = useGame((s) => s.tickAuto);
  const triggerEvent = useGame((s) => s.triggerEvent);
  const has = useGame((s) => s.hasStarted);
  const levelIdx = useGame((s) => s.levelIdx);
  const tree = useGame((s) => s.tree);
  const boss = useGame((s) => s.boss);
  const completedChapters = useGame((s) => s.completedChapters);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const shards = useGame((s) => s.shards);
  const buildBonuses = useGame(selectBuildBonuses);
  const spawnRandomBulb = useGame((s) => s.spawnRandomBulb);
  const scheduleNextKnowledgeBulb = useGame((s) => s.scheduleNextKnowledgeBulb);
  const nextKnowledgeBulbAt = useGame((s) => s.nextKnowledgeBulbAt);
  const currentBulb = useGame((s) => s.currentBulb);
  const claimOfflineProgress = useGame((s) => s.claimOfflineProgress);
  const refreshResearchProgress = useGame((s) => s.refreshResearchProgress);
  const addPlayTime = useGame((s) => s.addPlayTime);

  useEffect(() => {
    if (!has) return;
    claimOfflineProgress();
    refreshResearchProgress();
  }, [has, claimOfflineProgress, refreshResearchProgress]);

  // tick loop
  useEffect(() => {
    if (!has) return;
    let last = performance.now();
    let raf = 0;
    // Accumulate frame deltas and only run the store-touching tick ~20×/s instead
    // of every rAF frame (~60×/s). Passive income and auto-damage are linear in dt
    // (gain = ps * dt / 1000), so a single tick(acc) over the accumulated window
    // produces the exact same totals — only the computation (and its per-call
    // allocations: 3x full-state spreads, filtered arrays, the set() object) runs
    // a third as often, cutting the GC churn that caused the stutter spikes.
    const TICK_INTERVAL_MS = 50;
    let acc = 0;
    const step = (now: number) => {
      // Clamp dt so returning from a backgrounded tab (where rAF is paused)
      // doesn't deliver one huge frame that spikes a full tick of progress.
      // Offline gains are handled separately by claimOfflineProgress().
      const dt = Math.min(now - last, 100);
      last = now;
      acc += dt;
      if (acc >= TICK_INTERVAL_MS) {
        tick(acc);
        refreshResearchProgress();
        addPlayTime(acc);
        acc = 0;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [has, tick, addPlayTime, refreshResearchProgress]);

  // event scheduler
  useEffect(() => {
    if (!has) return;
    if (!systemUnlocked('anomalies', { bossTier: boss.tier, completedChapters, totalPrestiges, shards })) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const magnet = tree['eventMagnet'];
      const min = magnet ? BALANCE.events.magnetIntervalMin : BALANCE.events.baseIntervalMin;
      const max = magnet ? BALANCE.events.magnetIntervalMax : BALANCE.events.baseIntervalMax;
      const frequencyMult = Math.max(0.55, 1 - buildBonuses.anomalyFrequencyPct);
      const wait = (min + Math.random() * (max - min)) * frequencyMult;
      timer = setTimeout(() => {
        triggerEvent();
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [has, tree, triggerEvent, buildBonuses.anomalyFrequencyPct, boss.tier, completedChapters, totalPrestiges, shards]);

  // knowledge bulbs use a persisted randomized 5-10 minute schedule.
  useEffect(() => {
    if (!has) return;
    if (currentBulb) return;
    if (!nextKnowledgeBulbAt) {
      scheduleNextKnowledgeBulb();
      return;
    }
    const wait = Math.max(0, nextKnowledgeBulbAt - Date.now());
    const timer = setTimeout(() => {
      spawnRandomBulb();
    }, wait);
    return () => clearTimeout(timer);
  }, [has, currentBulb, nextKnowledgeBulbAt, scheduleNextKnowledgeBulb, spawnRandomBulb]);

  // sync audio with level
  useEffect(() => {
    if (!has) return;
    audio.setLevel(levelIdx);
  }, [has, levelIdx]);
}
