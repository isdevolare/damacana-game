'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';

const STEPS = ['shipControl', 'autoFire', 'tapBurst', 'upgrades', 'bossPhases', 'advancedLater'] as const;

export function TutorialOverlay() {
  const show = useGame((s) => s.showTutorial);
  const complete = useGame((s) => s.completeTutorial);
  const [step, setStep] = useState(0);
  const t = useTranslations('onboarding');
  const current = STEPS[Math.min(step, STEPS.length - 1)];
  const last = step >= STEPS.length - 1;

  const finish = () => {
    setStep(0);
    complete();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[59] flex justify-center px-3"
        >
          <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-cyan/40 bg-black/90 p-3 shadow-[0_0_24px_rgba(92,246,255,0.14)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="font-space text-[8px] uppercase tracking-[0.24em] text-cyan/75">
                {t('kicker')} {step + 1}/{STEPS.length}
              </div>
              <button
                type="button"
                onClick={finish}
                className="rounded border border-white/15 px-2 py-1 font-space text-[8px] uppercase tracking-[0.16em] text-white/55"
              >
                {t('skip')}
              </button>
            </div>
            <div className="font-space text-[12px] leading-relaxed text-white/82">
              {t(`steps.${current}`)}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {STEPS.map((item, index) => (
                  <span
                    key={item}
                    className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-cyan/75' : 'bg-white/12'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => (last ? finish() : setStep((value) => value + 1))}
                className="rounded-md border border-cyan/45 bg-cyan/10 px-3 py-1.5 font-space text-[9px] uppercase tracking-[0.18em] text-cyan"
              >
                {last ? t('done') : t('next')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
