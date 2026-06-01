'use client';

import { useEffect, useState } from 'react';
import { Background } from './Background';
import { TopBar } from './TopBar';
import { Counter } from './Counter';
import { CombatArena } from './CombatArena';
import { AnomalyEffectsHud } from './AnomalyEffectsHud';
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
import { ResearchLabModal } from './ResearchLabModal';
import { ResearchToast } from './ResearchToast';
import { BuildTreeModal } from './BuildTreeModal';
import { ArtifactInventoryModal } from './ArtifactInventoryModal';
import { AscensionModal } from './AscensionModal';
import { ShipSkinsModal } from './ShipSkinsModal';
import { AudioUnlockPrompt } from './AudioUnlockPrompt';
import { PowerToast } from './PowerToast';
import { ArtifactToast } from './ArtifactToast';
import { TutorialOverlay } from './TutorialOverlay';
import { OnboardingHints } from './OnboardingHints';
import { useScreenShake } from '@/lib/hooks/useScreenShake';
import { useGameLoop } from '@/lib/hooks/useGameLoop';
import { useAchievements } from '@/lib/hooks/useAchievements';

export function GameScreen({ locale }: { locale: string }) {
  useGameLoop();
  useAchievements();
  const offset = useScreenShake();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${Math.max(320, Math.floor(height))}px`);
      const standaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setStandalone(standaloneMode);
      document.documentElement.dataset.displayMode = standaloneMode ? 'standalone' : 'browser';
    };
    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return (
    <>
      <Background />
      <div
        className="relative z-10 mx-auto flex w-full max-w-md flex-col overflow-hidden"
        data-standalone={standalone ? 'true' : 'false'}
        style={{
          height: 'var(--app-height, 100dvh)',
          minHeight: 'var(--app-height, 100dvh)',
          maxHeight: 'var(--app-height, 100dvh)',
          paddingTop: 'env(safe-area-inset-top)',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <TopBar />
        <Counter />
        <AnomalyEffectsHud />
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
      <ResearchLabModal />
      <BuildTreeModal />
      <ArtifactInventoryModal />
      <AscensionModal />
      <ShipSkinsModal />
      <ShopModal />
      <ChapterCompleteModal />
      <OfflineReturnModal />
      <ResearchToast />
      <AchievementToast />
      <PowerToast />
      <ArtifactToast />
      <OnboardingHints />
      <TutorialOverlay />
      <SettingsPanel locale={locale} />
      <AudioUnlockPrompt />
      <StartOverlay />
    </>
  );
}
