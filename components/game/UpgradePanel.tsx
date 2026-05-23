'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';
import {
  UPGRADES,
  affordableUpgradeCount,
  upgradeBulkCost,
  upgradeCost,
  upgradeTotalAmount,
  type UpgradeBuyMode,
  type UpgradeDef,
} from '@/lib/config/upgrades';
import { fmt, clsx } from '@/lib/util';
import { useTranslations } from 'next-intl';
import { audio } from '@/lib/audio/AudioEngine';

const BUY_MODES: UpgradeBuyMode[] = ['x1', 'x10', 'max'];
const UPGRADE_MILESTONES = [10, 25, 50, 100, 250, 1000];

const RARITY_STYLE = {
  common: { border: 'border-white/15', text: 'text-white/70', bg: 'bg-white/[0.03]' },
  rare: { border: 'border-cyan/30', text: 'text-cyan', bg: 'bg-cyan/[0.06]' },
  epic: { border: 'border-purple/35', text: 'text-purple', bg: 'bg-purple/[0.07]' },
  legendary: { border: 'border-gold/40', text: 'text-gold', bg: 'bg-gold/[0.06]' },
} as const;

export function UpgradePanel() {
  const upgrades = useGame((s) => s.upgrades);
  const dmc = useGame((s) => s.damacana);
  const levelIdx = useGame((s) => s.levelIdx);
  const buy = useGame((s) => s.buyUpgrade);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const [collapsed, setCollapsed] = useState(false);
  const [buyMode, setBuyMode] = useState<UpgradeBuyMode>('x1');
  const [flashedId, setFlashedId] = useState<string | null>(null);
  const [milestoneToast, setMilestoneToast] = useState<{ id: number; name: string; level: number } | null>(null);
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

  const renderUpgrade = (u: UpgradeDef, accent: 'cyan' | 'purple') => {
    const lvl = upgrades[u.id] ?? 0;
    const locked = levelIdx < u.unlockLevel;
    const requested = buyMode === 'x10' ? 10 : buyMode === 'max' ? 100 : 1;
    const count = locked ? 0 : affordableUpgradeCount(u, lvl, dmc, requested);
    const purchaseCount = buyMode === 'max' ? count : requested;
    const shownCount = buyMode === 'max' ? count : requested;
    const cost = locked
      ? upgradeCost(u, lvl)
      : purchaseCount > 0
        ? upgradeBulkCost(u, lvl, purchaseCount)
        : upgradeCost(u, lvl);
    const can = !locked && (buyMode === 'max' ? count > 0 : count >= requested);
    const rarity = RARITY_STYLE[u.rarity];
    const nextGain = upgradeTotalAmount(u, lvl + Math.max(1, count || 1)) - upgradeTotalAmount(u, lvl);
    const nextLevel = lvl + count;
    const reachedMilestone = UPGRADE_MILESTONES.filter((mark) => lvl < mark && nextLevel >= mark).pop();
    return (
      <div
        key={u.id}
        className={clsx(
          'rounded-md border px-2 py-1.5 transition duration-150',
          rarity.border,
          rarity.bg,
          locked ? 'opacity-45' : 'hover:-translate-y-0.5',
          flashedId === u.id && 'scale-[1.015] ring-1 ring-cyan/60 shadow-[0_0_18px_rgba(92,246,255,0.22)]',
        )}
      >
        <div className="flex min-w-0 items-start gap-2">
          <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-black/35 font-vt text-sm', rarity.border, rarity.text)}>
            {u.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="truncate text-[10px] font-space uppercase tracking-wider text-white/90 sm:text-[11px]">
                {t(`${u.key}.name`)}
              </span>
              <span className={clsx('font-vt text-[10px]', rarity.text)}>x{fmt(lvl)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2 text-[9px] font-space text-white/48">
              <span>+{fmt(nextGain)}/{u.kind === 'tap' ? ui('tap') : ui('sec')}</span>
              <span className={rarity.text}>{t(`rarity.${u.rarity}` as any)}</span>
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <div className={clsx('min-w-0 flex-1 truncate font-vt text-[11px]', accent === 'cyan' ? 'text-cyan' : 'text-purple')}>
            {locked ? `lv ${u.unlockLevel}` : fmt(cost)}
          </div>
          <button
            type="button"
            disabled={!can}
            onClick={() => {
              buy(u.id, buyMode);
              setFlashedId(u.id);
              setTimeout(() => setFlashedId((current) => current === u.id ? null : current), 360);
              if (reachedMilestone) {
                const toast = { id: Date.now(), name: t(`${u.key}.name`), level: reachedMilestone };
                setMilestoneToast(toast);
                setTimeout(() => setMilestoneToast((current) => current?.id === toast.id ? null : current), 2200);
              }
              if (sfxEnabled) audio.sfxUpgrade();
            }}
            className={clsx(
              'rounded border px-2 py-1 font-space text-[9px] uppercase tracking-wider transition active:scale-95',
              can
                ? accent === 'cyan'
                  ? 'border-cyan/45 bg-cyan/10 text-cyan hover:bg-cyan/20 shadow-[0_0_14px_rgba(92,246,255,0.12)]'
                  : 'border-purple/45 bg-purple/10 text-purple hover:bg-purple/20 shadow-[0_0_14px_rgba(184,122,255,0.12)]'
                : 'border-white/10 bg-white/[0.02] text-white/35',
            )}
          >
            {buyMode === 'max' ? `+${fmt(shownCount)}` : buyMode}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:px-3 sm:pb-3">
      <div className="mb-1 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex flex-1 items-center justify-between rounded-md border border-white/10 bg-black/50 px-2 py-1.5 font-space text-[10px] uppercase tracking-widest text-white/65 sm:hidden"
        >
          <span>{ui('buy')}</span>
          <span className="text-cyan">{collapsed ? '+' : '-'}</span>
        </button>
        <div className="flex rounded-md border border-white/10 bg-black/45 p-0.5">
          {BUY_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBuyMode(mode)}
              className={clsx(
                'h-6 min-w-8 rounded px-1.5 font-space text-[9px] uppercase tracking-wider transition active:scale-95',
                buyMode === mode ? 'bg-cyan/18 text-cyan shadow-[0_0_10px_rgba(92,246,255,0.14)]' : 'text-white/45 hover:text-white/75',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className={clsx(
        'grid max-h-[18dvh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain sm:max-h-[25vh] sm:gap-3',
        collapsed && 'hidden sm:grid',
      )}>
      <div>
        <div className="text-[10px] font-space tracking-widest text-cyan/80 mb-1">
          {ui('tap')}
        </div>
        <div className="flex flex-col gap-1.5">
          {tap.map((u) => renderUpgrade(u, 'cyan'))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-space tracking-widest text-purple/80 mb-1">
          {ui('flow')}
        </div>
        <div className="flex flex-col gap-1.5">
          {auto.map((u) => renderUpgrade(u, 'purple'))}
        </div>
      </div>
      </div>
      {milestoneToast && (
        <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] left-1/2 z-[57] w-[min(88vw,280px)] -translate-x-1/2 rounded-lg border border-gold/45 bg-black/88 px-3 py-2 text-center shadow-[0_0_22px_rgba(255,209,102,0.16)]">
          <div className="font-space text-[9px] uppercase tracking-[0.2em] text-gold">
            {t('milestoneReached', { name: milestoneToast.name, level: milestoneToast.level })}
          </div>
        </div>
      )}
    </div>
  );
}
