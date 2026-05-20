'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { BALANCE } from '@/lib/config/balance';

export function useGameLoop() {
  const tick = useGame((s) => s.tickAuto);
  const triggerEvent = useGame((s) => s.triggerEvent);
  const has = useGame((s) => s.hasStarted);
  const levelIdx = useGame((s) => s.levelIdx);
  const tree = useGame((s) => s.tree);
  const showEvolution = useGame((s) => s.showEvolution);
  const spawnBulbForLevel = useGame((s) => s.spawnBulbForLevel);
  const spawnRandomBulb = useGame((s) => s.spawnRandomBulb);
  const addPlayTime = useGame((s) => s.addPlayTime);
  const prevEvo = useRef<boolean>(false);

  // tick loop
  useEffect(() => {
    if (!has) return;
    let last = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      tick(dt);
      addPlayTime(dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [has, tick, addPlayTime]);

  // event scheduler
  useEffect(() => {
    if (!has) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const magnet = tree['eventMagnet'];
      const min = magnet ? BALANCE.events.magnetIntervalMin : BALANCE.events.baseIntervalMin;
      const max = magnet ? BALANCE.events.magnetIntervalMax : BALANCE.events.baseIntervalMax;
      const wait = min + Math.random() * (max - min);
      timer = setTimeout(() => {
        triggerEvent();
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [has, tree, triggerEvent]);

  // guaranteed bulb 2s after evolution overlay closes
  useEffect(() => {
    if (!has) return;
    const isOpen = showEvolution !== null;
    if (prevEvo.current && !isOpen) {
      const pending = useGame.getState().pendingBulbLevel;
      if (pending !== null) {
        const id = setTimeout(() => spawnBulbForLevel(pending), 2000);
        prevEvo.current = isOpen;
        return () => clearTimeout(id);
      }
    }
    prevEvo.current = isOpen;
  }, [has, showEvolution, spawnBulbForLevel]);

  // random bonus bulb every 90-180s, 50% chance per check
  useEffect(() => {
    if (!has) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const wait = 90_000 + Math.random() * 90_000;
      timer = setTimeout(() => {
        if (Math.random() < 0.5) spawnRandomBulb();
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [has, spawnRandomBulb]);

  // sync audio with level
  useEffect(() => {
    if (!has) return;
    audio.setLevel(levelIdx);
  }, [has, levelIdx]);
}
