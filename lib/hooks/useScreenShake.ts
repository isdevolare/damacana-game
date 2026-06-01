'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';

const RANGES = { small: 4, medium: 10, hard: 22 };

export function useScreenShake() {
  const shake = useGame((s) => s.shake);
  const lowEffectsMode = useGame((s) => s.lowEffectsMode);
  const consume = useGame((s) => s.consumeShake);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mobileSafeMode, setMobileSafeMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queries = [
      window.matchMedia('(max-width: 640px)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(display-mode: standalone)'),
    ];
    const update = () => {
      const standalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setMobileSafeMode(standalone || queries.some((query) => query.matches));
    };
    update();
    queries.forEach((query) => query.addEventListener('change', update));
    return () => queries.forEach((query) => query.removeEventListener('change', update));
  }, []);

  useEffect(() => {
    if (!shake) return;
    if (lowEffectsMode || mobileSafeMode) {
      setOffset({ x: 0, y: 0 });
      consume();
      return;
    }
    const amount = RANGES[shake.intensity] * (lowEffectsMode ? 0.35 : 1);
    let frames = 0;
    const total = lowEffectsMode ? 5 : shake.intensity === 'hard' ? 22 : shake.intensity === 'medium' ? 14 : 8;
    const id = setInterval(() => {
      frames++;
      const decay = 1 - frames / total;
      if (frames >= total) {
        setOffset({ x: 0, y: 0 });
        consume();
        clearInterval(id);
        return;
      }
      setOffset({
        x: (Math.random() - 0.5) * 2 * amount * decay,
        y: (Math.random() - 0.5) * 2 * amount * decay,
      });
    }, 16);
    return () => clearInterval(id);
  }, [shake, consume, lowEffectsMode, mobileSafeMode]);

  return offset;
}
