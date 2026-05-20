'use client';

import { Background } from './Background';
import { TopBar } from './TopBar';
import { Counter } from './Counter';
import { CombatArena } from './CombatArena';
import { UpgradePanel } from './UpgradePanel';
import { EvolutionOverlay } from './EvolutionOverlay';
import { PrestigeOverlay } from './PrestigeOverlay';
import { SkillTreeModal } from './SkillTreeModal';
import { EventPopup } from './EventPopup';
import { ActiveAbilityBar } from './ActiveAbilityBar';
import { FloatingNumbers } from './FloatingNumbers';
import { SettingsPanel } from './SettingsPanel';
import { StartOverlay } from './StartOverlay';
import { Lightbulb } from './Lightbulb';
import { FactCard } from './FactCard';
import { KnowledgeCodex } from './KnowledgeCodex';
import { AchievementToast } from './AchievementToast';
import { AchievementsModal } from './AchievementsModal';
import { ProgressionPanel } from './ProgressionPanel';
import { ShopModal } from './ShopModal';
import { ChapterCompleteModal } from './ChapterCompleteModal';
import { OfflineReturnModal } from './OfflineReturnModal';
import { ProfileStatsModal } from './ProfileStatsModal';
import { useScreenShake } from '@/lib/hooks/useScreenShake';
import { useGameLoop } from '@/lib/hooks/useGameLoop';
import { useAchievements } from '@/lib/hooks/useAchievements';

export function GameScreen({ locale }: { locale: string }) {
  useGameLoop();
  useAchievements();
  const offset = useScreenShake();

  return (
    <>
      <Background />
      <div
        className="relative z-10 mx-auto max-w-md min-h-screen flex flex-col"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <TopBar />
        <Counter />
        <div className="relative flex-1 flex flex-col">
          <CombatArena />
        </div>
        <UpgradePanel />
        <ActiveAbilityBar />
      </div>
      <FloatingNumbers />
      <Lightbulb />
      <EvolutionOverlay />
      <SkillTreeModal />
      <KnowledgeCodex />
      <PrestigeOverlay />
      <EventPopup />
      <FactCard />
      <AchievementsModal />
      <ProgressionPanel />
      <ProfileStatsModal />
      <ShopModal />
      <ChapterCompleteModal />
      <OfflineReturnModal />
      <AchievementToast />
      <SettingsPanel locale={locale} />
      <StartOverlay />
    </>
  );
}
