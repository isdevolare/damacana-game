'use client';

import { useEffect } from 'react';
import { useGame } from '@/lib/store';
import { ACHIEVEMENTS, NON_TERMINAL_ACHIEVEMENT_IDS } from '@/lib/config/achievements';
import { categoryComplete } from '@/lib/config/facts';

export function useAchievements() {
  const levelIdx = useGame((s) => s.levelIdx);
  const bestLevel = useGame((s) => s.bestLevel);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const bossKillsThisRun = useGame((s) => s.bossKillsThisRun);
  const bossKillsLifetime = useGame((s) => s.bossKillsLifetime);
  const bestBossTier = useGame((s) => s.bestBossTier);
  const collectedFacts = useGame((s) => s.collectedFacts);
  const shards = useGame((s) => s.shards);
  const tree = useGame((s) => s.tree);
  const bestCombo = useGame((s) => s.bestCombo);
  const fastestLevel6Ms = useGame((s) => s.fastestLevel6Ms);
  const voidBurstUses = useGame((s) => s.voidBurstUses);
  const achievements = useGame((s) => s.achievements);
  const unlock = useGame((s) => s.unlockAchievement);

  useEffect(() => {
    const collected = new Set(collectedFacts);
    const unlockedCount = NON_TERMINAL_ACHIEVEMENT_IDS.filter((id) => achievements.includes(id)).length;
    const astate = {
      levelIdx,
      bestLevel,
      totalPrestiges,
      bossKillsThisRun,
      bossKillsLifetime,
      bestBossTier,
      collectedFacts,
      shards,
      treeOwnedCount: Object.values(tree).filter(Boolean).length,
      bestCombo,
      fastestLevel6Ms,
      totalPlayMs: useGame.getState().totalPlayMs,
      voidBurstUses,
      cosmosComplete: categoryComplete('cosmos', collected),
      unlockedCount,
    };
    for (const a of ACHIEVEMENTS) {
      if (!achievements.includes(a.id) && a.check(astate)) {
        unlock(a.id);
      }
    }
  }, [
    levelIdx, bestLevel, totalPrestiges, bossKillsThisRun, bossKillsLifetime,
    bestBossTier, collectedFacts, shards, tree, bestCombo, fastestLevel6Ms,
    voidBurstUses, achievements, unlock,
  ]);
}
