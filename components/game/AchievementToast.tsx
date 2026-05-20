'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { audio } from '@/lib/audio/AudioEngine';

export function AchievementToast() {
  const toast = useGame((s) => s.achievementToast);
  const dismiss = useGame((s) => s.dismissAchievementToast);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('achievements');

  useEffect(() => {
    if (!toast) return;
    if (sfxEnabled) audio.sfxTreeUnlock();
    const id = setTimeout(() => dismiss(), 3000);
    return () => clearTimeout(id);
  }, [toast, sfxEnabled, dismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[58] w-[88%] max-w-sm"
        >
          <div className="flex items-center gap-3 rounded-lg border border-gold/60 bg-black/90 backdrop-blur-sm p-3 shadow-[0_0_24px_rgba(255,209,102,0.3)]">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="text-[9px] font-space tracking-[0.3em] text-gold/80">
                ACHIEVEMENT
              </div>
              <div className="font-space text-sm text-white">{t(`${toast}.name`)}</div>
              <div className="font-space text-[10px] text-white/55">{t(`${toast}.desc`)}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
