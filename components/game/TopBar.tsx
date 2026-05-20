'use client';

import { useGame } from '@/lib/store';
import { activeLevels } from '@/lib/config/levels';
import { nextTier } from '@/lib/config/progression';
import { useTranslations } from 'next-intl';

export function TopBar() {
  const levelIdx = useGame((s) => s.levelIdx);
  const setShowTree = useGame((s) => s.setShowTree);
  const setShowSettings = useGame((s) => s.setShowSettings);
  const setShowCodex = useGame((s) => s.setShowCodex);
  const setShowAchievements = useGame((s) => s.setShowAchievements);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const t = useTranslations();

  const levels = activeLevels(totalPrestiges);
  const lv = levels[Math.min(levelIdx, levels.length - 1)];
  const next = nextTier(totalPrestiges);

  return (
    <div className="flex items-start justify-between px-3 pt-3 gap-2">
      <div className="flex-1">
        <div className="text-[9px] font-space tracking-[0.3em] text-white/50">
          {t('ui.level')} {levelIdx + 1}/{levels.length}
          {totalPrestiges > 0 && <span className="ml-2 text-pink">★{totalPrestiges}</span>}
        </div>
        <div className="font-major text-sm text-purple drop-shadow-[0_0_10px_rgba(184,122,255,0.5)]">
          {t(`levels.${lv.key}.name` as any)}
        </div>
        {next && (
          <div className="text-[8px] font-space tracking-widest text-cyan/60 mt-0.5">
            {t('ui.comingNext')}: {t(`progression.${next.key}.name`)}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowCodex(true)}
          className="w-9 h-9 rounded-md border border-gold/50 bg-gold/10 text-gold text-base"
          aria-label="knowledge codex"
        >
          📚
        </button>
        <button
          onClick={() => setShowAchievements(true)}
          className="w-9 h-9 rounded-md border border-gold/40 bg-gold/5 text-gold text-base"
          aria-label="achievements"
        >
          🏆
        </button>
        <button
          onClick={() => setShowTree(true)}
          className="w-9 h-9 rounded-md border border-purple/50 bg-purple/10 text-purple font-vt text-lg"
          aria-label="skill tree"
        >
          ◇
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
