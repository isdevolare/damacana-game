'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';
import { chapterById } from '@/lib/config/chapters';

export function ChapterCompleteModal() {
  const complete = useGame((s) => s.showChapterComplete);
  const dismiss = useGame((s) => s.dismissChapterComplete);
  const t = useTranslations();

  if (!complete) return null;
  const chapter = chapterById(complete.chapterId);
  const next = complete.nextChapterId ? chapterById(complete.nextChapterId) : null;
  const starArcUnlocked = chapter.id === 'neptune' && next?.arcId === 'star';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[57] flex items-center justify-center overflow-hidden bg-black/80 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-sm sm:p-4"
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.82, opacity: 0 }}
          className="max-h-[calc(100dvh_-_1.5rem_-_env(safe-area-inset-bottom))] w-full max-w-sm overflow-y-auto rounded-xl border bg-black/90 p-4 text-center sm:p-5"
          style={{ borderColor: chapter.accent, boxShadow: `0 0 34px ${chapter.glow}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border text-3xl" style={{ borderColor: chapter.accent, color: chapter.accent }}>
            {chapter.planetGlyph}
          </div>
          <div className="font-space text-[10px] tracking-[0.35em] text-cyan/80 uppercase">
            {t('chapters.completed')}
          </div>
          <div className="mt-2 font-major text-2xl" style={{ color: chapter.accent }}>
            {t(`chapters.${chapter.id}.name` as any)}
          </div>
          <div className="mt-3 font-space text-xs text-white/65">
            {t(`chapters.${chapter.id}.complete` as any)}
          </div>
          {next && (
            <div className="mt-4 rounded-md border border-white/15 bg-white/[0.04] p-3 font-space text-[11px] text-white/70">
              {starArcUnlocked ? t('arcs.starUnlocked') : t('chapters.unlocked')}: <span style={{ color: next.accent }}>{next.planetGlyph} {t(`chapters.${next.id}.name` as any)}</span>
            </div>
          )}
          <button
            onClick={dismiss}
            className="mt-5 rounded-md border border-cyan/50 bg-cyan/10 px-4 py-2 font-space text-xs uppercase tracking-widest text-cyan"
          >
            {t('ui.close')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
