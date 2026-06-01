'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import {
  BRANCHES,
  nodesOfBranch,
  previousNode,
  SkillBranch,
  skillBranchOwnedCount,
  skillBranchRequiredCount,
  skillNodeCost,
  skillTierRequirementKey,
  skillTierUnlocked,
  skillTotalRequiredCount,
  skillTreeSurchargeMultiplier,
} from '@/lib/config/skillTree';
import { useTranslations } from 'next-intl';
import { clsx, fmt } from '@/lib/util';
import { audio } from '@/lib/audio/AudioEngine';

const BRANCH_META: Record<SkillBranch, { color: string; symbol: string; tw: string }> = {
  offense: { color: '#ff3d6e', symbol: '⚔', tw: 'border-danger/50 text-danger' },
  flow:    { color: '#5cf6ff', symbol: '〜', tw: 'border-cyan/50 text-cyan' },
  void:    { color: '#b87aff', symbol: '◇', tw: 'border-purple/50 text-purple' },
  chaos:   { color: '#ff5ce8', symbol: '※', tw: 'border-pink/50 text-pink' },
};

export function SkillTreeModal() {
  const show = useGame((s) => s.showTree);
  const setShow = useGame((s) => s.setShowTree);
  const tree = useGame((s) => s.tree);
  const shards = useGame((s) => s.shards);
  const bossTier = useGame((s) => s.boss.tier);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const buy = useGame((s) => s.buyTreeNode);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('tree');
  const ui = useTranslations('ui');
  const totalOwned = Object.values(tree ?? {}).filter(Boolean).length;
  const surcharge = skillTreeSurchargeMultiplier(totalOwned);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            className="mx-auto flex min-h-full w-full max-w-md flex-col p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:max-w-5xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-major text-lg text-purple">{ui('skillTree')}</div>
                <div className="text-[10px] font-space text-white/60">
                  ◇ <span className="text-gold">{shards}</span> {ui('shards')}
                </div>
                <div className="mt-1 max-w-[260px] text-[9px] font-space uppercase tracking-wider text-white/45">
                  {t('explain')}
                </div>
                {surcharge > 1 && (
                  <div className="mt-1 text-[9px] font-space uppercase tracking-wider text-pink/70">
                    {t('requirements.surcharge', { pct: Math.round((surcharge - 1) * 100) })}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => useGame.setState({ showProgression: true })}
                  className="text-xs font-space border border-pink/50 text-pink px-2 py-1 rounded-md"
                >
                  {ui('progression')}
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="text-xs font-space border border-white/30 px-2 py-1 rounded-md text-white/80"
                >
                  {ui('close')}
                </button>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-4">
              {BRANCHES.map((b) => {
                const meta = BRANCH_META[b];
                const nodes = nodesOfBranch(b);
                return (
                  <div key={b} className="flex flex-col gap-2">
                    <div className={clsx('text-center text-[11px] font-space tracking-widest py-1 border rounded-md', meta.tw)}>
                      {meta.symbol} {t(`${b}.title`)}
                    </div>
                    {nodes.map((node) => {
                      const owned = !!tree[node.id];
                      const prev = previousNode(node);
                      const tierOpen = skillTierUnlocked(node.tier, { bossTier, totalPrestiges });
                      const chainOpen = !prev || tree[prev.id];
                      const branchOwned = skillBranchOwnedCount(tree ?? {}, node.branch);
                      const branchRequired = skillBranchRequiredCount(node.tier);
                      const totalRequired = skillTotalRequiredCount(node.tier);
                      const branchOpen = branchOwned >= branchRequired;
                      const totalOpen = totalOwned >= totalRequired;
                      const cost = skillNodeCost(node, totalOwned);
                      const unlocked = tierOpen && chainOpen && branchOpen && totalOpen;
                      const affordable = !owned && unlocked && shards >= cost;
                      const lockText = !tierOpen
                        ? t(skillTierRequirementKey(node.tier) as any)
                        : prev && !tree[prev.id]
                          ? t('requirements.previous')
                          : !branchOpen
                            ? t('requirements.branchNodes', { current: branchOwned, required: branchRequired })
                            : !totalOpen
                              ? t('requirements.totalNodes', { current: totalOwned, required: totalRequired })
                          : null;
                      return (
                        <button
                          key={node.id}
                          disabled={owned || !affordable}
                          onClick={() => {
                            if (sfxEnabled) audio.sfxTreeUnlock();
                            buy(node.id);
                          }}
                          className={clsx(
                            'rounded-md border p-1.5 text-left transition-all',
                            owned
                              ? 'border-gold/70 bg-gold/15 text-gold'
                              : !unlocked
                              ? 'border-white/10 bg-white/[0.02] opacity-30'
                              : affordable
                              ? 'border-cyan/60 bg-cyan/10 text-white animate-pulse2'
                              : 'border-white/15 bg-white/[0.04] text-white/60',
                          )}
                        >
                          <div className="text-[10px] font-space uppercase tracking-wider">
                            {t(`${b}.${node.id}.name`)}
                          </div>
                          <div className="text-[9px] font-space mt-0.5 text-white/60">
                            {t(`${b}.${node.id}.desc`)}
                          </div>
                          {lockText && (
                            <div className="mt-1 rounded border border-white/10 bg-black/25 px-1.5 py-1 text-[8px] font-space uppercase tracking-wider text-white/45">
                              {lockText}
                            </div>
                          )}
                          <div className="text-[10px] font-vt mt-1 flex justify-between">
                            <span>T{node.tier}</span>
                            <span className={owned ? 'text-gold' : 'text-cyan'}>
                              {owned ? '✓' : `◇${fmt(cost)}`}
                            </span>
                          </div>
                          {!owned && (
                            <div className="mt-0.5 text-[8px] font-space uppercase tracking-wider text-white/35">
                              {t('requirements.shards', { current: fmt(shards), required: fmt(cost) })}
                            </div>
                          )}
                          <div className={clsx(
                            'mt-1 text-[8px] font-space uppercase tracking-wider',
                            owned ? 'text-gold' : affordable ? 'text-cyan' : 'text-white/35',
                          )}>
                            {owned ? ui('owned') : affordable ? ui('unlocked') : ui('locked')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
