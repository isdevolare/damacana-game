'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { BRANCHES, nodesOfBranch, previousNode, SkillBranch, skillTierRequirementKey, skillTierUnlocked } from '@/lib/config/skillTree';
import { useTranslations } from 'next-intl';
import { clsx } from '@/lib/util';
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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            className="min-h-full p-3 flex flex-col"
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
            <div className="grid grid-cols-2 gap-2 flex-1 sm:grid-cols-4">
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
                      const unlocked = tierOpen && chainOpen;
                      const affordable = !owned && unlocked && shards >= node.cost;
                      const lockText = !tierOpen
                        ? t(skillTierRequirementKey(node.tier) as any)
                        : prev && !tree[prev.id]
                          ? t('requirements.previous')
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
                              {owned ? '✓' : `◇${node.cost}`}
                            </span>
                          </div>
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
