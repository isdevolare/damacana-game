'use client';

import { useGame } from '@/lib/store';
import { activeLevels } from '@/lib/config/levels';
import { currentChapter } from '@/lib/config/chapters';
import { systemRequirementKey, systemUnlocked } from '@/lib/config/systemUnlocks';
import { skillTierRequirementKey, skillTierUnlocked } from '@/lib/config/skillTree';
import { useTranslations } from 'next-intl';

export function TopBar() {
  const levelIdx = useGame((s) => s.levelIdx);
  const setShowTree = useGame((s) => s.setShowTree);
  const setShowSettings = useGame((s) => s.setShowSettings);
  const setShowCodex = useGame((s) => s.setShowCodex);
  const setShowAchievements = useGame((s) => s.setShowAchievements);
  const setShowProgression = useGame((s) => s.setShowProgression);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const completedChapters = useGame((s) => s.completedChapters);
  const boss = useGame((s) => s.boss);
  const collectedFacts = useGame((s) => s.collectedFacts);
  const shards = useGame((s) => s.shards);
  const totalPlayMs = useGame((s) => s.totalPlayMs);
  const t = useTranslations();

  const levels = activeLevels(totalPrestiges);
  const lv = levels[Math.min(levelIdx, levels.length - 1)];
  const chapter = currentChapter(completedChapters);
  const showAdvanced = totalPlayMs >= 5 * 60 * 1000 || shards > 0 || totalPrestiges > 0;
  const unlockCtx = { bossTier: boss.tier, completedChapters, totalPrestiges, shards };
  const treeUnlocked = skillTierUnlocked(1, { bossTier: boss.tier, totalPrestiges });
  const codexUnlocked = collectedFacts.length > 0 || showAdvanced || systemUnlocked('codexAdvanced', unlockCtx);
  const chapterLevel = Math.min(Math.max(boss.tier - chapter.levelStart + 1, 1), chapter.levelEnd - chapter.levelStart + 1);

  return (
    <div className="flex min-w-0 items-start justify-between gap-1.5 px-2 pt-2 sm:gap-2 sm:px-3 sm:pt-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[8px] font-space uppercase tracking-[0.2em] text-white/50 sm:text-[9px] sm:tracking-[0.28em]">
          {t('chapters.chapter')} {chapter.order} · {chapter.planetGlyph} {t(`chapters.${chapter.id}.name` as any)}
        </div>
        <div className="truncate font-major text-xs drop-shadow-[0_0_10px_rgba(92,246,255,0.45)] sm:text-sm" style={{ color: chapter.accent }}>
          {t(`levels.${lv.key}.name` as any)}
        </div>
        <div className="mt-0.5 truncate text-[7px] font-space uppercase tracking-wider text-cyan/60 sm:text-[8px] sm:tracking-widest">
          {t('arcs.planet.name')} · {t('chapters.level')} {chapterLevel}/{chapter.levelEnd - chapter.levelStart + 1} · {t('chapters.finalBoss')} T{chapter.finalBossTier}
          {totalPrestiges > 0 && <span className="ml-2 text-pink">★{totalPrestiges}</span>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1 sm:gap-1.5">
        <button
          onClick={() => setShowProgression(true)}
          className="h-8 w-8 rounded-md border border-cyan/50 bg-cyan/10 text-sm text-cyan sm:h-9 sm:w-9 sm:text-base"
          aria-label="chapter progression"
        >
          {chapter.planetGlyph}
        </button>
        <button
          onClick={() => setShowCodex(true)}
          className="h-8 w-8 rounded-md border border-gold/40 bg-gold/5 text-sm text-gold disabled:opacity-35 sm:h-9 sm:w-9 sm:text-base"
          disabled={!codexUnlocked}
          aria-label="knowledge codex"
          title={codexUnlocked ? 'knowledge codex' : t(`ui.${systemRequirementKey('codexAdvanced')}` as any)}
        >
          ◫
        </button>
        <button
          onClick={() => setShowAchievements(true)}
          className="h-8 w-8 rounded-md border border-gold/30 bg-gold/5 text-sm text-gold opacity-75 sm:h-9 sm:w-9 sm:text-base"
          aria-label="achievements"
        >
          ◇
        </button>
        <button
          onClick={() => setShowTree(true)}
          className="h-8 w-8 rounded-md border border-purple/40 bg-purple/10 font-vt text-base text-purple disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
          disabled={!treeUnlocked}
          aria-label="skill tree"
          title={treeUnlocked ? 'skill tree' : t(`tree.${skillTierRequirementKey(1)}` as any)}
        >
          ✦
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="h-8 w-8 rounded-md border border-white/20 bg-white/5 font-vt text-base text-white/70 sm:h-9 sm:w-9 sm:text-lg"
          aria-label="settings"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
