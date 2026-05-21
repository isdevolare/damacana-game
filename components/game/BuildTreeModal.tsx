'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMessages, useTranslations } from 'next-intl';
import { useGame } from '@/lib/store';
import { BUILD_BRANCHES, BuildBranch, buildNodesOfBranch, previousBuildNode } from '@/lib/config/buildTree';
import { clsx, fmt } from '@/lib/util';
import { audio } from '@/lib/audio/AudioEngine';

function readMessage(messages: unknown, path: string, fallback: string) {
  let cursor: unknown = messages;
  for (const part of path.split('.')) {
    if (!cursor || typeof cursor !== 'object' || !(part in cursor)) return fallback;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return typeof cursor === 'string' ? cursor : fallback;
}

export function BuildTreeModal() {
  const show = useGame((s) => s.showBuildTree);
  const setShow = useGame((s) => s.setShowBuildTree);
  const owned = useGame((s) => s.ownedBuildNodeIds ?? []);
  const damacana = useGame((s) => s.damacana);
  const shards = useGame((s) => s.shards);
  const buy = useGame((s) => s.buyBuildNode);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const ui = useTranslations('ui');
  const messages = useMessages();
  const buildTreeMessages = (messages as Record<string, unknown>).buildTree;
  const text = (path: string, fallback: string) => readMessage(buildTreeMessages, path, fallback);
  const [branch, setBranch] = useState<BuildBranch>('combo');

  const ownedSet = useMemo(() => new Set(owned), [owned]);
  const activeBranch = BUILD_BRANCHES.find((item) => item.id === branch) ?? BUILD_BRANCHES[0]!;
  const nodes = buildNodesOfBranch(activeBranch.id);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[54] flex items-center justify-center bg-black/86 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.94, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[88dvh] w-full max-w-md overflow-hidden rounded-xl border border-cyan/30 bg-black/95 shadow-[0_0_32px_rgba(92,246,255,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-major text-lg text-cyan">{text('title', 'Build Tree')}</div>
                  <div className="mt-1 font-space text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {text('subtitle', 'Choose a combat identity')}
                  </div>
                </div>
                <div className="shrink-0 text-right font-space text-[10px] uppercase tracking-widest text-white/55">
                  <div>{fmt(damacana)}</div>
                  <div className="text-gold">◇ {fmt(shards)}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-1">
                {BUILD_BRANCHES.map((item) => {
                  const active = item.id === activeBranch.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setBranch(item.id)}
                      className="min-w-0 rounded-md border px-1.5 py-1.5 font-space text-[8px] uppercase tracking-wider"
                      style={{
                        borderColor: active ? item.accent : 'rgba(255,255,255,0.12)',
                        color: active ? item.accent : 'rgba(255,255,255,0.52)',
                        background: active ? `${item.accent}18` : 'rgba(255,255,255,0.03)',
                      }}
                      aria-label={text(`branches.${item.i18nKey}.name`, item.id)}
                    >
                      <div className="text-sm leading-none">{item.symbol}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[64dvh] overflow-y-auto p-4">
              <div
                className="rounded-lg border p-3"
                style={{ borderColor: `${activeBranch.accent}66`, background: `${activeBranch.accent}0f` }}
              >
                <div className="flex items-center gap-2">
                  <div className="font-vt text-2xl" style={{ color: activeBranch.accent }}>{activeBranch.symbol}</div>
                  <div>
                    <div className="font-space text-xs uppercase tracking-[0.18em] text-white">
                      {text(`branches.${activeBranch.i18nKey}.name`, activeBranch.id)}
                    </div>
                    <div className="font-space text-[10px] leading-relaxed text-white/55">
                      {text(`branches.${activeBranch.i18nKey}.identity`, '')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-3 space-y-2">
                <div
                  className="pointer-events-none absolute bottom-8 left-[17px] top-7 w-px"
                  style={{ background: `linear-gradient(${activeBranch.accent}88, rgba(255,255,255,0.04))` }}
                />
                {nodes.map((node) => {
                  const nodeOwned = ownedSet.has(node.id);
                  const prev = previousBuildNode(node);
                  const unlocked = !prev || ownedSet.has(prev.id);
                  const canPay = node.cost.currency === 'shards' ? shards >= node.cost.amount : damacana >= node.cost.amount;
                  const affordable = unlocked && canPay && !nodeOwned;
                  const status = nodeOwned ? 'owned' : unlocked ? 'available' : 'locked';
                  return (
                    <button
                      key={node.id}
                      disabled={!affordable}
                      onClick={() => {
                        if (sfxEnabled) audio.sfxTreeUnlock();
                        buy(node.id);
                      }}
                      className={clsx(
                        'relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition active:scale-[0.99]',
                        nodeOwned
                          ? 'border-gold/55 bg-gold/10'
                          : affordable
                            ? 'bg-white/[0.045]'
                            : 'border-white/10 bg-white/[0.025] opacity-65',
                      )}
                      style={{
                        borderColor: nodeOwned ? 'rgba(255,209,102,0.55)' : affordable ? `${activeBranch.accent}88` : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div
                        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-black font-vt text-sm"
                        style={{ borderColor: nodeOwned ? '#ffd166' : activeBranch.accent, color: nodeOwned ? '#ffd166' : activeBranch.accent }}
                      >
                        {nodeOwned ? '✓' : node.tier}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-space text-[11px] uppercase tracking-[0.16em] text-white">
                            {text(`nodes.${node.i18nKey}.name`, node.id)}
                          </div>
                          <div className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-space text-[8px] uppercase tracking-widest text-white/50">
                            {text(`status.${status}`, status)}
                          </div>
                        </div>
                        <div className="mt-1 font-space text-[10px] leading-relaxed text-white/50">
                          {text(`nodes.${node.i18nKey}.desc`, '')}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 font-space text-[9px] uppercase tracking-widest">
                          <span className="text-cyan">{text(`nodes.${node.i18nKey}.bonus`, '')}</span>
                          <span className={canPay || nodeOwned ? 'text-white/70' : 'text-danger'}>
                            {nodeOwned ? '✓' : `${node.cost.currency === 'shards' ? '◇ ' : ''}${fmt(node.cost.amount)}`}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 p-3">
              <button
                onClick={() => setShow(false)}
                className="w-full rounded-md border border-white/25 py-2 font-space text-xs uppercase tracking-widest text-white/75"
              >
                {ui('close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
