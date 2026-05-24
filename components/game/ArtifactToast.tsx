'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { artifactById } from '@/lib/config/artifacts';
import { useGame } from '@/lib/store';

export function ArtifactToast() {
  const toast = useGame((s) => s.artifactToast);
  const dismiss = useGame((s) => s.dismissArtifactToast);
  const t = useTranslations();
  const artifact = toast ? artifactById(toast.artifactId) : undefined;

  useEffect(() => {
    if (!toast) return;
    const delay = Math.max(600, toast.expiresAt - Date.now());
    const id = setTimeout(() => dismiss(), delay);
    return () => clearTimeout(id);
  }, [dismiss, toast]);

  return (
    <AnimatePresence>
      {toast && artifact && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[70] w-[min(90vw,340px)] -translate-x-1/2 rounded-lg border border-gold/40 bg-black/88 px-3 py-2 text-center shadow-[0_0_24px_rgba(255,209,102,0.18)] backdrop-blur-sm"
        >
          <div className="font-space text-[8px] uppercase tracking-[0.24em] text-gold/75">
            {toast.convertedShards > 0 ? t('artifacts.converted') : t('artifacts.drop')}
          </div>
          <div className="mt-0.5 font-space text-[11px] uppercase tracking-[0.16em] text-white">
            {t(`artifacts.items.${artifact.i18nKey}.name` as any)}
          </div>
          <div className="mt-1 font-space text-[9px] uppercase tracking-wider text-white/55">
            {toast.convertedShards > 0
              ? `+${toast.convertedShards} ${t('ui.shards')}`
              : `${t(`artifacts.rarity.${artifact.rarity}` as any)} · Lv ${toast.level}`}
          </div>
          <div className="mt-1 font-space text-[8px] uppercase tracking-wider text-cyan/80">
            {t(`artifacts.items.${artifact.i18nKey}.effect` as any)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

