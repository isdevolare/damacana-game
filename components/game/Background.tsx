'use client';

import { useGame } from '@/lib/store';
import { activeLevels } from '@/lib/config/levels';
import { chapterForLevel } from '@/lib/config/chapters';
import { useEffect, useState } from 'react';

interface Star { id: number; x: number; y: number; s: number; o: number; d: number }
interface Flow { id: number; x: number; d: number; delay: number; h: number }

export function Background() {
  const levelIdx = useGame((s) => s.levelIdx);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const levels = activeLevels(totalPrestiges);
  const level = levels[Math.min(levelIdx, levels.length - 1)];
  const chapter = chapterForLevel(levelIdx);
  const bg = level.bgGradient;

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
      <div
        className="absolute left-1/2 top-[12%] h-[210px] w-[210px] -translate-x-1/2 rounded-full opacity-35 blur-[1px]"
        style={{
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), ${chapter.accent} 18%, transparent 62%)`,
          boxShadow: `0 0 90px 24px ${chapter.glow}`,
        }}
      />
      {chapter.id === 'saturn' && (
        <div
          className="absolute left-1/2 top-[calc(12%+92px)] h-8 w-[300px] -translate-x-1/2 -rotate-12 rounded-full border opacity-35"
          style={{ borderColor: chapter.accent, boxShadow: `0 0 28px ${chapter.glow}` }}
        />
      )}
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
