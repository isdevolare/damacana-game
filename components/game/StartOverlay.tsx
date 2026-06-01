'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { useTranslations } from 'next-intl';

export function StartOverlay() {
  const has = useGame((s) => s.hasStarted);
  const start = useGame((s) => s.start);
  const settings = useGame((s) => s.audio);
  const levelIdx = useGame((s) => s.levelIdx);
  const t = useTranslations('ui');

  if (has) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex w-full flex-col items-center justify-center overflow-hidden bg-black/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-sm"
    >
      <div className="max-w-[92vw] break-words text-center font-major text-2xl text-purple drop-shadow-[0_0_18px_rgba(184,122,255,0.7)] sm:text-3xl">
        damacana.exe
      </div>
      <div className="font-space text-[10px] tracking-[0.4em] text-white/50 mt-2">
        v1
      </div>
      <button
        onClick={async () => {
          try {
            await audio.start(levelIdx, settings);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Audio start skipped', error);
            }
          }
          start();
        }}
        className="mt-10 max-w-[88vw] rounded-md border border-purple/60 bg-purple/15 px-5 py-3 font-space text-[11px] uppercase tracking-[0.24em] text-purple animate-pulse2 hover:bg-purple/25 sm:px-6 sm:text-xs sm:tracking-[0.3em]"
      >
        {t('tapToStart')}
      </button>
    </motion.div>
  );
}
