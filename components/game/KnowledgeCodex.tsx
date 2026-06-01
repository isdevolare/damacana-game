'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { FACTS, CATEGORIES, CATEGORY_COLOR, CATEGORY_GLYPH, FactCategory } from '@/lib/config/facts';
import { clsx } from '@/lib/util';

export function KnowledgeCodex() {
  const show = useGame((s) => s.showCodex);
  const setShow = useGame((s) => s.setShowCodex);
  const collected = useGame((s) => s.collectedFacts);
  const openFact = useGame((s) => (id: string) => useGame.setState({ currentFact: id }));
  const t = useTranslations();
  const [filter, setFilter] = useState<FactCategory | 'all'>('all');

  const collectedSet = new Set(collected);
  const list = FACTS.filter((f) => filter === 'all' || f.category === filter);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/92 backdrop-blur-sm"
        >
          <div className="mx-auto min-h-full w-full max-w-md p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:max-w-3xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-major text-lg text-gold">{t('ui.codex')}</div>
                <div className="text-[10px] font-space text-white/60">
                  {collected.length} / {FACTS.length} {t('ui.unlocked')}
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
              >
                {t('ui.close')}
              </button>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
              <div
                className="h-full bg-gold transition-[width]"
                style={{ width: `${(collected.length / FACTS.length) * 100}%`, boxShadow: '0 0 10px #ffd166' }}
              />
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={clsx('text-[10px] font-space px-2 py-1 rounded border',
                  filter === 'all' ? 'border-white/60 text-white' : 'border-white/15 text-white/50')}
              >
                {t('ui.all')}
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={clsx('text-[10px] font-space px-2 py-1 rounded border')}
                  style={{
                    borderColor: filter === c ? CATEGORY_COLOR[c] : 'rgba(255,255,255,0.15)',
                    color: filter === c ? CATEGORY_COLOR[c] : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {CATEGORY_GLYPH[c]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 min-[390px]:grid-cols-3">
              {list.map((f) => {
                const owned = collectedSet.has(f.id);
                const color = CATEGORY_COLOR[f.category];
                return (
                  <button
                    key={f.id}
                    disabled={!owned}
                    onClick={() => owned && openFact(f.id)}
                    className="rounded-md border p-2 text-left min-h-[64px] flex flex-col justify-between"
                    style={{
                      borderColor: owned ? color : 'rgba(255,255,255,0.12)',
                      background: owned ? `${color}14` : 'rgba(255,255,255,0.03)',
                      opacity: owned ? 1 : 0.5,
                    }}
                  >
                    <div className="text-sm">{CATEGORY_GLYPH[f.category]}</div>
                    <div className="text-[9px] font-space leading-tight" style={{ color: owned ? '#fff' : '#888' }}>
                      {owned ? t(`facts.${f.id}.title`) : '???'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
