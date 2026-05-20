'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { LEVELS } from '@/lib/config/levels';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { audio } from '@/lib/audio/AudioEngine';

export function EvolutionOverlay() {
  const showEvo = useGame((s) => s.showEvolution);
  const levelIdx = useGame((s) => s.levelIdx);
  const dismiss = useGame((s) => s.dismissEvolution);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('levels');

  useEffect(() => {
    if (showEvo) {
      if (sfxEnabled) audio.sfxEvolution();
      const id = setTimeout(() => dismiss(), 3000);
      return () => clearTimeout(id);
    }
  }, [showEvo, sfxEnabled, dismiss]);

  if (!showEvo) return null;
  const lv = LEVELS[levelIdx];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          className="text-center px-8"
        >
          <div className="font-space text-[10px] tracking-[0.4em] text-cyan/80 mb-2">
            EVOLUTION
          </div>
          <motion.div
            animate={{ opacity: [1, 0.3, 1, 0.5, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
            className="font-major text-[32px] text-pink drop-shadow-[0_0_20px_rgba(255,92,232,0.8)]"
          >
            {t(`${lv.key}.name`)}
          </motion.div>
          <div className="font-space text-xs text-white/70 mt-3 max-w-xs">
            {t(`${lv.key}.desc`)}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
