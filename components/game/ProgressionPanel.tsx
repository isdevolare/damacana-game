'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { TIERS, nextTier } from '@/lib/config/progression';
import { CHAPTERS, currentChapter } from '@/lib/config/chapters';

export function ProgressionPanel() {
  const show = useGame((s) => s.showProgression);
  const setShow = useGame((s) => s.setShowProgression);
  const setShowShop = useGame((s) => s.setShowShop);
  const prestiges = useGame((s) => s.totalPrestiges);
  const levelIdx = useGame((s) => s.levelIdx);
  const boss = useGame((s) => s.boss);
  const completedChapters = useGame((s) => s.completedChapters);
  const t = useTranslations();

  const next = nextTier(prestiges);
  const current = currentChapter(completedChapters);
  const completedSet = new Set(completedChapters);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[52] bg-black/92 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShow(false)}
        >
          <div className="min-h-full p-4 flex items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-md mx-auto rounded-xl border border-cyan/40 bg-black/90 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="font-major text-lg text-cyan">{t('progression.title')}</div>
                <button
                  onClick={() => setShow(false)}
                  className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
                >
                  {t('ui.close')}
                </button>
              </div>
              <div className="text-[10px] font-space text-white/60 mb-3">
                {t('chapters.currentMission')}: <span style={{ color: current.accent }}>{t(`chapters.${current.id}.name` as any)}</span>
              </div>

              <div className="mb-3 rounded-md border border-cyan/40 bg-cyan/10 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl"
                    style={{ borderColor: current.accent, color: current.accent, boxShadow: `0 0 22px ${current.glow}` }}
                  >
                    {current.planetGlyph}
                  </div>
                  <div>
                    <div className="text-[9px] font-space tracking-widest text-cyan/80 uppercase">
                      {t('chapters.objective')}
                    </div>
                    <div className="font-space text-xs text-white mt-0.5">
                      {t(`chapters.${current.id}.objective` as any)}
                    </div>
                    <div className="font-space text-[9px] text-white/55 mt-1">
                      {t('chapters.level')} {Math.min(Math.max(levelIdx - current.levelStart + 1, 1), current.levelEnd - current.levelStart + 1)}/{current.levelEnd - current.levelStart + 1} · {t('chapters.bossTier')} T{boss.tier}/{current.finalBossTier}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {CHAPTERS.map((chapter) => {
                  const done = completedSet.has(chapter.id);
                  const active = chapter.id === current.id && !done;
                  const locked = chapter.order > 1 && !completedSet.has(CHAPTERS[chapter.order - 2].id);
                  return (
                    <div
                      key={chapter.id}
                      className="rounded-md border p-2"
                      style={{
                        borderColor: done || active ? chapter.accent : 'rgba(255,255,255,0.12)',
                        background: done || active ? `${chapter.accent}14` : 'rgba(255,255,255,0.03)',
                        opacity: locked ? 0.45 : 1,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-space text-[11px] text-white">
                          {chapter.planetGlyph} {t('chapters.chapter')} {chapter.order}: {t(`chapters.${chapter.id}.name` as any)}
                        </div>
                        <div className="text-xs">{done ? '✓' : locked ? '⌁' : '●'}</div>
                      </div>
                      <div className="font-space text-[9px] text-white/55 mt-0.5">
                        {t(`chapters.${chapter.id}.desc` as any)}
                      </div>
                      <div className="font-space text-[9px] text-white/45 mt-1">
                        {t('chapters.levels')} {chapter.levelStart + 1}-{chapter.levelEnd + 1} · {t('chapters.finalBoss')} T{chapter.finalBossTier}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="font-space text-[9px] tracking-widest text-white/45 uppercase mb-2">
                  {t('progression.deepSystems')}
                </div>
                {next && (
                  <div className="mb-2 rounded-md border border-white/15 bg-white/[0.03] p-2">
                    <div className="text-[9px] font-space tracking-widest text-cyan/70">
                      {t('progression.comingNext')}
                    </div>
                    <div className="font-space text-xs text-white mt-0.5">
                      {t(`progression.${next.key}.name`)}
                    </div>
                  </div>
                )}
                {TIERS.map((tier) => {
                  const done = tier.unlocked(prestiges);
                  return (
                    <div
                      key={tier.key}
                      className="rounded-md border p-2"
                      style={{
                        borderColor: done ? 'rgba(255,209,102,0.6)' : 'rgba(255,255,255,0.12)',
                        background: done ? 'rgba(255,209,102,0.08)' : 'rgba(255,255,255,0.03)',
                        opacity: done ? 1 : 0.6,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-space text-[11px] text-white">
                          {t(`progression.${tier.key}.name`)}
                        </div>
                        <div className="text-xs">{done ? '✓' : '🔒'}</div>
                      </div>
                      <div className="font-space text-[9px] text-white/55 mt-0.5">
                        {t(`progression.${tier.key}.desc`)}
                      </div>
                      {tier.key === 'tier10' && done && (
                        <button
                          onClick={() => {
                            setShow(false);
                            setShowShop(true);
                          }}
                          className="mt-1.5 text-[10px] font-space border border-cyan/50 text-cyan rounded px-2 py-0.5"
                        >
                          {t('ui.shop')} →
                        </button>
                      )}
                      {tier.key === 'tier25' && (
                        <div className="mt-1 text-[9px] font-space text-pink/70">
                          {t('ui.comingSoon')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
