'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';
import { UPGRADES, upgradeCost } from '@/lib/config/upgrades';
import { systemUnlocked } from '@/lib/config/systemUnlocks';

const AUTO_DISMISS_MS = 3600;

export function OnboardingHints() {
  const hasStarted = useGame((s) => s.hasStarted);
  const tutorialOpen = useGame((s) => s.showTutorial);
  const activeHintId = useGame((s) => s.activeOnboardingHintId);
  const damacana = useGame((s) => s.damacana);
  const levelIdx = useGame((s) => s.levelIdx);
  const upgrades = useGame((s) => s.upgrades);
  const boss = useGame((s) => s.boss);
  const completedChapters = useGame((s) => s.completedChapters);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const shards = useGame((s) => s.shards);
  const bossPhaseToast = useGame((s) => s.bossPhaseToast);
  const artifactToast = useGame((s) => s.artifactToast);
  const runArtifacts = useGame((s) => s.runArtifacts);
  const permanentArtifacts = useGame((s) => s.permanentArtifacts);
  const trigger = useGame((s) => s.triggerOnboardingHint);
  const dismiss = useGame((s) => s.dismissOnboardingHint);
  const t = useTranslations('onboarding.hints');

  useEffect(() => {
    if (!hasStarted || tutorialOpen) return;
    const availableUpgrade = UPGRADES.some((upgrade) => levelIdx >= upgrade.unlockLevel && damacana >= upgradeCost(upgrade, upgrades[upgrade.id] ?? 0));
    if (availableUpgrade) trigger('firstUpgrade');
  }, [damacana, hasStarted, levelIdx, trigger, tutorialOpen, upgrades]);

  useEffect(() => {
    if (!hasStarted || tutorialOpen) return;
    if (systemUnlocked('abilities', { bossTier: boss.tier, completedChapters, totalPrestiges, shards })) trigger('firstAbility');
  }, [boss.tier, completedChapters, hasStarted, shards, totalPrestiges, trigger, tutorialOpen]);

  useEffect(() => {
    if (!hasStarted || tutorialOpen || !bossPhaseToast) return;
    trigger('firstBossPhase');
  }, [bossPhaseToast, hasStarted, trigger, tutorialOpen]);

  useEffect(() => {
    if (!hasStarted || tutorialOpen) return;
    if (systemUnlocked('prestige', { bossTier: boss.tier, completedChapters, totalPrestiges, shards })) trigger('firstPrestige');
  }, [boss.tier, completedChapters, hasStarted, shards, totalPrestiges, trigger, tutorialOpen]);

  useEffect(() => {
    if (!hasStarted || tutorialOpen) return;
    if (artifactToast || runArtifacts.length + permanentArtifacts.length > 0) trigger('firstArtifact');
  }, [artifactToast, hasStarted, permanentArtifacts.length, runArtifacts.length, trigger, tutorialOpen]);

  useEffect(() => {
    if (!activeHintId) return;
    const id = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [activeHintId, dismiss]);

  return (
    <AnimatePresence>
      {activeHintId && !tutorialOpen && (
        <motion.div
          key={activeHintId}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[58] w-[min(92vw,330px)] -translate-x-1/2 rounded-lg border border-cyan/35 bg-black/86 px-3 py-2 text-center shadow-[0_0_20px_rgba(92,246,255,0.12)]"
        >
          <div className="font-space text-[8px] uppercase tracking-[0.2em] text-cyan/70">{t('kicker')}</div>
          <div className="mt-1 font-space text-[10px] leading-relaxed text-white/75">{t(activeHintId as any)}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
