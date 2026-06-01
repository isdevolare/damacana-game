'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { selectResearchBonuses, useGame } from '@/lib/store';
import { nextPrestigeGainTarget, prestigeShardGain } from '@/lib/config/prestige';
import { fmt } from '@/lib/util';

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(0, minutes)}m`;
}

export function ProfileStatsModal() {
  const show = useGame((s) => s.showProfile);
  const setShow = useGame((s) => s.setShowProfile);
  const setShowAchievements = useGame((s) => s.setShowAchievements);
  const setShowPrestige = useGame((s) => s.setShowPrestige);
  const totalPlayMs = useGame((s) => s.totalPlayMs);
  const totalEarned = useGame((s) => s.totalEarned);
  const bossKillsLifetime = useGame((s) => s.bossKillsLifetime);
  const completedChapters = useGame((s) => s.completedChapters);
  const knowledgeBulbsCollected = useGame((s) => s.knowledgeBulbsCollected);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const shards = useGame((s) => s.shards);
  const tree = useGame((s) => s.tree);
  const researchBonuses = useGame(selectResearchBonuses);
  const t = useTranslations();
  const prestigeGain = prestigeShardGain(totalEarned, totalPrestiges, researchBonuses.prestigeGainPct, Boolean(tree['guaranteedShards']));
  const prestigeTarget = nextPrestigeGainTarget(totalEarned, totalPrestiges, researchBonuses.prestigeGainPct, Boolean(tree['guaranteedShards']));

  const stats = [
    ['playTime', formatDuration(totalPlayMs)],
    ['totalEarned', fmt(totalEarned)],
    ['bossesDefeated', fmt(bossKillsLifetime)],
    ['chaptersCompleted', completedChapters.length.toString()],
    ['knowledgeBulbs', knowledgeBulbsCollected.toString()],
    ['prestigeCount', totalPrestiges.toString()],
  ] as const;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[52] overflow-hidden bg-black/92 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-sm sm:p-4"
          onClick={() => setShow(false)}
        >
          <div className="flex min-h-full items-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto max-h-[calc(100dvh_-_1.5rem_-_env(safe-area-inset-bottom))] w-full max-w-md overflow-y-auto rounded-xl border border-white/20 bg-black/90 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-major text-lg text-white">{t('profile.title')}</div>
                  <div className="font-space text-[10px] text-white/50">{t('profile.subtitle')}</div>
                </div>
                <button
                  onClick={() => setShow(false)}
                  className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
                >
                  {t('ui.close')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stats.map(([key, value]) => (
                  <div key={key} className="rounded-md border border-white/[0.12] bg-white/[0.035] p-3">
                    <div className="font-space text-[9px] uppercase tracking-widest text-white/45">
                      {t(`profile.stats.${key}` as any)}
                    </div>
                    <div className="mt-1 font-vt text-2xl text-cyan">{value}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setShow(false);
                  setShowPrestige(true);
                }}
                className="mt-3 w-full rounded-md border border-pink/45 bg-pink/10 px-3 py-2 text-left font-space text-xs uppercase tracking-widest text-pink"
              >
                <span>{t('ui.prestigeManualEntry')}</span>
                <span className="float-right text-gold">◇ {fmt(shards)} + {fmt(prestigeGain)}</span>
                <span className="mt-1 block text-[9px] tracking-[0.14em] text-white/45">
                  {t('ui.prestigeNextThreshold', { gain: fmt(prestigeTarget.nextGain) })}
                </span>
              </button>
              <button
                onClick={() => {
                  setShow(false);
                  setShowAchievements(true);
                }}
                className="mt-3 w-full rounded-md border border-gold/40 bg-gold/10 px-3 py-2 font-space text-xs uppercase tracking-widest text-gold"
              >
                {t('ui.achievements')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
