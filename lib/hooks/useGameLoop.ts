'use client';

import { useEffect } from 'react';
import { useGame, selectBuildBonuses } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { BALANCE } from '@/lib/config/balance';

export function useGameLoop() {
  const tick = useGame((s) => s.tickAuto);
  const triggerEvent = useGame((s) => s.triggerEvent);
  const has = useGame((s) => s.hasStarted);
  const levelIdx = useGame((s) => s.levelIdx);
  const tree = useGame((s) => s.tree);
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
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      tick(dt);
      refreshResearchProgress();
      addPlayTime(dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [has, tick, addPlayTime, refreshResearchProgress]);

  // event scheduler
  useEffect(() => {
    if (!has) return;
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
  }, [has, tree, triggerEvent, buildBonuses.anomalyFrequencyPct]);

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
