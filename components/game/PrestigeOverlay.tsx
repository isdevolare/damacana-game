'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { BALANCE } from '@/lib/config/balance';
import { fmt } from '@/lib/util';
import { audio } from '@/lib/audio/AudioEngine';

export function PrestigeOverlay() {
  const show = useGame((s) => s.showPrestige);
  const total = useGame((s) => s.totalEarned);
  const setShow = useGame((s) => s.setShowPrestige);
  const prestige = useGame((s) => s.prestige);
  const tree = useGame((s) => s.tree);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('ui');

  if (!show) return null;
  let gain = BALANCE.prestige.shardFormula(total);
  if (tree['guaranteedShards']) gain += 5;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md rounded-xl border border-purple/60 bg-gradient-to-b from-purple/20 to-black p-6 text-center"
        >
          <div className="font-space text-[10px] tracking-[0.4em] text-purple/80 mb-2">
            PRESTIGE
          </div>
          <div className="font-major text-2xl text-pink drop-shadow-[0_0_18px_rgba(255,92,232,0.7)]">
            {t('prestigeTitle')}
          </div>
          <div className="font-space text-sm text-white/70 mt-4">
            {t('prestigeDesc')}
          </div>
          <div className="mt-6 font-vt text-3xl text-gold drop-shadow-[0_0_12px_rgba(255,209,102,0.7)]">
            +{fmt(gain)} ◇
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => setShow(false)}
              className="px-3 py-2 text-xs font-space tracking-wider border border-white/30 text-white/80 rounded-md hover:bg-white/10"
            >
              {t('later')}
            </button>
            <button
              onClick={() => {
                if (sfxEnabled) audio.sfxPrestige();
                prestige();
              }}
              className="px-4 py-2 text-xs font-space tracking-wider border border-pink/60 bg-pink/15 text-pink rounded-md hover:bg-pink/25"
            >
              {t('prestigeNow')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
