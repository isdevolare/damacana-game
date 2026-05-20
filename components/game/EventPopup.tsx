'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { audio } from '@/lib/audio/AudioEngine';

export function EventPopup() {
  const ev = useGame((s) => s.currentEvent);
  const resolve = useGame((s) => s.resolveEventChoice);
  const dismiss = useGame((s) => s.dismissEvent);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('events');

  useEffect(() => {
    if (!ev) return;
    if (sfxEnabled) audio.sfxEventDing();
    if (ev.kind === 'auto') {
      const id = setTimeout(() => dismiss(), 4000);
      return () => clearTimeout(id);
    }
  }, [ev, sfxEnabled, dismiss]);

  return (
    <AnimatePresence>
      {ev && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-md pointer-events-none"
        >
          <div
            className={`rounded-lg border bg-black/85 backdrop-blur-sm p-3 shadow-[0_0_30px_rgba(255,92,232,0.25)] pointer-events-auto ${
              ev.kind === 'crisis' ? 'border-danger/70' : 'border-pink/60'
            }`}
          >
            <div className={`text-[9px] font-space tracking-[0.3em] mb-1 ${
              ev.kind === 'crisis' ? 'text-danger' : 'text-pink'
            }`}>
              {ev.kind === 'crisis' ? 'CRISIS' : 'EVENT'}
            </div>
            <div className="font-space text-sm text-white/90 leading-snug">
              {t(`${ev.i18nKey}.text`)}
            </div>
            {ev.kind !== 'auto' && ev.choices && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {ev.choices.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => resolve(c.key)}
                    className="text-[11px] font-space uppercase tracking-wider border border-cyan/50 bg-cyan/10 text-cyan rounded-md px-2 py-1.5 hover:bg-cyan/20"
                  >
                    {t(`${ev.i18nKey}.${c.key}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
