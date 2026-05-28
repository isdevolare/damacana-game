'use client';

import { useGame } from '@/lib/store';
import { currentChapter } from '@/lib/config/chapters';
import { planetThemeForChapter } from '@/lib/config/planetThemes';
import { useEffect, useState } from 'react';

interface Star { id: number; x: number; y: number; s: number; o: number; d: number }
interface Flow { id: number; x: number; d: number; delay: number; h: number }

export function Background() {
  const completedChapters = useGame((s) => s.completedChapters);
  const chapter = currentChapter(completedChapters);
  const theme = planetThemeForChapter(chapter.id);

  const [stars, setStars] = useState<Star[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: theme.starDensity }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 0.5 + Math.random() * 1.5,
        o: 0.3 + Math.random() * 0.6,
        d: 2 + Math.random() * 5,
      })),
    );
    setFlows(
      Array.from({ length: theme.dustDensity }).map((_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        d: 5 + Math.random() * 7,
        delay: Math.random() * 5,
        h: 80 + Math.random() * 160,
      })),
    );
  }, [theme.dustDensity, theme.starDensity]);

  return (
    <div
      className="fixed inset-0 z-0 transition-[background] duration-700"
      style={{ background: theme.backgroundGradient }}
    >
      <div
        className="absolute inset-0 opacity-70 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 50% 18%, ${theme.ambientGlow}, transparent 34%), radial-gradient(circle at 50% 72%, rgba(0,0,0,0), rgba(0,0,0,0.72) 70%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-[11%] h-[210px] w-[210px] -translate-x-1/2 rounded-full opacity-40 blur-[1px] transition-[background,box-shadow] duration-700"
        style={{
          background: theme.planetGradient,
          boxShadow: `0 0 90px 24px ${theme.ambientGlow}`,
        }}
      />
      {theme.effect === 'rings' && (
        <>
          <div
            className="absolute left-1/2 top-[calc(11%+92px)] h-8 w-[318px] -translate-x-1/2 -rotate-12 rounded-full border opacity-40"
            style={{ borderColor: theme.uiAccent, boxShadow: `0 0 28px ${theme.ambientGlow}` }}
          />
          <div
            className="absolute left-1/2 top-[calc(11%+98px)] h-3 w-[370px] -translate-x-1/2 -rotate-12 rounded-full border opacity-20"
            style={{ borderColor: theme.uiAccent }}
          />
        </>
      )}
      {theme.effect === 'storm' && (
        <div
          className="absolute left-1/2 top-[18%] h-24 w-[280px] -translate-x-1/2 rounded-full opacity-25 blur-[2px]"
          style={{
            background: `repeating-linear-gradient(160deg, transparent 0 12px, ${theme.dustColor} 13px 16px, transparent 17px 30px)`,
          }}
        />
      )}
      {theme.effect === 'iceFog' && (
        <div
          className="absolute left-1/2 top-[24%] h-44 w-[340px] -translate-x-1/2 rounded-full opacity-20 blur-lg"
          style={{ background: theme.dustColor }}
        />
      )}
      {theme.effect === 'dust' && (
        <div
          className="absolute inset-x-0 top-[28%] h-20 opacity-20 blur-[1px]"
          style={{
            background: `linear-gradient(100deg, transparent, ${theme.dustColor}, transparent)`,
          }}
        />
      )}
      {theme.effect === 'ember' && (
        <div
          className="absolute inset-x-0 top-[18%] h-44 opacity-24 blur-[2px]"
          style={{
            background: `radial-gradient(circle at 45% 45%, ${theme.dustColor}, transparent 58%), repeating-linear-gradient(120deg, transparent 0 18px, ${theme.dustColor} 19px 21px, transparent 22px 44px)`,
          }}
        />
      )}
      {theme.effect === 'flare' && (
        <div
          className="absolute left-1/2 top-[10%] h-[250px] w-[250px] -translate-x-1/2 rounded-full opacity-20 blur-md"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${theme.dustColor}, transparent, ${theme.ambientGlow}, transparent)`,
          }}
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
          className="absolute w-[2px]"
          style={{
            left: `${f.x}%`,
            top: -f.h,
            height: f.h,
            background: `linear-gradient(to bottom, transparent, ${theme.dustColor}, transparent)`,
            filter: 'blur(0.5px)',
            animation: `flow ${f.d}s linear ${f.delay}s infinite`,
            boxShadow: `0 0 12px ${theme.particleGlow}`,
          }}
        />
      ))}
    </div>
  );
}
