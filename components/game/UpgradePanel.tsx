'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';
import { UPGRADES, upgradeCost } from '@/lib/config/upgrades';
import { fmt, clsx } from '@/lib/util';
import { useTranslations } from 'next-intl';
import { audio } from '@/lib/audio/AudioEngine';

export function UpgradePanel() {
  const upgrades = useGame((s) => s.upgrades);
  const dmc = useGame((s) => s.damacana);
  const levelIdx = useGame((s) => s.levelIdx);
  const buy = useGame((s) => s.buyUpgrade);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations('upgrades');
  const ui = useTranslations('ui');

  const tap = UPGRADES.filter((u) => u.kind === 'tap');
  const auto = UPGRADES.filter((u) => u.kind === 'auto');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(max-width: 640px)');
    const update = () => setCollapsed(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <div className="px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:px-3 sm:pb-3">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="mb-1 flex w-full items-center justify-between rounded-md border border-white/10 bg-black/50 px-2 py-1.5 font-space text-[10px] uppercase tracking-widest text-white/65 sm:hidden"
      >
        <span>{ui('buy')}</span>
        <span className="text-cyan">{collapsed ? '+' : '-'}</span>
      </button>
      <div className={clsx(
        'grid max-h-[15dvh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain sm:max-h-[23vh] sm:gap-3',
        collapsed && 'hidden sm:grid',
      )}>
      <div>
        <div className="text-[10px] font-space tracking-widest text-cyan/80 mb-1">
          {ui('tap')}
        </div>
        <div className="flex flex-col gap-1.5">
          {tap.map((u) => {
            const lvl = upgrades[u.id] ?? 0;
            const cost = upgradeCost(u, lvl);
            const locked = levelIdx < u.unlockLevel;
            const can = !locked && dmc >= cost;
            return (
              <button
                key={u.id}
                disabled={!can}
                onClick={() => {
                  buy(u.id);
                  if (sfxEnabled) audio.sfxUpgrade();
                }}
                className={clsx(
                  'text-left rounded-md border px-2 py-1 transition-all sm:py-1.5',
                  locked
                    ? 'border-white/10 bg-white/[0.02] opacity-40'
                    : can
                    ? 'border-cyan/40 bg-cyan/10 hover:bg-cyan/20'
                    : 'border-white/15 bg-white/[0.04] opacity-70',
                )}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-[10px] font-space uppercase tracking-wider text-white/90 sm:text-[11px]">
                    {t(`${u.key}.name`)}
                  </span>
                  <span className="text-[10px] font-vt text-white/60">×{lvl}</span>
                </div>
                <div className="mt-0.5 hidden text-[9px] font-space text-white/50 sm:block">
                  +{u.amount}/{ui('tap')}
                </div>
                <div className="text-[10px] font-vt text-cyan mt-0.5">
                  {locked ? `🔒 lv ${u.unlockLevel}` : fmt(cost)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-space tracking-widest text-purple/80 mb-1">
          {ui('flow')}
        </div>
        <div className="flex flex-col gap-1.5">
          {auto.map((u) => {
            const lvl = upgrades[u.id] ?? 0;
            const cost = upgradeCost(u, lvl);
            const locked = levelIdx < u.unlockLevel;
            const can = !locked && dmc >= cost;
            return (
              <button
                key={u.id}
                disabled={!can}
                onClick={() => {
                  buy(u.id);
                  if (sfxEnabled) audio.sfxUpgrade();
                }}
                className={clsx(
                  'text-left rounded-md border px-2 py-1 transition-all sm:py-1.5',
                  locked
                    ? 'border-white/10 bg-white/[0.02] opacity-40'
                    : can
                    ? 'border-purple/40 bg-purple/10 hover:bg-purple/20'
                    : 'border-white/15 bg-white/[0.04] opacity-70',
                )}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-[10px] font-space uppercase tracking-wider text-white/90 sm:text-[11px]">
                    {t(`${u.key}.name`)}
                  </span>
                  <span className="text-[10px] font-vt text-white/60">×{lvl}</span>
                </div>
                <div className="mt-0.5 hidden text-[9px] font-space text-white/50 sm:block">
                  +{u.amount}/{ui('sec')}
                </div>
                <div className="text-[10px] font-vt text-purple mt-0.5">
                  {locked ? `🔒 lv ${u.unlockLevel}` : fmt(cost)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
