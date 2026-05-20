'use client';

import { useGame } from '@/lib/store';
import { activeLevels } from '@/lib/config/levels';
import { currentChapter } from '@/lib/config/chapters';
import { useTranslations } from 'next-intl';

export function TopBar() {
  const levelIdx = useGame((s) => s.levelIdx);
  const setShowTree = useGame((s) => s.setShowTree);
  const setShowSettings = useGame((s) => s.setShowSettings);
  const setShowCodex = useGame((s) => s.setShowCodex);
  const setShowAchievements = useGame((s) => s.setShowAchievements);
  const setShowProfile = useGame((s) => s.setShowProfile);
  const setShowProgression = useGame((s) => s.setShowProgression);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const completedChapters = useGame((s) => s.completedChapters);
  const collectedFacts = useGame((s) => s.collectedFacts);
  const shards = useGame((s) => s.shards);
  const totalPlayMs = useGame((s) => s.totalPlayMs);
  const t = useTranslations();

  const levels = activeLevels(totalPrestiges);
  const lv = levels[Math.min(levelIdx, levels.length - 1)];
  const chapter = currentChapter(completedChapters);
  const showAdvanced = totalPlayMs >= 5 * 60 * 1000 || shards > 0 || totalPrestiges > 0;

  return (
    <div className="flex items-start justify-between px-3 pt-3 gap-2">
      <div className="flex-1">
        <div className="text-[9px] font-space tracking-[0.28em] text-white/50 uppercase">
          {t('chapters.chapter')} {chapter.order} · {chapter.planetGlyph} {t(`chapters.${chapter.id}.name` as any)}
        </div>
        <div className="font-major text-sm drop-shadow-[0_0_10px_rgba(92,246,255,0.45)]" style={{ color: chapter.accent }}>
          {t(`levels.${lv.key}.name` as any)}
        </div>
        <div className="text-[8px] font-space tracking-widest text-cyan/60 mt-0.5 uppercase">
          {t('chapters.level')} {Math.max(1, levelIdx - chapter.levelStart + 1)}/{chapter.levelEnd - chapter.levelStart + 1} · {t('chapters.finalBoss')} T{chapter.finalBossTier}
          {totalPrestiges > 0 && <span className="ml-2 text-pink">★{totalPrestiges}</span>}
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => setShowProgression(true)}
          className="w-9 h-9 rounded-md border border-cyan/50 bg-cyan/10 text-cyan text-base"
          aria-label="chapter progression"
        >
          {chapter.planetGlyph}
        </button>
        <button
          onClick={() => setShowProfile(true)}
          className="w-9 h-9 rounded-md border border-white/25 bg-white/5 text-white/80 text-base"
          aria-label="profile"
        >
          ◉
        </button>
        <button
          onClick={() => setShowCodex(true)}
          className="w-9 h-9 rounded-md border border-gold/40 bg-gold/5 text-gold text-base disabled:opacity-35"
          disabled={collectedFacts.length === 0 && !showAdvanced}
          aria-label="knowledge codex"
        >
          ◫
        </button>
        <button
          onClick={() => setShowAchievements(true)}
          className="w-9 h-9 rounded-md border border-gold/30 bg-gold/5 text-gold text-base opacity-75"
          aria-label="achievements"
        >
          ◇
        </button>
        <button
          onClick={() => setShowTree(true)}
          className="w-9 h-9 rounded-md border border-purple/40 bg-purple/10 text-purple font-vt text-lg disabled:opacity-30"
          disabled={!showAdvanced}
          aria-label="skill tree"
        >
          ✦
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-md border border-white/20 bg-white/5 text-white/70 font-vt text-lg"
          aria-label="settings"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
