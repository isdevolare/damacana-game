'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { audio } from '@/lib/audio/AudioEngine';

const RARITY_STYLE = {
  common: 'border-cyan/45 text-cyan shadow-[0_0_26px_rgba(92,246,255,0.16)]',
  rare: 'border-purple/55 text-purple shadow-[0_0_28px_rgba(184,122,255,0.18)]',
  anomaly: 'border-gold/60 text-gold shadow-[0_0_30px_rgba(255,209,102,0.18)]',
  corrupted: 'border-danger/65 text-danger shadow-[0_0_32px_rgba(255,61,110,0.2)]',
  singularity: 'border-pink/70 text-pink shadow-[0_0_34px_rgba(255,92,232,0.22)]',
};

export function EventPopup() {
  const ev = useGame((s) => s.currentEvent);
  const resolve = useGame((s) => s.resolveEventChoice);
  const dismiss = useGame((s) => s.dismissEvent);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('events');

  useEffect(() => {
    if (!ev) return;
    if (sfxEnabled) audio.sfxEventDing();
  }, [ev, sfxEnabled, dismiss]);

  return (
    <AnimatePresence>
      {ev && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="pointer-events-none fixed left-1/2 top-[4.5rem] z-40 w-[94%] max-w-md -translate-x-1/2 sm:top-20 sm:w-[88%]"
        >
          <div
            className={`pointer-events-auto rounded-lg border bg-black/90 p-3 backdrop-blur-sm ${RARITY_STYLE[ev.rarity]}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="font-major text-sm uppercase tracking-wide text-white/90">
                {t(`${ev.i18nKey}.title`)}
              </div>
              <div className="shrink-0 font-space text-[8px] uppercase tracking-[0.24em] opacity-80">
                {t(`rarity.${ev.rarity}`)}
              </div>
            </div>
            <div className="font-space text-xs leading-snug text-white/70">
              {t(`${ev.i18nKey}.text`)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ev.choices.map((c) => (
                <button
                  key={c.key}
                  onClick={() => resolve(c.key)}
                  className="min-h-14 rounded-md border border-white/15 bg-white/[0.04] px-2 py-2 text-left transition active:scale-[0.98] hover:bg-white/[0.08]"
                >
                  <div className="font-space text-[10px] uppercase tracking-[0.18em] text-white/90">
                    {t(`${ev.i18nKey}.${c.key}`)}
                  </div>
                  <div className="mt-1 whitespace-pre-line font-space text-[9px] leading-snug text-cyan/70">
                    {t(`${ev.i18nKey}.${c.key}Preview`)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
