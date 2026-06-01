'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';
import { fmt } from '@/lib/util';

function formatDuration(ms: number) {
  const totalSeconds = Math.max(1, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function OfflineReturnModal() {
  const reward = useGame((s) => s.offlineReward);
  const dismiss = useGame((s) => s.dismissOfflineReward);
  const t = useTranslations();

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[56] flex items-center justify-center overflow-hidden bg-black/70 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-sm sm:p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            className="max-h-[calc(100dvh_-_1.5rem_-_env(safe-area-inset-bottom))] w-full max-w-sm overflow-y-auto rounded-xl border border-purple/50 bg-black/90 p-4 text-center shadow-[0_0_28px_rgba(184,122,255,0.24)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-major text-lg text-purple">{t('offline.title')}</div>
            <div className="mt-3 font-space text-xs leading-relaxed text-white/70">
              {t('offline.body', { time: formatDuration(reward.awayMs), amount: fmt(reward.gained) })}
            </div>
            <button
              onClick={dismiss}
              className="mt-5 rounded-md border border-purple/60 bg-purple/15 px-4 py-2 font-space text-xs uppercase tracking-widest text-purple"
            >
              {t('ui.close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
