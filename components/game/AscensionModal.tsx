'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useGame, selectAscensionContext, selectAscensionGain, selectCanAscend } from '@/lib/store';
import { ASCENSION_UPGRADES, REALITY_MODIFIER_HOOKS, ascensionUnlocked, ascensionUpgradeCost, nextAscensionPointTarget } from '@/lib/config/ascension';
import { fmt } from '@/lib/util';

export function AscensionModal() {
  const show = useGame((s) => s.showAscension);
  const setShow = useGame((s) => s.setShowAscension);
  const ascend = useGame((s) => s.ascend);
  const buyUpgrade = useGame((s) => s.buyAscensionUpgrade);
  const ascensionPoints = useGame((s) => s.ascensionPoints ?? 0);
  const totalAscensions = useGame((s) => s.totalAscensions ?? 0);
  const upgradeLevels = useGame((s) => s.ascensionUpgradeLevels ?? {});
  const context = useGame(selectAscensionContext);
  const gain = useGame(selectAscensionGain);
  const canAscend = useGame(selectCanAscend);
  const t = useTranslations();

  const unlocked = ascensionUnlocked(context);
  const target = nextAscensionPointTarget(context);
  const progress = Math.max(0, Math.min(1, target.progress));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl border border-pink/50 bg-black/95 p-4 shadow-[0_0_40px_rgba(255,92,232,0.18)] sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-space text-[9px] uppercase tracking-[0.28em] text-pink/70">
                  {t('ascension.kicker')}
                </div>
                <div className="mt-1 font-major text-xl text-pink">
                  {t('ascension.title')}
                </div>
                <div className="mt-1 font-space text-[10px] leading-relaxed text-white/55">
                  {t('ascension.subtitle')}
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="rounded-md border border-white/20 px-2 py-1 font-space text-xs text-white/70"
              >
                {t('ui.close')}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-pink/25 bg-pink/10 p-2">
                <div className="font-space text-[8px] uppercase tracking-[0.18em] text-white/45">{t('ascension.ap')}</div>
                <div className="mt-1 font-vt text-xl text-pink">{fmt(ascensionPoints)}</div>
              </div>
              <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-2">
                <div className="font-space text-[8px] uppercase tracking-[0.18em] text-white/45">{t('ascension.available')}</div>
                <div className="mt-1 font-vt text-xl text-cyan">+{fmt(gain)}</div>
              </div>
              <div className="rounded-lg border border-purple/25 bg-purple/10 p-2">
                <div className="font-space text-[8px] uppercase tracking-[0.18em] text-white/45">{t('ascension.count')}</div>
                <div className="mt-1 font-vt text-xl text-purple">{fmt(totalAscensions)}</div>
              </div>
            </div>

            {!unlocked && (
              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="font-space text-[9px] uppercase tracking-[0.22em] text-white/45">
                  {t('ascension.locked')}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-pink" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="mt-2 font-space text-[10px] leading-relaxed text-white/55">
                  {t('ascension.unlockRequirement')}
                </div>
              </div>
            )}

            <div className="mt-3 rounded-lg border border-danger/25 bg-danger/10 p-3">
              <div className="font-space text-[9px] uppercase tracking-[0.24em] text-danger/80">
                {t('ascension.resetSummary')}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-space text-[9px] leading-relaxed text-white/55">
                <div>
                  <div className="mb-1 text-danger/80">{t('ascension.youLose')}</div>
                  {['run', 'chapters', 'prestige', 'systems'].map((key) => (
                    <div key={key}>- {t(`ascension.lose.${key}` as any)}</div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 text-cyan/80">{t('ascension.youKeep')}</div>
                  {['ap', 'upgrades', 'discoveries', 'achievements', 'permanent'].map((key) => (
                    <div key={key}>+ {t(`ascension.keep.${key}` as any)}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 font-space text-[9px] uppercase tracking-[0.22em] text-white/45">
                {t('ascension.upgrades')}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ASCENSION_UPGRADES.map((upgrade) => {
                  const level = upgradeLevels[upgrade.id] ?? 0;
                  const maxed = level >= upgrade.maxLevel;
                  const cost = ascensionUpgradeCost(upgrade.id, level);
                  const affordable = ascensionPoints >= cost && !maxed;
                  return (
                    <button
                      key={upgrade.id}
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={!affordable}
                      className="rounded-lg border bg-white/[0.03] p-2 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
                      style={{ borderColor: `${upgrade.accent}55` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-space text-[10px] uppercase tracking-[0.1em]" style={{ color: upgrade.accent }}>
                          {upgrade.icon} {t(`ascension.upgrade.${upgrade.i18nKey}.name` as any)}
                        </div>
                        <div className="font-vt text-sm text-white/70">{level}/{upgrade.maxLevel}</div>
                      </div>
                      <div className="mt-1 font-space text-[9px] leading-relaxed text-white/50">
                        {t(`ascension.upgrade.${upgrade.i18nKey}.desc` as any)}
                      </div>
                      <div className="mt-1 flex items-center justify-between font-space text-[9px] text-white/45">
                        <span>{t(`ascension.upgrade.${upgrade.i18nKey}.bonus` as any)}</span>
                        <span className={affordable ? 'text-pink' : 'text-white/35'}>
                          {maxed ? t('ascension.maxed') : `${fmt(cost)} AP`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] p-2.5">
              <div className="font-space text-[9px] uppercase tracking-[0.22em] text-white/45">
                {t('ascension.modifierHooks')}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REALITY_MODIFIER_HOOKS.map((hook) => (
                  <span key={hook} className="rounded border border-white/10 bg-black/35 px-1.5 py-0.5 font-space text-[8px] uppercase tracking-[0.08em] text-white/45">
                    {t(`ascension.hooks.${hook}` as any)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-pink/25 bg-pink/10 p-3">
              <div className="font-space text-[10px] leading-relaxed text-white/65">
                {unlocked ? t('ascension.decisionSummary') : t('ascension.lockedSummary')}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShow(false)}
                  className="rounded-md border border-white/20 px-3 py-2 font-space text-[10px] uppercase tracking-[0.14em] text-white/70"
                >
                  {t('ascension.continue')}
                </button>
                <button
                  onClick={ascend}
                  disabled={!canAscend}
                  className="rounded-md border border-pink/60 bg-pink/20 px-3 py-2 font-space text-[10px] uppercase tracking-[0.14em] text-pink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('ascension.reset')} +{fmt(gain)} AP
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
