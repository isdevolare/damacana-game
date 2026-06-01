'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ARTIFACTS, artifactById, type ArtifactRarity } from '@/lib/config/artifacts';
import { useGame } from '@/lib/store';

const RARITY_CLASS: Record<ArtifactRarity, string> = {
  common: 'border-cyan/25 bg-cyan/5 text-cyan',
  rare: 'border-purple/35 bg-purple/10 text-purple',
  epic: 'border-pink/35 bg-pink/10 text-pink',
  corrupted: 'border-danger/40 bg-danger/10 text-danger',
  cosmic: 'border-gold/45 bg-gold/10 text-gold',
};

export function ArtifactInventoryModal() {
  const show = useGame((s) => s.showArtifacts);
  const setShow = useGame((s) => s.setShowArtifacts);
  const runArtifacts = useGame((s) => s.runArtifacts ?? []);
  const permanentArtifacts = useGame((s) => s.permanentArtifacts ?? []);
  const t = useTranslations();
  const owned = [
    ...permanentArtifacts.map((item) => ({ ...item, scope: 'permanent' as const })),
    ...runArtifacts.map((item) => ({ ...item, scope: 'run' as const })),
  ].sort((a, b) => {
    const aDef = artifactById(a.id);
    const bDef = artifactById(b.id);
    return ARTIFACTS.indexOf(aDef ?? ARTIFACTS[0]) - ARTIFACTS.indexOf(bDef ?? ARTIFACTS[0]);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/85 p-2 sm:p-6 sm:backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.94, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[calc(var(--app-height,100dvh)_-_1rem_-_env(safe-area-inset-bottom))] w-full max-w-md overflow-hidden rounded-xl border border-gold/35 bg-black/92 shadow-[0_0_20px_rgba(255,209,102,0.08)] sm:max-h-[calc(var(--app-height,100dvh)_-_2rem)] sm:shadow-[0_0_36px_rgba(255,209,102,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 p-4">
              <div className="font-major text-lg text-gold">{t('artifacts.title')}</div>
              <div className="mt-1 font-space text-[10px] uppercase tracking-widest text-white/45">
                {t('artifacts.subtitle')}
              </div>
            </div>
            <div className="max-h-[calc(var(--app-height,100dvh)_-_10rem_-_env(safe-area-inset-bottom))] space-y-2 overflow-y-auto p-2.5 sm:max-h-[66dvh] sm:p-3">
              {owned.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center font-space text-[10px] uppercase tracking-widest text-white/45">
                  {t('artifacts.empty')}
                </div>
              )}
              {owned.map((item) => {
                const def = artifactById(item.id);
                if (!def) return null;
                return (
                  <div key={`${item.scope}-${item.id}`} className={`rounded-lg border p-3 ${RARITY_CLASS[def.rarity]}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-space text-[11px] uppercase tracking-[0.16em] text-white">
                          {t(`artifacts.items.${def.i18nKey}.name` as any)}
                        </div>
                        <div className="mt-1 font-space text-[9px] uppercase tracking-wider text-white/55">
                          {t(`artifacts.rarity.${def.rarity}` as any)} · {t(`artifacts.scope.${item.scope}` as any)} · Lv {item.level}
                        </div>
                      </div>
                      <div className="shrink-0 rounded border border-current/30 px-2 py-1 font-vt text-sm">
                        {t(`artifacts.category.${def.category}` as any)}
                      </div>
                    </div>
                    <div className="mt-2 font-space text-[10px] leading-relaxed text-white/72">
                      {t(`artifacts.items.${def.i18nKey}.effect` as any)}
                    </div>
                    <div className="mt-2 font-space text-[8px] uppercase tracking-[0.18em] text-white/38">
                      {t('artifacts.source')}: {t(`artifacts.sources.${item.source}` as any)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-white/10 p-3">
              <button
                onClick={() => setShow(false)}
                className="w-full rounded-md border border-white/25 py-2 font-space text-xs uppercase tracking-widest text-white/75"
              >
                {t('ui.close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
