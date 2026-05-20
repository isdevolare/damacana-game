'use client';

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
  const t = useTranslations('upgrades');
  const ui = useTranslations('ui');

  const tap = UPGRADES.filter((u) => u.kind === 'tap');
  const auto = UPGRADES.filter((u) => u.kind === 'auto');

  return (
    <div className="px-3 pb-3 grid grid-cols-2 gap-3">
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
                  'text-left rounded-md border px-2 py-1.5 transition-all',
                  locked
                    ? 'border-white/10 bg-white/[0.02] opacity-40'
                    : can
                    ? 'border-cyan/40 bg-cyan/10 hover:bg-cyan/20'
                    : 'border-white/15 bg-white/[0.04] opacity-70',
                )}
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-space uppercase tracking-wider text-white/90">
                    {t(`${u.key}.name`)}
                  </span>
                  <span className="text-[10px] font-vt text-white/60">×{lvl}</span>
                </div>
                <div className="text-[9px] font-space text-white/50 mt-0.5">
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
                  'text-left rounded-md border px-2 py-1.5 transition-all',
                  locked
                    ? 'border-white/10 bg-white/[0.02] opacity-40'
                    : can
                    ? 'border-purple/40 bg-purple/10 hover:bg-purple/20'
                    : 'border-white/15 bg-white/[0.04] opacity-70',
                )}
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-space uppercase tracking-wider text-white/90">
                    {t(`${u.key}.name`)}
                  </span>
                  <span className="text-[10px] font-vt text-white/60">×{lvl}</span>
                </div>
                <div className="text-[9px] font-space text-white/50 mt-0.5">
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
  );
}
