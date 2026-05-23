'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { selectResearchBonuses, useGame } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { fmt } from '@/lib/util';
import { audio } from '@/lib/audio/AudioEngine';
import { nextPrestigeGainTarget, prestigePermanentBonuses, prestigeShardGain } from '@/lib/config/prestige';
import { BALANCE } from '@/lib/config/balance';

export function PrestigeOverlay() {
  const show = useGame((s) => s.showPrestige);
  const total = useGame((s) => s.totalEarned);
  const damacana = useGame((s) => s.damacana);
  const shards = useGame((s) => s.shards);
  const levelIdx = useGame((s) => s.levelIdx);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const setShow = useGame((s) => s.setShowPrestige);
  const prestige = useGame((s) => s.prestige);
  const tree = useGame((s) => s.tree);
  const researchBonuses = useGame(selectResearchBonuses);
  const sfxEnabled = useGame((s) => !s.audio.muted);
  const t = useTranslations('ui');

  if (!show) return null;
  const gain = prestigeShardGain(total, totalPrestiges, researchBonuses.prestigeGainPct, Boolean(tree['guaranteedShards']));
  const nextGainTarget = nextPrestigeGainTarget(total, totalPrestiges, researchBonuses.prestigeGainPct, Boolean(tree['guaranteedShards']));
  const canPrestige = levelIdx >= BALANCE.prestige.requiredLevelIdx && gain > 0;
  const currentBonus = prestigePermanentBonuses(totalPrestiges);
  const nextBonus = prestigePermanentBonuses(totalPrestiges + 1);
  const pct = (value: number) => `+${Math.round(value * 100)}%`;
  const lostItems = ['currency', 'chapter', 'combat', 'buffs'];
  const keptItems = ['research', 'buildTree', 'discoveries', 'prestige', 'future'];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-xl border border-purple/60 bg-gradient-to-b from-purple/20 to-black p-4 text-left shadow-[0_0_42px_rgba(184,122,255,0.18)] sm:p-6"
        >
          <div className="mb-2 flex items-center justify-between gap-3 font-space text-[10px] uppercase tracking-[0.32em] text-purple/80">
            <span>{t('prestigeKicker')}</span>
            <span className="text-gold">★{totalPrestiges}</span>
          </div>
          <div className="font-major text-2xl text-pink drop-shadow-[0_0_18px_rgba(255,92,232,0.7)] sm:text-3xl">
            {t('prestigeTitle')}
          </div>
          <div className="mt-2 max-w-xl font-space text-sm leading-relaxed text-white/72">
            {t('prestigeSubtitle')}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <section className="border-l-2 border-danger/55 bg-danger/5 px-3 py-2.5">
              <div className="font-space text-[9px] uppercase tracking-[0.24em] text-danger">{t('prestigeYouLose')}</div>
              <ul className="mt-2 space-y-1 font-space text-[11px] text-white/65">
                {lostItems.map((item) => <li key={item}>- {t(`prestigeLose.${item}` as any)}</li>)}
              </ul>
            </section>
            <section className="border-l-2 border-cyan/45 bg-cyan/5 px-3 py-2.5">
              <div className="font-space text-[9px] uppercase tracking-[0.24em] text-cyan">{t('prestigeYouKeep')}</div>
              <ul className="mt-2 space-y-1 font-space text-[11px] text-white/65">
                {keptItems.map((item) => <li key={item}>+ {t(`prestigeKeep.${item}` as any)}</li>)}
              </ul>
            </section>
            <section
              className="border-l-2 border-gold/55 bg-gold/5 px-3 py-2.5"
              title={t('prestigeGainTooltip')}
            >
              <div className="font-space text-[9px] uppercase tracking-[0.24em] text-gold">{t('prestigeGain')}</div>
              <div className="mt-2 font-vt text-3xl leading-none text-gold drop-shadow-[0_0_12px_rgba(255,209,102,0.7)]">
                +{fmt(gain)} ◇
              </div>
              <div className="mt-2 font-space text-[10px] leading-relaxed text-white/55">
                {t('prestigeGainDesc')}
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-2 rounded-lg border border-gold/20 bg-gold/5 p-3 sm:grid-cols-3">
            <div>
              <div className="font-space text-[8px] uppercase tracking-[0.2em] text-white/45">{t('prestigeCurrentCurrency')}</div>
              <div className="mt-1 font-vt text-xl text-gold">◇ {fmt(shards)}</div>
            </div>
            <div>
              <div className="font-space text-[8px] uppercase tracking-[0.2em] text-white/45">{t('prestigeAvailableGain')}</div>
              <div className="mt-1 font-vt text-xl text-gold">+{fmt(gain)}</div>
            </div>
            <div>
              <div className="font-space text-[8px] uppercase tracking-[0.2em] text-white/45">{t('prestigeProjectedTotal')}</div>
              <div className="mt-1 font-vt text-xl text-cyan">◇ {fmt(shards + gain)}</div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center justify-between font-space text-[8px] uppercase tracking-[0.18em] text-white/45">
                <span>{t('prestigeNextThreshold', { gain: fmt(nextGainTarget.nextGain) })}</span>
                <span>{fmt(total)} / {fmt(nextGainTarget.nextTotalEarned)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gold shadow-[0_0_12px_rgba(255,209,102,0.7)]"
                  style={{ width: `${Math.round(nextGainTarget.progress * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/35 p-3">
            <div className="flex items-center justify-between gap-3 font-space text-[9px] uppercase tracking-[0.22em] text-white/50">
              <span>{t('prestigeResetCost')}</span>
              <span>{fmt(damacana)} {t('damacana')}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-space text-[10px] text-white/65 sm:grid-cols-4">
              <div>{t('prestigeBonus.production')} <span className="text-cyan">{pct(nextBonus.globalProductionPct)}</span></div>
              <div>{t('prestigeBonus.rewards')} <span className="text-cyan">{pct(nextBonus.rewardGainPct)}</span></div>
              <div>{t('prestigeBonus.hp')} <span className="text-cyan">{pct(nextBonus.maxHpPct)}</span></div>
              <div>{t('prestigeBonus.mana')} <span className="text-cyan">{pct(nextBonus.maxManaPct)}</span></div>
              <div>{t('prestigeBonus.combo')} <span className="text-cyan">{pct(nextBonus.comboRetentionPct)}</span></div>
              <div>{t('prestigeBonus.orbit')} <span className="text-cyan">{pct(nextBonus.orbitDamagePct)}</span></div>
              <div>{t('prestigeBonus.cooldowns')} <span className="text-cyan">{pct(nextBonus.cooldownReductionPct)}</span></div>
              <div>{t('prestigeBonus.current')} <span className="text-white/45">{pct(currentBonus.globalProductionPct)}</span></div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-purple/25 bg-purple/10 p-3 font-space text-[10px] leading-relaxed text-white/55">
            <span className="uppercase tracking-[0.22em] text-purple/80">{t('prestigeFutureHooks')}</span>
            <span className="ml-2">{t('prestigeFutureHooksDesc')}</span>
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-space text-[11px] leading-relaxed text-white/68">
            {t('prestigeDecisionSummary')}
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              onClick={() => setShow(false)}
              className="rounded-md border border-white/20 bg-white/[0.03] px-4 py-2.5 font-space text-xs tracking-wider text-white/82 transition hover:border-cyan/35 hover:bg-cyan/10"
            >
              {t('prestigeContinueRun')}
            </button>
            <button
              onClick={() => {
                if (sfxEnabled) audio.sfxPrestige();
                prestige();
              }}
              disabled={!canPrestige}
              className="rounded-md border border-pink/70 bg-pink/20 px-4 py-2.5 font-space text-xs tracking-wider text-pink shadow-[0_0_22px_rgba(255,92,232,0.18)] transition hover:bg-pink/30 active:scale-[0.98] disabled:border-white/15 disabled:bg-white/[0.03] disabled:text-white/35"
            >
              {t('prestigeResetForPower')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
