'use client';

import { useGame } from '@/lib/store';
import { LEVELS } from '@/lib/config/levels';
import { useEffect, useState } from 'react';

interface Star { id: number; x: number; y: number; s: number; o: number; d: number }
interface Flow { id: number; x: number; d: number; delay: number; h: number }

export function Background() {
  const levelIdx = useGame((s) => s.levelIdx);
  const bg = LEVELS[levelIdx].bgGradient;

  const [stars, setStars] = useState<Star[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 0.5 + Math.random() * 1.5,
        o: 0.3 + Math.random() * 0.6,
        d: 2 + Math.random() * 5,
      })),
    );
    setFlows(
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        d: 4 + Math.random() * 5,
        delay: Math.random() * 5,
        h: 80 + Math.random() * 160,
      })),
    );
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 transition-[background] duration-700"
      style={{ background: bg }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            opacity: s.o,
            animation: `pulse2 ${s.d}s ease-in-out infinite`,
          }}
        />
      ))}
      {flows.map((f) => (
        <div
          key={f.id}
          className="absolute w-[2px] bg-gradient-to-b from-transparent via-cyan/60 to-transparent"
          style={{
            left: `${f.x}%`,
            top: -f.h,
            height: f.h,
            filter: 'blur(0.5px)',
            animation: `flow ${f.d}s linear ${f.delay}s infinite`,
            boxShadow: '0 0 12px rgba(92,246,255,0.6)',
          }}
        />
      ))}
    </div>
  );
}
