'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { ACHIEVEMENTS } from '@/lib/config/achievements';

export function AchievementsModal() {
  const show = useGame((s) => s.showAchievements);
  const setShow = useGame((s) => s.setShowAchievements);
  const owned = useGame((s) => s.achievements);
  const t = useTranslations();

  const ownedSet = new Set(owned);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/92 backdrop-blur-sm"
        >
          <div className="mx-auto min-h-full w-full max-w-md p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-major text-lg text-gold">{t('ui.achievements')}</div>
                <div className="text-[10px] font-space text-white/60">
                  {owned.length} / {ACHIEVEMENTS.length} {t('ui.unlocked')}
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
              >
                {t('ui.close')}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {ACHIEVEMENTS.map((a) => {
                const has = ownedSet.has(a.id);
                return (
                  <div
                    key={a.id}
                    className="rounded-md border p-2 flex items-start gap-2"
                    style={{
                      borderColor: has ? 'rgba(255,209,102,0.6)' : 'rgba(255,255,255,0.12)',
                      background: has ? 'rgba(255,209,102,0.08)' : 'rgba(255,255,255,0.03)',
                      opacity: has ? 1 : 0.55,
                    }}
                  >
                    <div className="text-lg">{has ? '🏆' : '🔒'}</div>
                    <div>
                      <div className="font-space text-[11px] text-white leading-tight">
                        {t(`achievements.${a.id}.name`)}
                      </div>
                      <div className="font-space text-[9px] text-white/55 mt-0.5">
                        {t(`achievements.${a.id}.desc`)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
