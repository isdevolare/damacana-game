'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';

export function AnomalyEffectsHud() {
  const buffs = useGame((s) => s.activeBuffs);
  const t = useTranslations('events.effects');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const active = buffs
    .filter((buff) => buff.expiresAt > now && buff.labelKey)
    .sort((a, b) => a.expiresAt - b.expiresAt)
    .slice(0, 4);

  if (active.length === 0) return null;

  return (
    <div className="mx-2 mt-1 flex max-h-8 flex-wrap gap-1 overflow-hidden sm:mx-3">
      {active.map((buff) => {
        const remaining = Math.max(1, Math.ceil((buff.expiresAt - now) / 1000));
        return (
          <div
            key={buff.id}
            className="rounded border border-cyan/25 bg-black/45 px-1.5 py-0.5 font-space text-[8px] uppercase tracking-wider text-cyan/80 shadow-[0_0_10px_rgba(92,246,255,0.12)]"
          >
            {t(buff.labelKey as any)} · {remaining}s
          </div>
        );
      })}
    </div>
  );
}
