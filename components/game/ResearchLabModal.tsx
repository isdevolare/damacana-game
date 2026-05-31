'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame, selectPerSec } from '@/lib/store';
import { RESEARCH_LIST, ResearchDefinition } from '@/lib/config/research';
import { fmt } from '@/lib/util';

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function isUnlocked(research: ResearchDefinition, ctx: {
  perSec: number;
  completedChapters: string[];
  totalPrestiges: number;
  shards: number;
}) {
  const req = research.requirement;
  if (req.type === 'none') return true;
  if (req.type === 'prestigeOrShard') return ctx.totalPrestiges > 0 || ctx.shards > 0;
  return ctx.perSec >= req.min || Boolean(req.fallbackChapter && ctx.completedChapters.includes(req.fallbackChapter));
}

export function ResearchLabModal() {
  const t = useTranslations('research');
  const show = useGame((s) => s.showResearch);
  const setShow = useGame((s) => s.setShowResearch);
  const damacana = useGame((s) => s.damacana);
  const shards = useGame((s) => s.shards);
  const perSec = useGame(selectPerSec);
  const completedChapters = useGame((s) => s.completedChapters);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const activeResearchId = useGame((s) => s.activeResearchId);
  const activeResearchStartAt = useGame((s) => s.activeResearchStartAt);
  const activeResearchEndAt = useGame((s) => s.activeResearchEndAt);
  const completedResearchIds = useGame((s) => s.completedResearchIds);
  const claimedResearchIds = useGame((s) => s.claimedResearchIds);
  const startResearch = useGame((s) => s.startResearch);
  const claimResearch = useGame((s) => s.claimResearch);
  const refreshResearchProgress = useGame((s) => s.refreshResearchProgress);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      setNow(Date.now());
      refreshResearchProgress();
    }, 500);
    return () => clearInterval(id);
  }, [show, refreshResearchProgress]);

  const grouped = useMemo(() => ({
    combat: RESEARCH_LIST.filter((item) => item.category === 'combat'),
    flow: RESEARCH_LIST.filter((item) => item.category === 'flow'),
    offline: RESEARCH_LIST.filter((item) => item.category === 'offline'),
    void: RESEARCH_LIST.filter((item) => item.category === 'void'),
  }), []);

  const unlockCtx = { perSec, completedChapters, totalPrestiges, shards };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/85 p-2 sm:p-6 sm:backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[calc(100dvh_-_1rem_-_env(safe-area-inset-bottom))] w-full max-w-md overflow-hidden rounded-xl border border-cyan/35 bg-black/95 shadow-[0_0_20px_rgba(92,246,255,0.1)] sm:max-h-[88dvh] sm:shadow-[0_0_34px_rgba(92,246,255,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 p-4">
              <div className="font-major text-xl text-cyan">{t('title')}</div>
              <div className="mt-1 font-space text-[10px] uppercase tracking-[0.2em] text-white/45">
                {activeResearchId ? t('oneActive') : t('idle')}
              </div>
            </div>

            <div className="max-h-[calc(100dvh_-_8.5rem_-_env(safe-area-inset-bottom))] space-y-4 overflow-y-auto p-3 sm:max-h-[68dvh] sm:space-y-5 sm:p-4">
              {Object.entries(grouped).map(([category, items]) => (
                <section key={category}>
                  <div className="mb-2 font-space text-[10px] uppercase tracking-[0.24em] text-purple">
                    {t(`categories.${category}` as any)}
                  </div>
                  <div className="space-y-2">
                    {items.map((research) => {
                      const claimed = claimedResearchIds.includes(research.id);
                      const active = activeResearchId === research.id;
                      const complete = active && now >= activeResearchEndAt;
                      const completed = completedResearchIds.includes(research.id) || complete;
                      const unlocked = isUnlocked(research, unlockCtx);
                      const enoughCost = research.cost.currency === 'shards'
                        ? shards >= research.cost.amount
                        : damacana >= research.cost.amount;
                      const locked = !unlocked;
                      const status = claimed
                        ? 'claimed'
                        : completed
                          ? 'completed'
                          : active
                            ? 'researching'
                            : locked
                              ? 'locked'
                              : 'available';
                      const progress = active
                        ? Math.min(100, Math.max(0, ((now - activeResearchStartAt) / Math.max(1, activeResearchEndAt - activeResearchStartAt)) * 100))
                        : claimed
                          ? 100
                          : completed
                            ? 100
                            : 0;
                      const canStart = status === 'available' && !activeResearchId && enoughCost;

                      return (
                        <article
                          key={research.id}
                          className="rounded-lg border border-white/10 bg-white/[0.035] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-space text-[11px] uppercase tracking-[0.18em] text-white/85">
                                {t(`items.${research.i18nKey}.name` as any)}
                              </div>
                              <div className="mt-1 font-space text-[10px] leading-relaxed text-white/50">
                                {t(`items.${research.i18nKey}.desc` as any)}
                              </div>
                            </div>
                            <div className="shrink-0 rounded border border-white/10 px-2 py-1 font-space text-[8px] uppercase tracking-widest text-white/50">
                              {t(`status.${status}` as any)}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2 font-space text-[9px] uppercase tracking-widest text-white/45">
                            <div>
                              <div>{t('duration')}</div>
                              <div className="mt-1 text-white/80">{formatDuration(research.durationMs)}</div>
                            </div>
                            <div>
                              <div>{t('cost')}</div>
                              <div className={enoughCost ? 'mt-1 text-white/80' : 'mt-1 text-danger'}>
                                {research.cost.currency === 'shards' ? '◇' : ''}{fmt(research.cost.amount)}
                              </div>
                            </div>
                            <div>
                              <div>{t('bonus')}</div>
                              <div className="mt-1 text-cyan">{t(`items.${research.i18nKey}.bonus` as any)}</div>
                            </div>
                          </div>

                          {locked && (
                            <div className="mt-3 rounded border border-danger/20 bg-danger/5 px-2 py-1.5 font-space text-[9px] uppercase tracking-[0.16em] text-danger/80">
                              {research.requirement.type === 'prestigeOrShard'
                                ? t('requirements.void')
                                : t('requirements.offline')}
                            </div>
                          )}

                          {(active || completed || claimed) && (
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-cyan transition-[width] duration-500 shadow-[0_0_14px_rgba(92,246,255,0.65)]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="font-space text-[9px] uppercase tracking-[0.16em] text-white/40">
                              {active && !complete ? t('remaining', { time: formatDuration(activeResearchEndAt - now) }) : ' '}
                            </div>
                            {completed && !claimed ? (
                              <button
                                onClick={() => claimResearch(research.id)}
                                className="rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 font-space text-[10px] uppercase tracking-widest text-gold"
                              >
                                {t('claim')}
                              </button>
                            ) : (
                              <button
                                disabled={!canStart}
                                onClick={() => startResearch(research.id)}
                                className="rounded-md border border-cyan/35 bg-cyan/10 px-3 py-1.5 font-space text-[10px] uppercase tracking-widest text-cyan disabled:opacity-35"
                              >
                                {t('start')}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="border-t border-white/10 p-3">
              <button
                onClick={() => setShow(false)}
                className="w-full rounded-md border border-white/25 py-2 font-space text-xs uppercase tracking-widest text-white/75"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
