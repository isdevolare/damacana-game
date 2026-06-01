'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { factById, CATEGORY_COLOR, CATEGORY_GLYPH, FACTS } from '@/lib/config/facts';
import { CategoryArt } from '@/lib/svg/categoryArt';
import { audio } from '@/lib/audio/AudioEngine';

export function FactCard() {
  const factId = useGame((s) => s.currentFact);
  const close = useGame((s) => s.closeFactCard);
  const collected = useGame((s) => s.collectedFacts);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations();
  const [glitching, setGlitching] = useState(true);

  useEffect(() => {
    if (!factId) return;
    setGlitching(true);
    if (sfxEnabled) audio.sfxEvolution();
    const id = setTimeout(() => setGlitching(false), 1000);
    return () => clearTimeout(id);
  }, [factId, sfxEnabled]);

  if (!factId) return null;
  const fact = factById(factId);
  if (!fact) return null;
  const color = CATEGORY_COLOR[fact.category];
  const alreadyHad = collected.includes(factId);
  const unlockedCount = collected.length + (alreadyHad ? 0 : 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center overflow-hidden bg-black/85 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-md sm:p-4"
      >
        {glitching ? (
          <motion.div
            animate={{ opacity: [1, 0.2, 1, 0.4, 1], x: [-4, 4, -2, 2, 0] }}
            transition={{ duration: 1, ease: 'linear' }}
            className="font-major text-2xl"
            style={{ color }}
          >
            {CATEGORY_GLYPH[fact.category]} ...
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[calc(100dvh_-_1.5rem_-_env(safe-area-inset-bottom))] w-full max-w-md overflow-y-auto rounded-xl border bg-black/90 p-4 sm:p-5"
            style={{ borderColor: color }}
          >
            <div className="text-[11px] font-space tracking-[0.3em] mb-3" style={{ color }}>
              {CATEGORY_GLYPH[fact.category]} {t(`categories.${fact.category}.name`).toUpperCase()}
            </div>
            <div
              className="mx-auto mb-4 w-28 h-28 rounded-lg border flex items-center justify-center"
              style={{ borderColor: `${color}55` }}
            >
              <CategoryArt category={fact.category} />
            </div>
            <div className="font-major text-lg text-white mb-2">
              {t(`facts.${factId}.title`)}
            </div>
            <p className="font-space text-[13px] text-white/80 leading-relaxed">
              {t(`facts.${factId}.body`)}
            </p>
            <div className="mt-3 rounded-md border border-white/15 bg-white/5 p-2">
              <div className="text-[10px] font-space tracking-widest text-gold mb-1">
                💡 {t('ui.didYouKnow')}
              </div>
              <p className="font-space text-[12px] text-white/70 italic">
                {t(`facts.${factId}.twist`)}
              </p>
            </div>
            <div className="mt-3 font-vt text-base text-gold">
              {t('ui.reward')}: +{fact.rewardShards} ◇{alreadyHad ? ' (collected)' : ''}
            </div>
            <button
              onClick={() => {
                if (sfxEnabled) audio.sfxUpgrade();
                close();
              }}
              className="mt-4 w-full py-2.5 rounded-md border font-space text-sm tracking-widest uppercase"
              style={{ borderColor: color, color }}
            >
              {t('ui.close')}
            </button>
            <div className="mt-3 text-center text-[10px] font-space text-white/50">
              {t('ui.codex')}: {unlockedCount} / {FACTS.length}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
