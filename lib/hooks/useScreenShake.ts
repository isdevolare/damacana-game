'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';

const RANGES = { small: 4, medium: 10, hard: 22 };

export function useScreenShake() {
  const shake = useGame((s) => s.shake);
  const consume = useGame((s) => s.consumeShake);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!shake) return;
    const amount = RANGES[shake.intensity];
    let frames = 0;
    const total = shake.intensity === 'hard' ? 22 : shake.intensity === 'medium' ? 14 : 8;
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
  }, [shake, consume]);

  return offset;
}
