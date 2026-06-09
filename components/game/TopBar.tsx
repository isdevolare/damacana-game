'use client';

import { useGame } from '@/lib/store';
import { activeLevels } from '@/lib/config/levels';
import { currentChapter } from '@/lib/config/chapters';
import { systemRequirementKey, systemUnlocked } from '@/lib/config/systemUnlocks';
import { skillTierRequirementKey, skillTierUnlocked } from '@/lib/config/skillTree';
import { ascensionPointGain, ascensionUnlocked } from '@/lib/config/ascension';
import { useLowDensity } from '@/lib/hooks/useLowDensity';
import { useTranslations } from 'next-intl';

export function TopBar() {
  const levelIdx = useGame((s) => s.levelIdx);
  const setShowSettings = useGame((s) => s.setShowSettings);
  const setShowProgression = useGame((s) => s.setShowProgression);
  const setShowPrestige = useGame((s) => s.setShowPrestige);
  const setShowTree = useGame((s) => s.setShowTree);
  const setShowResearch = useGame((s) => s.setShowResearch);
  const setShowBuildTree = useGame((s) => s.setShowBuildTree);
  const setShowArtifacts = useGame((s) => s.setShowArtifacts);
  const setShowAscension = useGame((s) => s.setShowAscension);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const completedChapters = useGame((s) => s.completedChapters);
  const boss = useGame((s) => s.boss);
  const shards = useGame((s) => s.shards);
  const claimedResearchIds = useGame((s) => s.claimedResearchIds);
  const ownedBuildNodeIds = useGame((s) => s.ownedBuildNodeIds);
  const runArtifacts = useGame((s) => s.runArtifacts);
  const permanentArtifacts = useGame((s) => s.permanentArtifacts);
  // backdrop-blur re-rasterizes the content behind this always-visible bar every
  // frame the background changes — expensive on mobile GPUs. Drop it (the opaque
  // bg below covers the same area) on low-density devices.
  const lowDensity = useLowDensity();
  const t = useTranslations();

  const levels = activeLevels(totalPrestiges);
  const lv = levels[Math.min(levelIdx, levels.length - 1)];
  const chapter = currentChapter(completedChapters);
  const arcName = t(`arcs.${chapter.arcId}.name` as any);
  const unlockCtx = { bossTier: boss.tier, completedChapters, totalPrestiges, shards };
  const chapterLevel = Math.min(Math.max(boss.tier - chapter.levelStart + 1, 1), chapter.levelEnd - chapter.levelStart + 1);
  const researchUnlocked = systemUnlocked('research', unlockCtx);
  const buildUnlocked = systemUnlocked('buildTree', unlockCtx);
  const skillTreeUnlocked = skillTierUnlocked(1, { bossTier: boss.tier, totalPrestiges });
  const ascensionCtx = {
    totalPrestiges,
    shards,
    bestBossTier: boss.tier,
    completedChapters,
    claimedResearchCount: claimedResearchIds.length,
    ownedBuildNodeCount: ownedBuildNodeIds.length,
    artifactCount: runArtifacts.length + permanentArtifacts.length,
  };
  const ascensionReady = ascensionUnlocked(ascensionCtx);
  const ascensionGain = ascensionPointGain(ascensionCtx);
  const coreSystems = [
    { key: 'ascension', icon: '⟐', label: t('ui.prestigeManualEntry'), unlocked: true, onClick: () => setShowPrestige(true), accent: 'pink' },
    { key: 'skill', icon: '✦', label: t('ui.skillTree'), unlocked: skillTreeUnlocked, onClick: () => setShowTree(true), accent: 'purple', requirement: `tree.${skillTierRequirementKey(1)}` },
    { key: 'build', icon: '◆', label: t('ui.buildTree'), unlocked: buildUnlocked, onClick: () => setShowBuildTree(true), accent: 'gold', requirement: `ui.${systemRequirementKey('buildTree')}` },
    { key: 'research', icon: '⌬', label: t('ui.research'), unlocked: researchUnlocked, onClick: () => setShowResearch(true), accent: 'purple', requirement: `ui.${systemRequirementKey('research')}` },
    { key: 'artifacts', icon: '✶', label: t('ui.artifacts'), unlocked: true, onClick: () => setShowArtifacts(true), accent: 'cyan' },
    { key: 'mega', icon: '◎', label: ascensionReady && ascensionGain > 0 ? `${t('ui.megaPrestige')} +${ascensionGain}` : t('ui.megaPrestige'), unlocked: ascensionReady, onClick: () => setShowAscension(true), accent: 'pink', requirement: 'ascension.unlockRequirement' },
  ] as const;

  return (
    <div className="px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="flex min-w-0 items-start justify-between gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[8px] font-space uppercase tracking-[0.2em] text-white/50 sm:text-[9px] sm:tracking-[0.28em]">
            {t('chapters.chapter')} {chapter.order} · {chapter.planetGlyph} {t(`chapters.${chapter.id}.name` as any)}
          </div>
          <div className="truncate font-major text-xs drop-shadow-[0_0_10px_rgba(92,246,255,0.45)] sm:text-sm" style={{ color: chapter.accent }}>
            {t(`levels.${lv.key}.name` as any)}
          </div>
          <div className="mt-0.5 truncate text-[7px] font-space uppercase tracking-wider text-cyan/60 sm:text-[8px] sm:tracking-widest">
            {arcName} · {t('chapters.level')} {chapterLevel}/{chapter.levelEnd - chapter.levelStart + 1} · {t('chapters.finalBoss')} T{chapter.finalBossTier}
            {totalPrestiges > 0 && <span className="ml-2 text-pink">★{totalPrestiges}</span>}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-1 sm:gap-1.5">
          <button
            onClick={() => setShowProgression(true)}
            className="h-8 w-8 rounded-md border border-cyan/50 bg-cyan/10 text-sm text-cyan sm:h-9 sm:w-9 sm:text-base"
            aria-label="chapter progression"
          >
            {chapter.planetGlyph}
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

      <div className={`mt-1.5 rounded-lg border border-cyan/15 px-2 py-1.5 sm:mt-2 ${lowDensity ? 'bg-black/55' : 'bg-black/25 backdrop-blur-sm'}`}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="truncate font-space text-[7px] uppercase tracking-[0.22em] text-white/45 sm:text-[8px]">
            {t('ui.coreSystems')}
          </span>
          <span className="font-space text-[7px] uppercase tracking-[0.2em] text-cyan/45 sm:text-[8px]">
            {chapter.planetGlyph} T{boss.tier}
          </span>
        </div>
        <div className="-mx-0.5 flex gap-1 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {coreSystems.map((system) => (
            <button
              key={system.key}
              type="button"
              onClick={system.onClick}
              disabled={!system.unlocked}
              title={system.unlocked || !system.requirement ? system.label : t(system.requirement as any)}
              className={`min-w-[76px] flex-1 rounded-md border px-1.5 py-1.5 text-left transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-0 ${
                system.accent === 'pink'
                  ? 'border-pink/35 bg-pink/10 text-pink'
                  : system.accent === 'gold'
                    ? 'border-gold/35 bg-gold/10 text-gold'
                    : system.accent === 'purple'
                      ? 'border-purple/35 bg-purple/10 text-purple'
                      : 'border-cyan/35 bg-cyan/10 text-cyan'
              }`}
              aria-label={system.label}
            >
              <span className="mr-1 inline-block text-[10px] leading-none sm:text-xs">{system.icon}</span>
              <span className="inline-block max-w-[calc(100%-16px)] truncate align-middle font-space text-[8px] uppercase tracking-[0.08em] sm:text-[9px]">
                {system.label}
              </span>
              {!system.unlocked && system.requirement && (
                <span className="mt-0.5 block truncate font-space text-[7px] uppercase tracking-[0.06em] text-white/45">
                  {t(system.requirement as any)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
