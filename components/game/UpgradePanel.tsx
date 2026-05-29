'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  common: { border: 'border-white/15', text: 'text-white/70', bg: 'bg-white/[0.03]', glow: 'shadow-none', icon: 'bg-white/[0.04]' },
  rare: { border: 'border-cyan/35', text: 'text-cyan', bg: 'bg-cyan/[0.06]', glow: 'shadow-[0_0_14px_rgba(92,246,255,0.12)]', icon: 'bg-cyan/[0.08]' },
  epic: { border: 'border-purple/40', text: 'text-purple', bg: 'bg-purple/[0.07]', glow: 'shadow-[0_0_16px_rgba(184,122,255,0.14)]', icon: 'bg-purple/[0.09]' },
  legendary: { border: 'border-gold/45', text: 'text-gold', bg: 'bg-gold/[0.07]', glow: 'shadow-[0_0_18px_rgba(255,209,102,0.16)]', icon: 'bg-gold/[0.09]' },
  cosmic: { border: 'border-pink/45', text: 'text-pink', bg: 'bg-pink/[0.07]', glow: 'shadow-[0_0_20px_rgba(255,92,232,0.16)]', icon: 'bg-pink/[0.09]' },
  singularity: { border: 'border-white/45', text: 'text-white', bg: 'bg-white/[0.06]', glow: 'shadow-[0_0_22px_rgba(255,255,255,0.16)]', icon: 'bg-white/[0.1]' },
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
    const currentEffect = upgradeTotalAmount(u, lvl);
    const previewCount = buyMode === 'max' ? Math.max(1, count) : requested;
    const nextGain = upgradeTotalAmount(u, lvl + 1) - currentEffect;
    const buyGain = upgradeTotalAmount(u, lvl + previewCount) - currentEffect;
    const nextLevel = lvl + (can ? purchaseCount : 0);
    const reachedMilestone = UPGRADE_MILESTONES.filter((mark) => lvl < mark && nextLevel >= mark).pop();
    const unit = u.kind === 'tap' ? ui('tap') : ui('sec');
    return (
      <div
        key={u.id}
        className={clsx(
          'rounded-md border px-2 py-1.5 transition duration-150',
          rarity.border,
          rarity.bg,
          rarity.glow,
          locked ? 'opacity-45' : 'hover:-translate-y-0.5',
          flashedId === u.id && 'scale-[1.015] ring-1 ring-cyan/60 shadow-[0_0_18px_rgba(92,246,255,0.22)]',
        )}
      >
        <div className="flex min-w-0 items-start gap-2">
          <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded border font-vt text-sm', rarity.border, rarity.text, rarity.icon)}>
            {u.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="truncate text-[10px] font-space uppercase tracking-wider text-white/90 sm:text-[11px]">
                {t(`${u.key}.name`)}
              </span>
              <span className={clsx('font-vt text-[10px]', rarity.text)}>x{fmt(lvl)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2 text-[8px] font-space uppercase tracking-[0.08em] text-white/48">
              <span className="truncate">{t(`identity.${u.identity}` as any)}</span>
              <span className={rarity.text}>{t(`rarity.${u.rarity}` as any)}</span>
            </div>
          </div>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1 rounded border border-white/10 bg-black/25 px-1.5 py-1">
          <div className="min-w-0">
            <div className="truncate font-space text-[7px] uppercase tracking-[0.12em] text-white/35">{t('preview.current')}</div>
            <div className="truncate font-vt text-[10px] text-white/70">{fmt(currentEffect)}/{unit}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate font-space text-[7px] uppercase tracking-[0.12em] text-white/35">{t('preview.next')}</div>
            <div className={clsx('truncate font-vt text-[10px]', rarity.text)}>+{fmt(nextGain)}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate font-space text-[7px] uppercase tracking-[0.12em] text-white/35">{t('preview.buy')}</div>
            <div className={clsx('truncate font-vt text-[10px]', can ? rarity.text : 'text-white/35')}>+{fmt(buyGain)}</div>
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
          {t('section.weapons')}
        </div>
        <div className="flex flex-col gap-1.5">
          {tap.map((u) => renderUpgrade(u, 'cyan'))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-space tracking-widest text-purple/80 mb-1">
          {t('section.autoSystems')}
        </div>
        <div className="flex flex-col gap-1.5">
          {auto.map((u) => renderUpgrade(u, 'purple'))}
        </div>
      </div>
      </div>
      <AnimatePresence>
        {milestoneToast && (
          <motion.div
            key={milestoneToast.id}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] left-1/2 z-[57] w-[min(88vw,292px)] -translate-x-1/2 rounded-lg border border-gold/50 bg-black/90 px-3 py-2 text-center shadow-[0_0_28px_rgba(255,209,102,0.22)]"
          >
            <div className="mx-auto mb-1 h-px w-16 bg-gold/55 shadow-[0_0_12px_rgba(255,209,102,0.55)]" />
            <div className="font-space text-[9px] uppercase tracking-[0.2em] text-gold">
              {t('milestoneReached', { name: milestoneToast.name, level: milestoneToast.level })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
