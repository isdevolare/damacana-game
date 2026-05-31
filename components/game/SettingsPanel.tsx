'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { audio } from '@/lib/audio/AudioEngine';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';
import { systemRequirementKey, systemUnlocked } from '@/lib/config/systemUnlocks';

export function SettingsPanel({ locale }: { locale: string }) {
  const show = useGame((s) => s.showSettings);
  const setShow = useGame((s) => s.setShowSettings);
  const setShowProfile = useGame((s) => s.setShowProfile);
  const setShowCodex = useGame((s) => s.setShowCodex);
  const setShowAchievements = useGame((s) => s.setShowAchievements);
  const setShowShipSkins = useGame((s) => s.setShowShipSkins);
  const boss = useGame((s) => s.boss);
  const completedChapters = useGame((s) => s.completedChapters);
  const totalPrestiges = useGame((s) => s.totalPrestiges);
  const shards = useGame((s) => s.shards);
  const collectedFacts = useGame((s) => s.collectedFacts);
  const audioSettings = useGame((s) => s.audio);
  const set = useGame((s) => s.setAudioSetting);
  const reset = useGame((s) => s.reset);
  const t = useTranslations('ui');
  const router = useRouter();
  const pathname = usePathname();
  const unlockCtx = { bossTier: boss.tier, completedChapters, totalPrestiges, shards };
  const codexUnlocked = collectedFacts.length > 0 || systemUnlocked('codexAdvanced', unlockCtx);

  const apply = (partial: Partial<typeof audioSettings>) => {
    set(partial);
    audio.setSettings(partial);
  };

  const switchLocale = (loc: string) => {
    const current = pathname || '/';
    const stripped = current.replace(/^\/(en|tr)(?=\/|$)/, '') || '/';
    const next = `/${loc}${stripped === '/' ? '' : stripped}`;
    document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=31536000; samesite=lax`;
    setShow(false);
    router.push(next);
  };

  const openUtility = (open: () => void) => {
    setShow(false);
    open();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="max-h-[88dvh] w-full max-w-sm overflow-y-auto rounded-xl border border-purple/50 bg-black/90 p-4 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="font-major text-lg text-purple">{t('settings')}</div>
              <div className="mt-1 font-space text-[9px] uppercase tracking-[0.18em] text-white/35">
                {t('utilityHub')}
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="mb-2 font-space text-[9px] uppercase tracking-[0.2em] text-white/45">
                {t('utilitySystems')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openUtility(() => setShowShipSkins(true))}
                  className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-cyan"
                >
                  {t('shipSkins')}
                </button>
                <button
                  onClick={() => openUtility(() => setShowProfile(true))}
                  className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-cyan"
                >
                  {t('profileStats')}
                </button>
                <button
                  onClick={() => openUtility(() => setShowAchievements(true))}
                  className="rounded-md border border-gold/30 bg-gold/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-gold"
                >
                  {t('achievements')}
                </button>
                <button
                  onClick={() => {
                    if (codexUnlocked) openUtility(() => setShowCodex(true));
                  }}
                  disabled={!codexUnlocked}
                  className="rounded-md border border-purple/30 bg-purple/10 px-2 py-2 text-left font-space text-[10px] uppercase tracking-[0.1em] text-purple disabled:opacity-45"
                >
                  {t('codex')}
                  {codexUnlocked ? null : (
                    <span className="mt-1 block font-space text-[8px] uppercase tracking-[0.14em] text-white/35">
                      {t(systemRequirementKey('codexAdvanced') as any)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="font-space text-[9px] uppercase tracking-[0.2em] text-white/45">
                {t('audio')}
              </div>
              <label className="block">
                <div className="text-[10px] font-space tracking-widest text-white/60 mb-1 flex justify-between">
                  <span>{t('master')}</span>
                  <span>{Math.round(audioSettings.master * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioSettings.master}
                  onChange={(e) => apply({ master: parseFloat(e.target.value) })}
                  className="w-full accent-purple"
                />
              </label>
              <label className="block">
                <div className="text-[10px] font-space tracking-widest text-white/60 mb-1 flex justify-between">
                  <span>{t('music')}</span>
                  <span>{Math.round(audioSettings.music * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioSettings.music}
                  onChange={(e) => apply({ music: parseFloat(e.target.value) })}
                  className="w-full accent-cyan"
                />
              </label>
              <label className="block">
                <div className="text-[10px] font-space tracking-widest text-white/60 mb-1 flex justify-between">
                  <span>{t('sfx')}</span>
                  <span>{Math.round(audioSettings.sfx * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioSettings.sfx}
                  onChange={(e) => apply({ sfx: parseFloat(e.target.value) })}
                  className="w-full accent-pink"
                />
              </label>
              <button
                onClick={() => apply({ muted: !audioSettings.muted })}
                className={`w-full mt-1 text-xs font-space tracking-widest py-2 rounded-md border ${
                  audioSettings.muted ? 'border-danger/60 text-danger bg-danger/10' : 'border-white/20 text-white/80'
                }`}
              >
                {audioSettings.muted ? t('unmute') : t('mute')}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="text-[10px] font-space tracking-widest text-white/60 mb-2">
                {t('language')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`text-xs font-space py-1.5 rounded-md border ${
                      l === locale
                        ? 'border-purple/60 bg-purple/15 text-purple'
                        : 'border-white/20 text-white/70'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="text-[10px] font-space tracking-widest text-white/60">
                {t('performance')}
              </div>
              <div className="mt-1 font-space text-[9px] leading-relaxed text-white/35">
                {t('performanceAuto')}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Reset all progress?')) reset();
                }}
                className="flex-1 text-[10px] font-space tracking-widest py-2 rounded-md border border-danger/50 text-danger/80"
              >
                {t('resetAll')}
              </button>
              <button
                onClick={() => setShow(false)}
                className="flex-1 text-xs font-space tracking-widest py-2 rounded-md border border-white/30 text-white/80"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
