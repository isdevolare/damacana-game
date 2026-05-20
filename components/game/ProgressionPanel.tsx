'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { TIERS, nextTier } from '@/lib/config/progression';

export function ProgressionPanel() {
  const show = useGame((s) => s.showProgression);
  const setShow = useGame((s) => s.setShowProgression);
  const setShowShop = useGame((s) => s.setShowShop);
  const prestiges = useGame((s) => s.totalPrestiges);
  const t = useTranslations();

  const next = nextTier(prestiges);

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
            <div className="w-full max-w-md mx-auto rounded-xl border border-pink/50 bg-black/90 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="font-major text-lg text-pink">{t('progression.title')}</div>
                <button
                  onClick={() => setShow(false)}
                  className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
                >
                  {t('ui.close')}
                </button>
              </div>
              <div className="text-[10px] font-space text-white/60 mb-3">
                {t('progression.current')}: <span className="text-pink">★{prestiges}</span>
              </div>

              {next && (
                <div className="mb-3 rounded-md border border-cyan/40 bg-cyan/10 p-2">
                  <div className="text-[9px] font-space tracking-widest text-cyan/80">
                    {t('progression.comingNext')}
                  </div>
                  <div className="font-space text-xs text-white mt-0.5">
                    {t(`progression.${next.key}.name`)}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
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
