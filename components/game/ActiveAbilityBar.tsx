'use client';

import { useGame } from '@/lib/store';
import { BALANCE } from '@/lib/config/balance';
import { useEffect, useState } from 'react';
import { audio } from '@/lib/audio/AudioEngine';
import { useTranslations } from 'next-intl';

const ABILITIES = [
  { id: 'voidBurst' as const, node: 'voidBurst', icon: '✦', cd: BALANCE.abilities.voidBurst.cooldown, color: 'border-danger/60 text-danger bg-danger/10' },
  { id: 'flood' as const,     node: 'flood',     icon: '〜', cd: BALANCE.abilities.flood.cooldown,     color: 'border-cyan/60 text-cyan bg-cyan/10' },
  { id: 'timeLoop' as const,  node: 'timeLoop',  icon: '◌', cd: BALANCE.abilities.timeLoop.cooldown,  color: 'border-pink/60 text-pink bg-pink/10' },
];

export function ActiveAbilityBar() {
  const tree = useGame((s) => s.tree);
  const cd = useGame((s) => s.activeAbilityCooldowns);
  const fire = useGame((s) => s.fireAbility);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('tree');

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const owned = ABILITIES.filter((a) => tree[a.node]);
  if (owned.length === 0) return null;

  return (
    <div className="absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
      {owned.map((a) => {
        const ready = (cd[a.id] ?? 0) <= now;
        const pct = ready ? 100 : Math.max(0, Math.min(100, 100 - (((cd[a.id] ?? 0) - now) / a.cd) * 100));
        return (
          <button
            key={a.id}
            disabled={!ready}
            onClick={() => {
              if (sfxEnabled) audio.sfxAbility();
              fire(a.id);
            }}
            className={`relative w-12 h-12 rounded-md border-2 flex items-center justify-center font-vt text-xl ${
              ready ? a.color + ' animate-pulse2' : 'border-white/20 text-white/30 bg-white/5'
            }`}
            title={t(`offense.${a.id}.name`)}
          >
            <span>{a.icon}</span>
            {!ready && (
              <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
                <div
                  className="absolute bottom-0 left-0 w-full bg-white/20"
                  style={{ height: `${100 - pct}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
