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
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <div className="font-major text-3xl text-purple drop-shadow-[0_0_18px_rgba(184,122,255,0.7)]">
        damacana.exe
      </div>
      <div className="font-space text-[10px] tracking-[0.4em] text-white/50 mt-2">
        v1
      </div>
      <button
        onClick={async () => {
          await audio.start(levelIdx, settings);
          start();
        }}
        className="mt-10 px-6 py-3 font-space tracking-[0.3em] uppercase text-xs border border-purple/60 bg-purple/15 text-purple rounded-md hover:bg-purple/25 animate-pulse2"
      >
        {t('tapToStart')}
      </button>
    </motion.div>
  );
}
