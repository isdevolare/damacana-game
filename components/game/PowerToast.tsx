'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';

export function PowerToast() {
  const toast = useGame((s) => s.powerToast);
  const dismiss = useGame((s) => s.dismissPowerToast);
  const t = useTranslations('ui');

  useEffect(() => {
    if (!toast) return;
    const delay = Math.max(500, toast.expiresAt - Date.now());
    const id = setTimeout(() => dismiss(), delay);
    return () => clearTimeout(id);
  }, [dismiss, toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] left-1/2 z-[58] w-[min(88vw,260px)] -translate-x-1/2 rounded-lg border border-cyan/35 bg-black/86 px-3 py-2 text-center shadow-[0_0_24px_rgba(92,246,255,0.16)] backdrop-blur-sm"
        >
          <div className="font-space text-[9px] uppercase tracking-[0.22em] text-white/50">
            {t('powerChanged')}
          </div>
          <div className="mt-0.5 font-space text-[11px] uppercase tracking-[0.14em] text-cyan">
            {t(`powerFeedback.${toast.labelKey}` as any)}
            {toast.amount ? <span className="ml-2 text-gold">{toast.amount}</span> : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
