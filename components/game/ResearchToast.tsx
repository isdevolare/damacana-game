'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';
import { researchById } from '@/lib/config/research';

export function ResearchToast() {
  const notice = useGame((s) => s.researchCompletedNotice);
  const dismiss = useGame((s) => s.dismissResearchNotice);
  const t = useTranslations('research');
  const research = notice ? researchById(notice) : null;

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(dismiss, 4200);
    return () => clearTimeout(id);
  }, [notice, dismiss]);

  return (
    <AnimatePresence>
      {notice && research && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-24 left-1/2 z-[70] w-[min(92vw,360px)] -translate-x-1/2 rounded-lg border border-cyan/35 bg-black/90 px-4 py-3 text-center shadow-[0_0_24px_rgba(92,246,255,0.2)]"
          onClick={dismiss}
        >
          <div className="font-space text-[10px] uppercase tracking-[0.22em] text-cyan">
            {t('completedNotice', { name: t(`items.${research.i18nKey}.name` as any) })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

